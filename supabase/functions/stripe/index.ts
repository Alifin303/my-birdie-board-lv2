
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('['+new Date().toISOString()+'] Stripe function is starting up');
console.log('['+new Date().toISOString()+'] No authorization is required for this function. Public access is enabled.');

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Helper function to create a Supabase client
const getSupabaseClient = (req) => {
  // Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    console.log('['+new Date().toISOString()+'] No authorization header provided, but this is OK as auth is disabled');
    // Create a client without auth header since auth is disabled
    return createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { },
        auth: { persistSession: false }
      }
    );
  }
  
  // If auth header is provided, use it (for backwards compatibility)
  console.log('['+new Date().toISOString()+'] Authorization header provided, using it');
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    }
  );
};

// Function to verify if a customer exists in Stripe or has been deleted
const verifyCustomer = async (customerId) => {
  try {
    if (!customerId) {
      throw new Error('Missing customer ID');
    }
    
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      throw new Error(`Customer ${customerId} has been deleted and cannot be used. Please create a new customer.`);
    }
    
    return customer;
  } catch (error) {
    console.error(`Error verifying customer: ${error.message}`);
    throw new Error(`Failed to verify customer: ${error.message}`);
  }
};

// Serve HTTP requests
serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received ${req.method} request to Stripe function`);
  console.log(`[${new Date().toISOString()}] Auth status: No authorization required - public access enabled`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('['+new Date().toISOString()+'] Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    const { action, userId } = requestData;
    
    console.log(`[${new Date().toISOString()}] Processing action: ${action}`);
    
    // Create a Supabase client
    let supabaseClient;
    try {
      supabaseClient = getSupabaseClient(req);
      console.log('['+new Date().toISOString()+'] Successfully created Supabase client');
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Supabase client error: ${error.message}`);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          auth_status: "No authorization required - public access enabled" 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Perform the requested action
    switch (action) {
      case 'check-config':
        // Check if Stripe is configured
        try {
          const account = await stripe.accounts.retrieve();
          return new Response(
            JSON.stringify({ success: true, account: { email: account.email } }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
      case 'create-customer':
        // Create a new customer in Stripe
        const { email } = requestData;
        
        if (!email) {
          throw new Error('Missing email parameter');
        }
        
        const newCustomer = await stripe.customers.create({
          email,
          metadata: {
            userId,
          },
        });
        
        console.log(`Created new Stripe customer: ${newCustomer.id} for user: ${userId}`);
        
        return new Response(
          JSON.stringify(newCustomer),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
        
      case 'create-checkout-session':
        // Create a checkout session
        const { customerId, priceId, successUrl, cancelUrl } = requestData;
        
        if (!customerId || !priceId || !successUrl || !cancelUrl) {
          throw new Error('Missing required parameters');
        }
        
        // Verify the customer exists
        try {
          await verifyCustomer(customerId);
        } catch (error) {
          // For checkout sessions, we handle this error differently to recreate customers
          // This is handled in the frontend
          throw error;
        }
        
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
        
        return new Response(
          JSON.stringify(session),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
        
      case 'create-billing-portal-session':
        // Create a billing portal session
        const { returnUrl } = requestData;
        const customerId2 = requestData.customerId;
        
        if (!customerId2 || !returnUrl) {
          throw new Error('Missing required parameters');
        }
        
        // Verify the customer exists
        try {
          await verifyCustomer(customerId2);
        } catch (error) {
          // For billing portal sessions, we handle this error differently
          // This is handled in the frontend
          throw error;
        }
        
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId2,
          return_url: returnUrl,
        });
        
        return new Response(
          JSON.stringify(portalSession),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      
      case 'create-subscription':
        // Create a new subscription
        const { customerId: customerId3, priceId: priceId2, paymentMethodId } = requestData;
    
        if (!customerId3 || !priceId2) {
          throw new Error('Missing required parameters');
        }
    
        // Verify the customer exists
        try {
          await verifyCustomer(customerId3);
        } catch (error) {
          throw error;
        }
    
        let subscriptionParams = {
          customer: customerId3,
          items: [{ price: priceId2 }],
          expand: ['latest_invoice.payment_intent'],
        };
    
        if (paymentMethodId) {
          subscriptionParams = {
            ...subscriptionParams,
            default_payment_method: paymentMethodId,
          };
        }
    
        const subscription2 = await stripe.subscriptions.create(subscriptionParams);
    
        return new Response(
          JSON.stringify(subscription2),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    
      case 'get-subscription':
        // Retrieve a subscription
        const { subscriptionId } = requestData;
    
        if (!subscriptionId) {
          throw new Error('Missing subscriptionId parameter');
        }
    
        const subscription3 = await stripe.subscriptions.retrieve(subscriptionId);
    
        return new Response(
          JSON.stringify(subscription3),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    
      case 'update-payment-method':
        // Update the default payment method for a customer
        const { customer, paymentMethod } = requestData;
    
        if (!customer || !paymentMethod) {
          throw new Error('Missing required parameters');
        }
    
        // Verify the customer exists
        try {
          await verifyCustomer(customer);
        } catch (error) {
          throw error;
        }
    
        await stripe.customers.update(customer, {
          invoice_settings: {
            default_payment_method: paymentMethod,
          },
        });
    
        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    
      case 'cancel-subscription':
        // Cancel a subscription
        const { subscriptionId: subscriptionId2 } = requestData;
    
        if (!subscriptionId2) {
          throw new Error('Missing subscriptionId parameter');
        }
    
        const cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId2);
    
        return new Response(
          JSON.stringify(cancelledSubscription),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    
      case 'reactivate-subscription':
        // Reactivate a subscription
        const { subscriptionId: subscriptionId3 } = requestData;
    
        if (!subscriptionId3) {
          throw new Error('Missing subscriptionId parameter');
        }
    
        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId3, {
          cancel_at_period_end: false,
          // You might need to add a payment method here if the customer's default has expired
        });
    
        return new Response(
          JSON.stringify(reactivatedSubscription),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    
      case 'get-product-prices':
        // Retrieve prices for a product
        const { productId } = requestData;
    
        if (!productId) {
          throw new Error('Missing productId parameter');
        }
    
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
          expand: ['data.recurring'],
        });
    
        return new Response(
          JSON.stringify(prices.data),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        auth_status: "No authorization required - public access enabled" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
