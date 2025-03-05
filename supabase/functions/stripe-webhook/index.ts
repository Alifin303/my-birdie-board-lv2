
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Webhook secret from environment variables
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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

    console.log("Received webhook request");
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error("Missing Stripe signature in header");
      return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get the request body as text
    const body = await req.text();
    
    // Create the event by verifying the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log(`Webhook event type: ${event.type}`);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout session completed event received');
        const checkoutSession = event.data.object;
        
        try {
          // Update the subscription in the database
          // This would typically be done by your application code
          console.log(`Checkout session completed for customer: ${checkoutSession.customer}`);
          console.log(`Subscription: ${checkoutSession.subscription}`);
          
          // Here you would update your database with the subscription information
        } catch (error) {
          console.error('Error processing checkout.session.completed event:', error);
        }
        break;
        
      case 'customer.subscription.updated':
        console.log('Subscription updated event received');
        const subscription = event.data.object;
        
        try {
          console.log(`Subscription ${subscription.id} updated for customer: ${subscription.customer}`);
          console.log(`New status: ${subscription.status}`);
          
          // Here you would update your database with the subscription status
        } catch (error) {
          console.error('Error processing customer.subscription.updated event:', error);
        }
        break;
        
      case 'customer.deleted':
        console.log('Customer deleted event received');
        const customer = event.data.object;
        
        try {
          console.log(`Customer ${customer.id} was deleted`);
          
          // Here you would update your database to mark the customer as deleted
        } catch (error) {
          console.error('Error processing customer.deleted event:', error);
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a success response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
