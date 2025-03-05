
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('Check Stripe webhook function is starting at ' + new Date().toISOString());

serve(async (req) => {
  const url = new URL(req.url);
  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${url.pathname}`);
  console.log(`[${new Date().toISOString()}] Request headers:`, Object.fromEntries([...req.headers.entries()]));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('['+new Date().toISOString()+'] Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // For direct browser access
  if (req.method === 'GET') {
    console.log('['+new Date().toISOString()+'] Handling GET request');
    try {
      console.log('['+new Date().toISOString()+'] Starting Stripe webhook secrets check...');
      
      // Check all possible webhook secret environment variables
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      
      console.log('['+new Date().toISOString()+'] Environment variables present:');
      console.log(`STRIPE_WEBHOOK_SECRET exists: ${!!webhookSecret}`);
      console.log(`STRIPE_WEBHOOK_SIGNING_SECRET exists: ${!!signingSecret}`);
      console.log(`STRIPE_SECRET_KEY exists: ${!!stripeKey}`);
      
      // Check if secrets are available
      const results = {
        webhook_secrets: {
          STRIPE_WEBHOOK_SECRET: {
            exists: !!webhookSecret,
            length: webhookSecret ? webhookSecret.length : 0,
            starts_with_whsec: webhookSecret ? webhookSecret.startsWith('whsec_') : false,
            first_chars: webhookSecret ? webhookSecret.substring(0, 8) + '...' : '',
            last_chars: webhookSecret ? '...' + webhookSecret.substring(webhookSecret.length - 8) : '',
          },
          STRIPE_WEBHOOK_SIGNING_SECRET: {
            exists: !!signingSecret,
            length: signingSecret ? signingSecret.length : 0,
            starts_with_whsec: signingSecret ? signingSecret.startsWith('whsec_') : false,
            first_chars: signingSecret ? signingSecret.substring(0, 8) + '...' : '',
            last_chars: signingSecret ? '...' + signingSecret.substring(signingSecret.length - 8) : '',
          }
        },
        stripe_key: {
          exists: !!stripeKey,
          length: stripeKey ? stripeKey.length : 0,
          first_chars: stripeKey ? stripeKey.substring(0, 8) + '...' : '',
          last_chars: stripeKey ? '...' + stripeKey.substring(stripeKey.length - 8) : '',
        },
        supabase_url: Deno.env.get('SUPABASE_URL') ? 'exists' : 'missing',
        supabase_service_role: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'exists' : 'missing',
        function_url: `https://${req.headers.get('host')}/stripe-webhook`,
        function_check_url: `https://${req.headers.get('host')}/check-stripe-webhook`,
      };
      
      // Log additional system info that might be useful
      console.log('['+new Date().toISOString()+'] Function URL info:');
      console.log(`Host: ${req.headers.get('host')}`);
      console.log(`Function URL: ${results.function_url}`);
      
      console.log('['+new Date().toISOString()+'] Checking Stripe environment variables:');
      console.log(JSON.stringify(results, null, 2));
      
      // Try to initialize Stripe with the secret key
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
          console.log('✅ Successfully connected to Stripe API');
        } catch (error) {
          console.error(`❌ Failed to connect to Stripe: ${error.message}`);
          stripeError = error.message;
        }
      }
      
      // Test webhook signatures with both possible secret names
      let webhookSecretError = null;
      let signingSecretError = null;
      
      // Test the first webhook secret if it exists
      if (webhookSecret) {
        try {
          console.log('Testing STRIPE_WEBHOOK_SECRET...');
          const stripe = new Stripe('sk_test_dummy', { // Dummy key for testing
            apiVersion: '2023-10-16',
          });
          
          const testBody = JSON.stringify({ test: true });
          const timestamp = Math.floor(Date.now() / 1000);
          
          // This will throw an error because we're using a dummy key,
          // but it helps us understand if the webhook secret format is compatible
          stripe.webhooks.constructEvent(testBody, 'dummy_signature', webhookSecret);
        } catch (error) {
          console.log(`STRIPE_WEBHOOK_SECRET test error: ${error.message}`);
          webhookSecretError = error.message;
        }
      }
      
      // Test the second webhook secret if it exists
      if (signingSecret) {
        try {
          console.log('Testing STRIPE_WEBHOOK_SIGNING_SECRET...');
          const stripe = new Stripe('sk_test_dummy', { // Dummy key for testing
            apiVersion: '2023-10-16',
          });
          
          const testBody = JSON.stringify({ test: true });
          const timestamp = Math.floor(Date.now() / 1000);
          
          // This will throw an error because we're using a dummy key,
          // but it helps us understand if the webhook secret format is compatible
          stripe.webhooks.constructEvent(testBody, 'dummy_signature', signingSecret);
        } catch (error) {
          console.log(`STRIPE_WEBHOOK_SIGNING_SECRET test error: ${error.message}`);
          signingSecretError = error.message;
        }
      }
      
      // Create a sample Stripe signature for testing
      let sampleSignature = '';
      if (stripeConnected) {
        try {
          console.log('Creating sample Stripe signature for testing...');
          const timestamp = Math.floor(Date.now() / 1000);
          const payload = JSON.stringify({ test: true });
          sampleSignature = `t=${timestamp},v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd,v0=6ffbb59b2300aae63f272406069a9788598b792a944a07aba816edb039989a39`;
          console.log(`Sample signature created: ${sampleSignature.substring(0, 20)}...`);
        } catch (error) {
          console.error(`Error creating sample signature: ${error}`);
        }
      }
      
      console.log('['+new Date().toISOString()+'] Returning check results...');
      return new Response(
        JSON.stringify({
          results,
          stripe_connected: stripeConnected,
          stripe_error: stripeError,
          webhook_secret_errors: {
            STRIPE_WEBHOOK_SECRET: webhookSecretError,
            STRIPE_WEBHOOK_SIGNING_SECRET: signingSecretError
          },
          sample_signature: sampleSignature,
          supabase_url_exists: !!Deno.env.get('SUPABASE_URL'),
          supabase_key_exists: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          recommendations: [
            "Ensure your webhook secret in Supabase starts with 'whsec_'",
            "Make sure Stripe is sending to the correct URL: " + results.function_url,
            "Verify events are configured to be sent in Stripe's webhook settings",
            "In Stripe webhook settings, check 'Send test webhook' to trigger a test event",
            "Check the Edge Function logs immediately after sending a test webhook",
            "Verify both STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SIGNING_SECRET are set"
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error checking Stripe environment: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
      
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  }
  
  return new Response(
    JSON.stringify({ 
      message: "Use GET method to check Stripe environment variables",
      url: req.url 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
});
