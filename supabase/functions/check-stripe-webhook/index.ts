
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const signingSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    // Check if secrets are available
    const results = {
      webhook_secret: {
        exists: !!webhookSecret,
        length: webhookSecret ? webhookSecret.length : 0,
        first_chars: webhookSecret ? webhookSecret.substring(0, 8) + '...' : '',
        last_chars: webhookSecret ? '...' + webhookSecret.substring(webhookSecret.length - 8) : '',
      },
      signing_secret: {
        exists: !!signingSecret,
        length: signingSecret ? signingSecret.length : 0,
        first_chars: signingSecret ? signingSecret.substring(0, 8) + '...' : '',
        last_chars: signingSecret ? '...' + signingSecret.substring(signingSecret.length - 8) : '',
      },
      stripe_key: {
        exists: !!stripeKey,
        length: stripeKey ? stripeKey.length : 0,
        first_chars: stripeKey ? stripeKey.substring(0, 8) + '...' : '',
        last_chars: stripeKey ? '...' + stripeKey.substring(stripeKey.length - 8) : '',
      }
    };
    
    console.log('Checking Stripe environment variables:');
    console.log(JSON.stringify(results, null, 2));
    
    // Try to initialize Stripe with the secret key
    let stripeConnected = false;
    let stripeError = null;
    
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, {
          httpClient: Stripe.createFetchHttpClient(),
          apiVersion: '2023-10-16',
        });
        
        // Try a simple call to verify the API key works
        await stripe.customers.list({ limit: 1 });
        stripeConnected = true;
      } catch (error) {
        stripeError = error.message;
      }
    }
    
    // Test webhook signatures with both possible secret names
    let webhookSecretError = null;
    let signingSecretError = null;
    
    // Test the regular webhook secret if it exists
    if (webhookSecret) {
      try {
        const stripe = new Stripe('sk_test_dummy', { // Dummy key for testing
          apiVersion: '2023-10-16',
        });
        
        const testBody = JSON.stringify({ test: true });
        const timestamp = Math.floor(Date.now() / 1000);
        const signedPayload = `${timestamp}.${testBody}`;
        
        // This will throw an error because we're using a dummy key,
        // but it helps us understand if the webhook secret format is compatible
        stripe.webhooks.constructEvent(testBody, 'dummy_signature', webhookSecret);
      } catch (error) {
        webhookSecretError = error.message;
      }
    }
    
    // Test the signing secret if it exists
    if (signingSecret) {
      try {
        const stripe = new Stripe('sk_test_dummy', { // Dummy key for testing
          apiVersion: '2023-10-16',
        });
        
        const testBody = JSON.stringify({ test: true });
        const timestamp = Math.floor(Date.now() / 1000);
        const signedPayload = `${timestamp}.${testBody}`;
        
        // This will throw an error because we're using a dummy key,
        // but it helps us understand if the webhook secret format is compatible
        stripe.webhooks.constructEvent(testBody, 'dummy_signature', signingSecret);
      } catch (error) {
        signingSecretError = error.message;
      }
    }
    
    // Create a sample Stripe signature for testing
    let sampleSignature = '';
    if (stripeConnected) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const payload = JSON.stringify({ test: true });
        sampleSignature = `t=${timestamp},v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd,v0=6ffbb59b2300aae63f272406069a9788598b792a944a07aba816edb039989a39`;
      } catch (error) {
        console.error('Error creating sample signature:', error);
      }
    }
    
    return new Response(
      JSON.stringify({
        results,
        stripe_connected: stripeConnected,
        stripe_error: stripeError,
        webhook_secret_error: webhookSecretError,
        signing_secret_error: signingSecretError,
        sample_signature: sampleSignature,
        recommendations: [
          "Try using both STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SIGNING_SECRET in the Supabase secrets",
          "Update the stripe-webhook function to check both environment variables",
          "Look for the variable that contains the value starting with 'whsec_'",
          "If neither variable has the 'whsec_' prefix, Supabase may be transforming the value",
          "Try testing a webhook delivery from Stripe to confirm it's reaching your function",
          "Check the function logs immediately after sending a test webhook from Stripe"
        ]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error checking Stripe environment: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
