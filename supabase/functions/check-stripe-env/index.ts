
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno";

// Comprehensive CORS headers for all response types
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('Check Stripe environment function is starting at ' + new Date().toISOString());
console.log('No authorization is required for this function. Public access is enabled.');

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`Received request: ${req.method} ${url.pathname}`);
  console.log(`Request headers:`, Object.fromEntries([...req.headers.entries()]));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // For direct browser access or simply testing
  if (req.method === 'GET' || req.method === 'POST') {
    console.log('Handling request - PUBLIC ACCESS ENABLED');
    try {
      console.log('Starting Stripe environment check...');
      
      // Check for environment variables
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      const stripeWebhookSigningSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      console.log('Environment variables present:');
      console.log(`STRIPE_SECRET_KEY exists: ${!!stripeKey}`);
      console.log(`STRIPE_WEBHOOK_SECRET exists: ${!!stripeWebhookSecret}`);
      console.log(`STRIPE_WEBHOOK_SIGNING_SECRET exists: ${!!stripeWebhookSigningSecret}`);
      console.log(`SUPABASE_URL exists: ${!!supabaseUrl}`);
      console.log(`SUPABASE_SERVICE_ROLE_KEY exists: ${!!supabaseServiceRole}`);
      
      // Check Stripe connection
      let stripeConnected = false;
      let stripeError = null;
      
      if (stripeKey) {
        try {
          console.log('Initializing Stripe with secret key...');
          const stripe = new Stripe(stripeKey, {
            httpClient: Stripe.createFetchHttpClient(),
            apiVersion: '2023-10-16',
          });
          
          // Try a simple call to verify the API key works
          console.log('Testing Stripe connection with customers.list call...');
          await stripe.customers.list({ limit: 1 });
          stripeConnected = true;
          console.log('Successfully connected to Stripe API');
        } catch (error) {
          console.error(`Failed to connect to Stripe: ${error.message}`);
          stripeError = error.message;
        }
      }
      
      // Return status
      return new Response(
        JSON.stringify({
          success: true,
          environmentVariables: {
            STRIPE_SECRET_KEY: !!stripeKey,
            STRIPE_WEBHOOK_SECRET: !!stripeWebhookSecret,
            STRIPE_WEBHOOK_SIGNING_SECRET: !!stripeWebhookSigningSecret,
            SUPABASE_URL: !!supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceRole,
          },
          message: "Environment check completed",
          stripeConnectionValid: stripeConnected,
          stripeMessage: stripeError,
          auth_status: "No authorization required - public access enabled",
          urls: {
            stripe_function: `https://${req.headers.get('host')}/stripe`,
            webhook_function: `https://${req.headers.get('host')}/stripe-webhook`,
            env_check_function: `https://${req.headers.get('host')}/check-stripe-env`,
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error(`Error checking Stripe environment: ${error.message}`);
      
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          auth_status: 'No authorization required - public access enabled'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }
  
  // For any other HTTP method
  return new Response(
    JSON.stringify({ 
      message: "Use GET or POST to check Stripe environment variables",
      auth_status: "No authorization required - public access enabled"
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
