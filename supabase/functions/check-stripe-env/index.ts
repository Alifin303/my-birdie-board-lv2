
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
    console.log("Starting Stripe environment check");
    
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
      const value = Deno.env.get(varName);
      const isPresent = !!value;
      environmentVariables[varName] = isPresent;
      
      console.log(`Checking for ${varName}: ${isPresent ? 'PRESENT' : 'MISSING'}`);
      
      if (!isPresent) {
        allVarsPresent = false;
        missingVars.push(varName);
      } else if (varName === 'STRIPE_SECRET_KEY' && value.startsWith('sk_test_')) {
        console.log(`Using Stripe test mode with key starting with: ${value.substring(0, 10)}...`);
      }
    }
    
    // If stripe key is present, test if it's valid
    let stripeConnectionValid = false;
    let stripeMessage = "";
    
    if (environmentVariables['STRIPE_SECRET_KEY']) {
      try {
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
        console.log(`Validating Stripe key (first 4 chars): ${stripeSecretKey.substring(0, 4)}...`);
        
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: '2023-10-16',
        });
        
        // Try making a simple API call to validate the key
        console.log("Making test request to Stripe API...");
        const customers = await stripe.customers.list({ limit: 1 });
        
        stripeConnectionValid = true;
        stripeMessage = `Successfully connected to Stripe API. Found ${customers.data.length} customer(s)`;
        console.log(stripeMessage);
      } catch (stripeError) {
        stripeConnectionValid = false;
        stripeMessage = `Stripe API connection failed: ${stripeError.message}`;
        console.error(stripeMessage);
        console.error("Full Stripe error:", stripeError);
      }
    } else {
      stripeMessage = "Cannot test Stripe connection: STRIPE_SECRET_KEY is missing";
      console.log(stripeMessage);
    }
    
    let message = allVarsPresent 
      ? "All required Stripe environment variables are configured properly."
      : `Missing required environment variables: ${missingVars.join(', ')}`;
      
    console.log(`Environment check result: ${message}`);
    
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
    console.error("Stack trace:", error.stack);
    
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
