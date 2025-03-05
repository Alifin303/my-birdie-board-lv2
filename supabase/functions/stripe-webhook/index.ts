
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
      case 'customer.subscription.pending': // Added to handle pending subscriptions
      case 'invoice.payment_succeeded': // Added to handle successful payments
        const subscription = event.data.object;
        let subscriptionId, customerId, userId, status;

        if (event.type === 'invoice.payment_succeeded') {
          // For invoice events, we need to get the subscription ID from the invoice
          const invoiceObject = subscription;
          console.log(`Processing invoice: ${invoiceObject.id}, subscription: ${invoiceObject.subscription}`);
          
          if (invoiceObject.subscription) {
            // Get the subscription details
            try {
              const stripeSubscription = await stripe.subscriptions.retrieve(invoiceObject.subscription);
              subscriptionId = stripeSubscription.id;
              customerId = stripeSubscription.customer;
              userId = stripeSubscription.metadata?.user_id;
              status = stripeSubscription.status;
              
              console.log(`Retrieved subscription: ${subscriptionId}, status: ${status}, for user: ${userId}`);
            } catch (err) {
              console.error(`Error retrieving subscription for invoice: ${err.message}`);
              throw err;
            }
          } else {
            console.log('Invoice has no subscription, skipping');
            break;
          }
        } else {
          // For subscription events
          subscriptionId = subscription.id;
          customerId = subscription.customer;
          userId = subscription.metadata?.user_id;
          status = subscription.status;
          
          console.log(`Processing subscription: ${subscriptionId}, status: ${status}, for user: ${userId}`);
        }
        
        // If we don't have a subscription ID, we can't do anything
        if (!subscriptionId) {
          console.log('No subscription ID, skipping');
          break;
        }
        
        try {
          // First check if we have an existing record with this subscription ID
          const { data: existingBySubId, error: subIdQueryError } = await supabase
            .from('customer_subscriptions')
            .select()
            .eq('subscription_id', subscriptionId)
            .maybeSingle();
            
          if (subIdQueryError) {
            console.error('Error checking for existing subscription by ID:', subIdQueryError);
            throw subIdQueryError;
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
              // Update the existing record with the new subscription ID
              const { error: updateError } = await supabase
                .from('customer_subscriptions')
                .update({
                  subscription_id: subscriptionId,
                  customer_id: customerId,
                  status: status,
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
          if (existingBySubId) {
            console.log(`Found existing subscription record with ID: ${subscriptionId}. Updating it to status: ${status}`);
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                status: status,
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
          } else if (customerId && subscriptionId) {
            // Insert new subscription if no existing record was found
            console.log(`No existing subscription found. Creating new record with status: ${status}`);
            
            const subscriptionData = {
              subscription_id: subscriptionId,
              customer_id: customerId,
              status: status,
              user_id: userId || '',
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
            console.log('Missing required data for subscription record, skipping');
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
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('subscription_id', deletedSubscription.id);
          
        if (deleteError) {
          console.error('Error updating deleted subscription:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        console.log(`Successfully marked subscription ${deletedSubscription.id} as canceled`);
        break;
        
      // Add more event types as needed
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
