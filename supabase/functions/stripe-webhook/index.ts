
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4?target=deno";

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// You should not expose the service role key in production.
// This is for demonstration purposes only.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    console.log("Received webhook request");
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders
      });
    }
    
    // Get the Stripe secret key and webhook secret from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing Stripe secret key' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing webhook secret' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
    
    const sig = req.headers.get('stripe-signature');
    
    if (!sig) {
      console.error("Missing stripe-signature header");
      return new Response(JSON.stringify({ 
        error: 'Missing stripe-signature header' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get the raw body
    const body = await req.text();
    console.log(`Webhook body length: ${body.length} bytes`);
    
    let event;
    
    try {
      console.log(`Constructing event with signature: ${sig.substring(0, 20)}... and secret starting with: ${endpointSecret.substring(0, 5)}...`);
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      console.log(`Webhook event verified. Event type: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({
        error: `Webhook signature verification failed: ${err.message}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          console.log(`Checkout session completed: ${session.id}`);
          
          // Check if this is a subscription checkout
          if (session.mode === 'subscription' && session.subscription) {
            console.log(`Associated subscription: ${session.subscription}`);
            
            // Retrieve the subscription to get more details
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log(`Retrieved subscription: ${subscription.id}, status: ${subscription.status}`);
            
            // Get the customer information
            const customerId = session.customer;
            
            try {
              // Verify the customer exists
              const customer = await stripe.customers.retrieve(customerId);
              console.log(`Customer verification successful: ${customerId}`);
              
              if (customer.deleted === true) {
                console.error(`Customer ${customerId} has been deleted, cannot update subscription`);
                throw new Error(`Customer ${customerId} has been deleted`);
              }
              
              // Update our database to reflect the new subscription
              const { data: customerData, error: customerError } = await supabase
                .from('customer_subscriptions')
                .select('*')
                .eq('customer_id', customerId)
                .maybeSingle();
                
              if (customerError) {
                console.error(`Error fetching customer data: ${customerError.message}`);
                throw customerError;
              }
              
              if (!customerData) {
                console.error(`No customer subscription record found for Stripe customer: ${customerId}`);
                throw new Error(`No customer subscription record found for Stripe customer: ${customerId}`);
              }
              
              console.log(`Updating subscription for user: ${customerData.user_id}`);
              
              // Update the subscription record
              const { error: updateError } = await supabase
                .from('customer_subscriptions')
                .update({
                  subscription_id: subscription.id,
                  status: subscription.status,
                  updated_at: new Date().toISOString()
                })
                .eq('id', customerData.id);
                
              if (updateError) {
                console.error(`Error updating subscription record: ${updateError.message}`);
                throw updateError;
              }
              
              console.log(`Successfully updated subscription record for user: ${customerData.user_id}`);
            } catch (customerRetrieveError) {
              console.error(`Error processing checkout.session.completed: ${customerRetrieveError.message}`);
              
              // If customer deleted, update our database to reflect this
              if (customerRetrieveError.message.includes('has been deleted')) {
                try {
                  const { data: customerData, error: customerError } = await supabase
                    .from('customer_subscriptions')
                    .select('*')
                    .eq('customer_id', customerId)
                    .maybeSingle();
                    
                  if (!customerError && customerData) {
                    const { error: updateError } = await supabase
                      .from('customer_subscriptions')
                      .update({
                        status: 'customer_deleted',
                        subscription_id: null,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', customerData.id);
                      
                    if (updateError) {
                      console.error(`Error updating customer status to deleted: ${updateError.message}`);
                    } else {
                      console.log(`Updated customer status to deleted for customer: ${customerId}`);
                    }
                  }
                } catch (dbErr) {
                  console.error(`Failed to update customer_deleted status: ${dbErr.message}`);
                }
              }
            }
          } else {
            console.log(`Not a subscription checkout or missing subscription ID. Mode: ${session.mode}`);
          }
          break;
        }
          
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
          
          try {
            // Try to get customer details
            const customer = await stripe.customers.retrieve(subscription.customer);
            
            // Handle deleted customer
            if (customer.deleted === true) {
              console.log(`Customer ${subscription.customer} has been deleted, proceeding with subscription update using customer_id`);
            } else {
              console.log(`Customer ${subscription.customer} is valid, proceeding with subscription update`);
            }
            
            // Update our database to reflect the updated subscription
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('customer_subscriptions')
              .select('*')
              .eq('subscription_id', subscription.id)
              .maybeSingle();
              
            if (subscriptionError) {
              console.error(`Error fetching subscription data: ${subscriptionError.message}`);
              throw subscriptionError;
            }
            
            if (!subscriptionData) {
              // Try to find by customer id instead
              console.log(`No subscription record found with ID ${subscription.id}, checking by customer ID: ${subscription.customer}`);
              
              const { data: customerData, error: customerError } = await supabase
                .from('customer_subscriptions')
                .select('*')
                .eq('customer_id', subscription.customer)
                .maybeSingle();
                
              if (customerError) {
                console.error(`Error fetching customer data: ${customerError.message}`);
                throw customerError;
              }
              
              if (!customerData) {
                console.error(`No customer record found for Stripe customer: ${subscription.customer}`);
                throw new Error(`No customer record found for Stripe customer: ${subscription.customer}`);
              }
              
              // Update the subscription record with the subscription ID and status
              const { error: updateError } = await supabase
                .from('customer_subscriptions')
                .update({
                  subscription_id: subscription.id,
                  status: subscription.status,
                  updated_at: new Date().toISOString()
                })
                .eq('id', customerData.id);
                
              if (updateError) {
                console.error(`Error updating subscription record: ${updateError.message}`);
                throw updateError;
              }
              
              console.log(`Successfully updated subscription record for customer: ${subscription.customer}`);
            } else {
              // Update the existing subscription record
              const { error: updateError } = await supabase
                .from('customer_subscriptions')
                .update({
                  status: subscription.status,
                  updated_at: new Date().toISOString()
                })
                .eq('id', subscriptionData.id);
                
              if (updateError) {
                console.error(`Error updating subscription record: ${updateError.message}`);
                throw updateError;
              }
              
              console.log(`Successfully updated subscription record for user: ${subscriptionData.user_id}`);
            }
          } catch (customerRetrieveError) {
            console.error(`Error retrieving Stripe customer: ${customerRetrieveError.message}`);
            console.log(`Will attempt to process subscription update despite customer retrieval error`);
            
            // Continue with subscription update even if customer retrieval failed
            try {
              const { data: customerData, error: customerError } = await supabase
                .from('customer_subscriptions')
                .select('*')
                .eq('customer_id', subscription.customer)
                .maybeSingle();
                
              if (!customerError && customerData) {
                const { error: updateError } = await supabase
                  .from('customer_subscriptions')
                  .update({
                    subscription_id: subscription.id,
                    status: subscription.status,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', customerData.id);
                  
                if (!updateError) {
                  console.log(`Successfully updated subscription despite customer retrieval error`);
                }
              }
            } catch (dbErr) {
              console.error(`Failed to update subscription after customer retrieval error: ${dbErr.message}`);
            }
          }
          break;
        }
          
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          console.log(`Subscription deleted: ${subscription.id}`);
          
          // No need to check if customer exists, we need to update our records regardless
          console.log(`Processing subscription deletion without customer verification`);
          
          // Update our database to reflect the deleted subscription
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('customer_subscriptions')
            .select('*')
            .eq('subscription_id', subscription.id)
            .maybeSingle();
            
          if (subscriptionError) {
            console.error(`Error fetching subscription data: ${subscriptionError.message}`);
            throw subscriptionError;
          }
          
          if (!subscriptionData) {
            console.log(`No subscription record found with ID ${subscription.id}, checking by customer ID: ${subscription.customer}`);
            
            const { data: customerData, error: customerError } = await supabase
              .from('customer_subscriptions')
              .select('*')
              .eq('customer_id', subscription.customer)
              .maybeSingle();
              
            if (customerError) {
              console.error(`Error fetching customer data: ${customerError.message}`);
              throw customerError;
            }
            
            if (!customerData) {
              console.error(`No customer record found for Stripe customer: ${subscription.customer}`);
              throw new Error(`No customer record found for Stripe customer: ${subscription.customer}`);
            }
            
            // Mark the subscription as expired
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                subscription_id: null,
                status: 'expired',
                updated_at: new Date().toISOString()
              })
              .eq('id', customerData.id);
              
            if (updateError) {
              console.error(`Error updating subscription record: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`Successfully marked subscription as expired for customer: ${subscription.customer}`);
          } else {
            // Mark the subscription as expired
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                subscription_id: null,
                status: 'expired',
                updated_at: new Date().toISOString()
              })
              .eq('id', subscriptionData.id);
              
            if (updateError) {
              console.error(`Error updating subscription record: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`Successfully marked subscription as expired for user: ${subscriptionData.user_id}`);
          }
          break;
        }
        
        case 'customer.deleted': {
          const customer = event.data.object;
          console.log(`Customer deleted: ${customer.id}`);
          
          // Update our database to reflect the deleted customer
          const { data: customerData, error: customerError } = await supabase
            .from('customer_subscriptions')
            .select('*')
            .eq('customer_id', customer.id)
            .maybeSingle();
            
          if (customerError) {
            console.error(`Error fetching customer data: ${customerError.message}`);
            throw customerError;
          }
          
          if (!customerData) {
            console.log(`No customer record found for deleted Stripe customer: ${customer.id}`);
            // No record to update, so we can just log and continue
          } else {
            // Mark the customer record with a special status
            const { error: updateError } = await supabase
              .from('customer_subscriptions')
              .update({
                subscription_id: null,
                status: 'customer_deleted',
                updated_at: new Date().toISOString()
              })
              .eq('id', customerData.id);
              
            if (updateError) {
              console.error(`Error updating customer record: ${updateError.message}`);
              throw updateError;
            }
            
            console.log(`Successfully marked customer as deleted for user: ${customerData.user_id}`);
          }
          break;
        }
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`Error processing webhook event: ${err.message}`);
      return new Response(JSON.stringify({
        error: `Error processing webhook event: ${err.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Return a response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(JSON.stringify({
      error: `Webhook error: ${err.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
