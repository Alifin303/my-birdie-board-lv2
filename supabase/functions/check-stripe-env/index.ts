
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // List of required environment variables
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    // Check if all required env vars are set
    const environmentVariables: Record<string, boolean> = {};
    let allVarsPresent = true;
    let missingVars: string[] = [];
    
    for (const varName of requiredEnvVars) {
      const isPresent = !!Deno.env.get(varName);
      environmentVariables[varName] = isPresent;
      
      if (!isPresent) {
        allVarsPresent = false;
        missingVars.push(varName);
      }
    }
    
    // If stripe key is present, test if it's valid
    let stripeConnectionValid = false;
    let stripeMessage = "";
    
    if (environmentVariables['STRIPE_SECRET_KEY']) {
      try {
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2023-10-16',
        });
        
        // Try making a simple API call to validate the key
        await stripe.customers.list({ limit: 1 });
        stripeConnectionValid = true;
        stripeMessage = "Successfully connected to Stripe API";
        console.log(stripeMessage);
      } catch (stripeError) {
        stripeConnectionValid = false;
        stripeMessage = `Stripe API connection failed: ${stripeError.message}`;
        console.error(stripeMessage);
      }
    } else {
      stripeMessage = "Cannot test Stripe connection: STRIPE_SECRET_KEY is missing";
      console.log(stripeMessage);
    }
    
    let message = allVarsPresent 
      ? "All required Stripe environment variables are configured properly."
      : `Missing required environment variables: ${missingVars.join(', ')}`;
      
    console.log(message);
    
    return new Response(
      JSON.stringify({
        success: allVarsPresent && stripeConnectionValid,
        environmentVariables,
        message,
        stripeConnectionValid,
        stripeMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error checking environment: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: `Error checking Stripe environment: ${error.message}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
