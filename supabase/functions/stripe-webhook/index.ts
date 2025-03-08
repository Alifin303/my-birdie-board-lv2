
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers for preflight requests - ensure we include stripe-signature
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify that required environment variables are set
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SIGNING_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !Deno.env.get(varName));

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

serve(async (req) => {
  console.log(`Received ${req.method} request to stripe-webhook endpoint from ${req.headers.get('user-agent') || 'unknown source'}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400', // 24 hours caching for preflight
      } 
    });
  }

  // Verify it's a POST request
  if (req.method !== 'POST') {
    console.error(`Invalid method: ${req.method}. Webhook only accepts POST requests.`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Log all headers for debugging (but redact sensitive information)
    const allHeaders = Object.fromEntries([...req.headers]);
    console.log('Request headers:', JSON.stringify(Object.keys(allHeaders)));
    
    // Get the signature from the request header
    const signature = req.headers.get('stripe-signature');
    console.log('Stripe-Signature header present:', !!signature);
    
    if (!signature) {
      console.error('Missing stripe-signature header in the request');
      
      // Check if there's an authorization header (might be using the wrong authentication method)
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        console.log('Request has authorization header but not stripe-signature');
      }
      
      return new Response(JSON.stringify({ 
        error: 'Missing stripe-signature header',
        message: 'The Stripe webhook requires a stripe-signature header to verify authenticity'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe with your secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse the webhook payload
    const payload = await req.text();
    console.log('Webhook payload size:', payload.length, 'bytes');
    
    // Verify the webhook signature using the async method
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SIGNING_SECRET environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing STRIPE_WEBHOOK_SIGNING_SECRET' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Received webhook with signature hash:', signature.substring(0, 10) + '...');
    console.log('Webhook secret is configured and will be used for verification');
    
    let event;
    
    try {
      // Use constructEventAsync instead of constructEvent
      event = await stripe.webhooks.constructEventAsync(
        payload, 
        signature, 
        webhookSecret
      );
      console.log(`Successfully verified Stripe event: ${event.type} with ID: ${event.id}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      console.error(`Error details: ${JSON.stringify(err)}`);
      
      // Log extra debugging information
      if (err.type === 'StripeSignatureVerificationError') {
        console.error('Signature verification failed. This could be due to:');
        console.error('1. Incorrect webhook signing secret');
        console.error('2. Request timing out (too old)');
        console.error('3. Signature mismatch');
      }
      
      return new Response(JSON.stringify({ 
        error: `Webhook signature verification failed: ${err.message}`,
        type: err.type || 'Unknown'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.pending':
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer;
        const userId = subscription.metadata?.user_id;
        const status = subscription.status;
        
        // Get additional subscription details
        const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
        const currentPeriodEnd = subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null;
        
        console.log(`Processing subscription: ${subscriptionId}, status: ${status}, for user: ${userId}`);
        console.log(`Subscription details: cancel_at_period_end: ${cancelAtPeriodEnd}, current_period_end: ${currentPeriodEnd}`);
        
        // Critical fix: Only update the subscription status if it's not downgrading from active/trialing/paid to incomplete
        try {
          // First check if we have an existing record with this subscription ID
          const { data: existingBySubId, error: subIdQueryError } = await supabase
            .from('customer_subscriptions')
            .select('status, subscription_id, user_id')
            .eq('subscription_id', subscriptionId)
            .maybeSingle();
            
          if (subIdQueryError) {
            console.error('Error checking for existing subscription by ID:', subIdQueryError);
            throw subIdQueryError;
          }
          
          // Define valid active statuses
          const validStatuses = ['active', 'trialing', 'paid'];
          
          // Check if the user ID exists in the metadata but is missing in the database record
          // This is critical for fixing the issue where user_id might be empty in the subscription record
          if (existingBySubId && userId && !existingBySubId.user_id) {
            console.log(`Found subscription ${subscriptionId} without user_id. Adding user_id: ${userId}`);
            
            const { error: updateUserIdError } = await supabase
              .from('customer_subscriptions')
              .update({ 
                user_id: userId,
                updated_at: new Date().toISOString()
              })
              .eq('subscription_id', subscriptionId);
              
            if (updateUserIdError) {
              console.error('Error updating subscription with user_id:', updateUserIdError);
              throw updateUserIdError;
            }
            
            console.log(`Successfully updated subscription ${subscriptionId} with user_id: ${userId}`);
          }
          
          // CRITICAL FIX: Don't downgrade active subscriptions to incomplete status
          // Only update if:
          // 1. No existing subscription OR
          // 2. The new status is a valid active status OR
          // 3. The existing status is not already a valid active status
          const shouldUpdate = !existingBySubId || 
                               validStatuses.includes(status) || 
                               (existingBySubId && !validStatuses.includes(existingBySubId.status));
          
          if (existingBySubId && validStatuses.includes(existingBySubId.status) && !validStatuses.includes(status)) {
            console.log(`Preventing downgrade of subscription ${subscriptionId} from ${existingBySubId.status} to ${status}`);
            break; // Skip the update to prevent downgrading an active subscription
          }
          
          // If we have a user_id in the metadata but not in the existing record, check if the user already has a subscription record
          if (userId && !existingBySubId) {
            console.log(`Checking for existing subscription for user: ${userId}`);
            
            const { data: existingByUserId, error: userIdQueryError } = await supabase
              .from('customer_subscriptions')
              .select()
              .eq('user_id', userId)
              .maybeSingle();
              
            if (userIdQueryError) {
              console.error('Error checking for existing subscription by user ID:', userIdQueryError);
              throw userIdQueryError;
            }
            
            if (existingByUserId) {
              console.log(`User ${userId} already has a subscription record. Updating it.`);
              
              // Only update if we're not downgrading from an active status to an inactive one
              if (validStatuses.includes(existingByUserId.status) && !validStatuses.includes(status)) {
                console.log(`Preventing downgrade of user ${userId} subscription from ${existingByUserId.status} to ${status}`);
                break; // Skip the update
              }
              
              // Update the existing record with the new subscription ID
              const { error: updateError } = await supabase
                .from('customer_subscriptions')
                .update({
                  subscription_id: subscriptionId,
                  customer_id: customerId,
                  status: status,
                  cancel_at_period_end: cancelAtPeriodEnd,
                  current_period_end: currentPeriodEnd,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
                
              if (updateError) {
                console.error('Error updating subscription for existing user:', updateError);
                throw updateError;
              }

              console.log(`Updated subscription for user: ${userId}, new status: ${status}`);
              break; // Exit early since update was successful
            }
          }
          
          // If we found an existing record by subscription ID, update it
          if (existingBySubId && shouldUpdate) {
            console.log(`Found existing subscription record with ID: ${subscriptionId}. Updating it to status: ${status}`);
            
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                status: status,
                cancel_at_period_end: cancelAtPeriodEnd,
                current_period_end: currentPeriodEnd,
                updated_at: new Date().toISOString(),
                // Update user_id if it was missing before
                ...(userId && !existingBySubId.user_id ? { user_id: userId } : {})
              })
              .eq('subscription_id', subscriptionId);
              
            if (updateError) {
              console.error('Error updating existing subscription:', updateError);
              throw updateError;
            }
            
            console.log(`Successfully updated subscription: ${subscriptionId} to status: ${status}`);
          } else if (customerId && subscriptionId && !existingBySubId) {
            // Insert new subscription if no existing record was found
            console.log(`No existing subscription found. Creating new record with status: ${status}`);
            
            // CRITICAL FIX: Ensure user_id is never empty when creating a new record
            if (!userId) {
              console.error('Cannot create subscription record without user_id');
              return new Response(JSON.stringify({ error: 'Missing user_id in subscription metadata' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            const subscriptionData = {
              subscription_id: subscriptionId,
              customer_id: customerId,
              status: status,
              user_id: userId,
              cancel_at_period_end: cancelAtPeriodEnd,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            };
            
            console.log('Inserting new subscription record:', JSON.stringify(subscriptionData));
            
            const { error: insertError } = await supabase
              .from('customer_subscriptions')
              .insert(subscriptionData);
              
            if (insertError) {
              console.error('Error inserting new subscription:', insertError);
              throw insertError;
            }
            
            console.log(`Successfully created new subscription record for: ${subscriptionId}`);
          } else {
            console.log('No update needed or missing required data for subscription record');
          }
        } catch (dbError) {
          console.error('Database error processing subscription:', dbError);
          return new Response(JSON.stringify({ error: dbError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log(`Subscription deleted: ${deletedSubscription.id}`);
        
        // Update the subscription status to 'canceled'
        const { error: deleteError } = await supabase
          .from('customer_subscriptions')
          .update({ 
            status: 'canceled', 
            updated_at: new Date().toISOString(),
            cancel_at_period_end: true,
            current_period_end: deletedSubscription.current_period_end ? 
              new Date(deletedSubscription.current_period_end * 1000).toISOString() : null
          })
          .eq('subscription_id', deletedSubscription.id);
          
        if (deleteError) {
          console.error('Error updating deleted subscription:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        console.log(`Successfully marked subscription ${deletedSubscription.id} as canceled with period end: ${deletedSubscription.current_period_end}`);
        break;
        
      case 'invoice.payment_succeeded':
        // For invoice events, ensure we mark the subscription as active
        const invoiceObject = event.data.object;
        console.log(`Processing invoice: ${invoiceObject.id}, subscription: ${invoiceObject.subscription}`);
        
        if (invoiceObject.subscription) {
          // Get the subscription details
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(invoiceObject.subscription);
            const subId = stripeSubscription.id;
            const custId = stripeSubscription.customer;
            const uId = stripeSubscription.metadata?.user_id;
            
            // Force status to active for successful payments
            const subStatus = 'active';
            
            // Get additional subscription details
            const cancelAtEnd = stripeSubscription.cancel_at_period_end || false;
            const periodEnd = stripeSubscription.current_period_end ? 
              new Date(stripeSubscription.current_period_end * 1000).toISOString() : null;
            
            console.log(`Retrieved subscription after successful payment: ${subId}, setting status to: ${subStatus}, for user: ${uId}`);
            console.log(`Payment details: cancel_at_period_end: ${cancelAtEnd}, current_period_end: ${periodEnd}`);
            
            // CRITICAL FIX: Ensure the user ID is correctly associated with the subscription
            // First check if there's a subscription record with this ID
            const { data: existingSub, error: checkError } = await supabase
              .from('customer_subscriptions')
              .select('user_id, status')
              .eq('subscription_id', subId)
              .maybeSingle();
              
            if (checkError) {
              console.error('Error checking existing subscription:', checkError);
              throw checkError;
            }
            
            // If user_id is missing in the record but present in metadata, update it
            if (existingSub && !existingSub.user_id && uId) {
              console.log(`Fixing subscription ${subId} by adding missing user_id: ${uId}`);
              
              const { error: fixUserIdError } = await supabase
                .from('customer_subscriptions')
                .update({ 
                  user_id: uId,
                  updated_at: new Date().toISOString()
                })
                .eq('subscription_id', subId);
                
              if (fixUserIdError) {
                console.error('Error fixing user_id in subscription:', fixUserIdError);
                throw fixUserIdError;
              }
              
              console.log(`Successfully fixed user_id for subscription ${subId}`);
            }
            
            // Update the subscription status to active in our database
            const { error: paymentUpdateError } = await supabase
              .from('customer_subscriptions')
              .update({ 
                status: subStatus,
                cancel_at_period_end: cancelAtEnd,
                current_period_end: periodEnd,
                updated_at: new Date().toISOString()
              })
              .eq('subscription_id', subId);
              
            if (paymentUpdateError) {
              console.error('Error updating subscription after successful payment:', paymentUpdateError);
              throw paymentUpdateError;
            }
            
            console.log(`Successfully updated subscription ${subId} to active status after payment`);
          } catch (err) {
            console.error(`Error updating subscription after payment: ${err.message}`);
            throw err;
          }
        } else {
          console.log('Invoice has no subscription, skipping');
        }
        break;
        
      // FIXING INCOMPLETE SUBSCRIPTIONS
      case 'invoice.payment_failed':
        // When payment fails, we should still track it but not downgrade an active subscription
        const failedInvoice = event.data.object;
        console.log(`Processing failed payment invoice: ${failedInvoice.id}, subscription: ${failedInvoice.subscription}`);
        
        if (failedInvoice.subscription) {
          try {
            // Get the subscription details
            const stripeSubscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
            
            // Log the subscription status from Stripe
            console.log(`Stripe subscription status: ${stripeSubscription.status}`);
            
            // Check our database for this subscription
            const { data: dbSubscription, error: fetchError } = await supabase
              .from('customer_subscriptions')
              .select('status, user_id')
              .eq('subscription_id', failedInvoice.subscription)
              .maybeSingle();
              
            if (fetchError) {
              console.error('Error fetching subscription for failed payment:', fetchError);
              throw fetchError;
            }
            
            console.log(`Database subscription status: ${dbSubscription?.status || 'not found'}`);
            
            // If Stripe says it's active but our DB says incomplete, fix it
            if (stripeSubscription.status === 'active' && dbSubscription?.status === 'incomplete') {
              console.log(`Fixing incorrect incomplete status for subscription: ${failedInvoice.subscription}`);
              
              const { error: fixStatusError } = await supabase
                .from('customer_subscriptions')
                .update({ 
                  status: 'active',
                  updated_at: new Date().toISOString()
                })
                .eq('subscription_id', failedInvoice.subscription);
                
              if (fixStatusError) {
                console.error('Error fixing subscription status:', fixStatusError);
                throw fixStatusError;
              }
              
              console.log(`Successfully fixed subscription status to active`);
            }
          } catch (err) {
            console.error(`Error processing failed payment: ${err.message}`);
            throw err;
          }
        }
        break;
        
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired':
      case 'customer.subscription.trial_will_end':
        // Handle other subscription events
        console.log(`Received event ${event.type}, processing subscription update`);
        const subObject = event.data.object;
        
        if (subObject && subObject.id) {
          try {
            // Get the latest subscription data from Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(subObject.id);
            
            const subData = {
              status: stripeSubscription.status,
              cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
              current_period_end: stripeSubscription.current_period_end ? 
                new Date(stripeSubscription.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString()
            };
            
            console.log(`Updating subscription ${subObject.id} with latest data:`, JSON.stringify(subData));
            
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update(subData)
              .eq('subscription_id', subObject.id);
              
            if (updateError) {
              console.error(`Error updating subscription on ${event.type}:`, updateError);
              throw updateError;
            }
            
            console.log(`Successfully updated subscription ${subObject.id} from ${event.type} event`);
          } catch (err) {
            console.error(`Error processing ${event.type} event:`, err);
            throw err;
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a successful response
    console.log('Successfully processed webhook event');
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack,
      type: err.type || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
