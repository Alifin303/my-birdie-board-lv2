import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('Stripe function is starting up at ' + new Date().toISOString());
console.log('No authorization is required for this function. Public access is enabled.');

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Helper function to create a Supabase client
const getSupabaseClient = (req) => {
  // Create a client without auth header since auth is disabled
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      global: { },
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
  console.log(`Received ${req.method} request to Stripe function at ${new Date().toISOString()}`);
  console.log(`Auth status: No authorization required - public access enabled`);
  console.log(`Request headers:`, Object.fromEntries([...req.headers.entries()]));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // Handle GET requests for testing
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ 
        message: "Stripe function is working. Send POST requests with action parameter.",
        timestamp: new Date().toISOString(),
        auth_status: "No authorization required - public access enabled" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (req.method === 'POST') {
    try {
      // Parse the request body
      let requestData;
      try {
        console.log("Parsing request body");
        requestData = await req.json();
        console.log("Request data:", JSON.stringify(requestData));
      } catch (e) {
        console.error("Error parsing request body:", e);
        return new Response(
          JSON.stringify({ 
            error: "Invalid JSON in request body",
            auth_status: "No authorization required - public access enabled" 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const { action, userId } = requestData;
      
      console.log(`Processing action: ${action}`);
      
      // Create a Supabase client
      let supabaseClient;
      try {
        supabaseClient = getSupabaseClient(req);
        console.log('Successfully created Supabase client');
      } catch (error) {
        console.error(`Supabase client error: ${error.message}`);
        return new Response(
          JSON.stringify({ 
            error: error.message,
            auth_status: "No authorization required - public access enabled" 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Perform the requested action
      switch (action) {
        case 'check-config':
          // Check if Stripe is configured
          try {
            console.log("Checking Stripe configuration");
            const account = await stripe.accounts.retrieve();
            console.log("Stripe account retrieved successfully");
            return new Response(
              JSON.stringify({ success: true, account: { email: account.email } }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          } catch (error) {
            console.error("Stripe configuration check failed:", error.message);
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
      console.error(`Error: ${error.message}`);
      
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
  }
  
  // For any other HTTP method
  return new Response(
    JSON.stringify({ 
      error: "Method not allowed. Use POST with an action parameter.",
      auth_status: "No authorization required - public access enabled" 
    }),
    { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});
