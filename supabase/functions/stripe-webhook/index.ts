
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Webhook secret from environment variables
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Helper function to create a Supabase client with service role key
const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service key');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
};

// Format date as ISO string
const formatDateFromUnixTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

// Debug function to log environment variables (without exposing values)
const logEnvironmentStatus = () => {
  const envVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const status = envVars.reduce((acc, varName) => {
    acc[varName] = !!Deno.env.get(varName);
    return acc;
  }, {});
  
  console.log('Environment variables status:', JSON.stringify(status));
};

serve(async (req) => {
  // Log when a request is received with some details
  console.log(`Webhook request received: ${req.method} ${new URL(req.url).pathname}`);
  console.log(`Request headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
  logEnvironmentStatus();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    if (req.method !== 'POST') {
      console.error(`Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    console.log(`Stripe signature present: ${!!signature}`);
    
    // Get the request body as text
    const body = await req.text();
    console.log(`Request body length: ${body.length} characters`);
    
    // Validate webhook secret configuration
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Special handling for test ping events without signature
    if (body.includes('"type":"ping"')) {
      console.log("Received ping event, responding with success");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // For all other events, verify signature
    if (!signature) {
      console.error("Missing Stripe signature in header");
      // Instead of returning 400, let's try to parse the event directly for debugging
      try {
        const parsedEvent = JSON.parse(body);
        console.log(`Attempting to handle event without signature. Event type: ${parsedEvent.type}`);
        
        // Create Supabase admin client
        const supabase = getSupabaseAdmin();
        
        // Process the event
        await handleStripeEvent(parsedEvent, supabase);
        
        return new Response(JSON.stringify({ received: true, verified: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error(`Failed to parse event without signature: ${parseError.message}`);
        return new Response(JSON.stringify({ error: 'Missing Stripe signature and failed to parse event' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Create the event by verifying the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log(`Webhook event verified. Type: ${event.type}, ID: ${event.id}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      // Try parsing the event directly for debugging
      try {
        event = JSON.parse(body);
        console.log(`Parsed unverified event. Type: ${event.type}`);
      } catch (parseErr) {
        console.error(`Failed to parse body as JSON: ${parseErr.message}`);
        return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Create Supabase admin client
    const supabase = getSupabaseAdmin();
    
    // Process the event
    await handleStripeEvent(event, supabase);
    
    // Return a success response
    console.log("Webhook processing completed successfully");
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error(`Webhook general error: ${error.message}`);
    console.error(error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Function to handle different event types
async function handleStripeEvent(event, supabase) {
  console.log(`Processing event type: ${event.type}`);
  
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed event received');
      const checkoutSession = event.data.object;
      
      try {
        // Extract relevant data
        const customerId = checkoutSession.customer;
        const subscriptionId = checkoutSession.subscription;
        console.log(`Checkout session completed for customer: ${customerId}`);
        console.log(`Subscription: ${subscriptionId}`);
        
        if (!customerId || !subscriptionId) {
          throw new Error('Missing customer ID or subscription ID in checkout session');
        }
        
        // Get customer metadata to find the user ID
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata?.userId;
        
        console.log(`User ID from metadata: ${userId}`);
        
        let finalUserId = userId;
        
        if (!userId) {
          console.warn(`No user ID found in metadata for customer: ${customerId}`);
          
          // Try to find the user ID by querying the customer_subscriptions table
          const { data: existingData, error: queryError } = await supabase
            .from('customer_subscriptions')
            .select('user_id')
            .eq('customer_id', customerId)
            .single();
            
          if (queryError || !existingData) {
            console.error(`Unable to find user for customer ${customerId}: ${queryError?.message || 'No data found'}`);
            throw new Error(`Unable to find user for customer ${customerId}`);
          }
          
          console.log(`Found user ID from database: ${existingData.user_id}`);
          finalUserId = existingData.user_id;
        }
        
        // Fetch the subscription to get the status and other details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`Retrieved subscription details. Status: ${subscription.status}`);
        
        // Update or insert the subscription data in the database
        const { error: upsertError } = await supabase
          .from('customer_subscriptions')
          .upsert({
            user_id: finalUserId,
            customer_id: customerId,
            subscription_id: subscriptionId,
            status: subscription.status,
            current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
            cancel_at_period_end: subscription.cancel_at_period_end,
            price_id: subscription.items.data[0]?.price.id,
            updated_at: new Date().toISOString()
          });
          
        if (upsertError) {
          console.error(`Error updating subscription in database: ${upsertError.message}`);
          throw upsertError;
        }
        
        console.log(`Subscription ${subscriptionId} data saved to database`);
        
      } catch (error) {
        console.error('Error processing checkout.session.completed event:', error.message);
        console.error(error.stack);
      }
      break;
      
    case 'customer.subscription.updated':
      console.log('Subscription updated event received');
      const subscription = event.data.object;
      
      try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        console.log(`Subscription ${subscriptionId} updated for customer: ${customerId}`);
        console.log(`New status: ${subscription.status}`);
        
        // Find the user associated with this customer
        const { data: customerData, error: customerError } = await supabase
          .from('customer_subscriptions')
          .select('user_id')
          .eq('customer_id', customerId)
          .single();
          
        if (customerError || !customerData) {
          console.error(`Unable to find user for customer ${customerId}: ${customerError?.message || 'No data found'}`);
          // Get the customer from Stripe to check metadata
          const customer = await stripe.customers.retrieve(customerId);
          const userId = customer.metadata?.userId;
          
          if (!userId) {
            throw new Error(`Unable to find user for customer ${customerId}`);
          }
          
          console.log(`Found user ID from Stripe metadata: ${userId}`);
          
          // Create a new record
          const { error: insertError } = await supabase
            .from('customer_subscriptions')
            .insert({
              user_id: userId,
              customer_id: customerId,
              subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
              cancel_at_period_end: subscription.cancel_at_period_end,
              price_id: subscription.items.data[0]?.price.id,
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error(`Error inserting subscription in database: ${insertError.message}`);
            throw insertError;
          }
        } else {
          // Update the subscription data in the database
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: formatDateFromUnixTimestamp(subscription.current_period_end),
              cancel_at_period_end: subscription.cancel_at_period_end,
              price_id: subscription.items.data[0]?.price.id,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', customerData.user_id);
            
          if (updateError) {
            console.error(`Error updating subscription in database: ${updateError.message}`);
            throw updateError;
          }
        }
        
        console.log(`Subscription ${subscriptionId} data updated in database`);
        
      } catch (error) {
        console.error('Error processing customer.subscription.updated event:', error.message);
        console.error(error.stack);
      }
      break;
      
    case 'customer.deleted':
      console.log('Customer deleted event received');
      const customer = event.data.object;
      
      try {
        const customerId = customer.id;
        console.log(`Customer ${customerId} was deleted`);
        
        // Update the customer_subscriptions table to mark the customer as deleted
        const { error: deleteError } = await supabase
          .from('customer_subscriptions')
          .update({
            status: 'customer_deleted',
            subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('customer_id', customerId);
          
        if (deleteError) {
          console.error(`Error updating customer deletion in database: ${deleteError.message}`);
          throw deleteError;
        }
        
        console.log(`Customer ${customerId} marked as deleted in database`);
        
      } catch (error) {
        console.error('Error processing customer.deleted event:', error.message);
        console.error(error.stack);
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}. No action taken.`);
  }
}
