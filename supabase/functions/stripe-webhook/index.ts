
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the request header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16', // Use your preferred API version
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse the webhook payload
    const payload = await req.text();
    
    // Verify the webhook signature using the async method
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || '';
    
    console.log('Received webhook with signature:', signature.substring(0, 10) + '...');
    console.log('Using webhook secret:', webhookSecret ? 'Configured (not showing for security)' : 'Not configured');
    
    let event;
    
    try {
      // Use constructEventAsync instead of constructEvent
      event = await stripe.webhooks.constructEventAsync(
        payload, 
        signature, 
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

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
            .select('status, subscription_id')
            .eq('subscription_id', subscriptionId)
            .maybeSingle();
            
          if (subIdQueryError) {
            console.error('Error checking for existing subscription by ID:', subIdQueryError);
            throw subIdQueryError;
          }
          
          // Define valid active statuses
          const validStatuses = ['active', 'trialing', 'paid'];
          
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
            
            const subscriptionData = {
              subscription_id: subscriptionId,
              customer_id: customerId,
              status: status,
              user_id: userId || '',
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
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
