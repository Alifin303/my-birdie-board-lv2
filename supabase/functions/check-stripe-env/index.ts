
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    console.log("Checking Stripe environment configuration");
    
    // Check for required environment variables
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    
    const environmentVariables: Record<string, boolean> = {};
    let allVarsPresent = true;
    
    for (const varName of requiredVars) {
      const exists = !!Deno.env.get(varName);
      environmentVariables[varName] = exists;
      if (!exists) {
        allVarsPresent = false;
      }
    }
    
    // Check if Stripe secret key works by making a simple API call
    let stripeConnectionValid = false;
    let stripeMessage = '';
    
    if (environmentVariables['STRIPE_SECRET_KEY']) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          httpClient: Stripe.createFetchHttpClient(),
          apiVersion: '2023-10-16',
        });
        
        const balance = await stripe.balance.retrieve();
        
        if (balance) {
          stripeConnectionValid = true;
          stripeMessage = 'Successfully connected to Stripe API';
        }
      } catch (error) {
        stripeConnectionValid = false;
        stripeMessage = `Error connecting to Stripe: ${error.message}`;
      }
    }
    
    const result = {
      success: allVarsPresent && stripeConnectionValid,
      environmentVariables,
      stripeConnectionValid,
      stripeMessage,
      message: allVarsPresent 
        ? (stripeConnectionValid
           ? 'Stripe environment is correctly configured.'
           : 'Stripe API key is not valid.')
        : 'Missing required environment variables for Stripe integration.',
    };
    
    console.log("Configuration check result:", result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking environment:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to check Stripe environment configuration.'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
