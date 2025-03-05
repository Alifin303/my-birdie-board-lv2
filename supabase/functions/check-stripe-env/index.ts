
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    let message = allVarsPresent 
      ? "All required Stripe environment variables are configured properly."
      : `Missing required environment variables: ${missingVars.join(', ')}`;
      
    console.log(message);
    
    return new Response(
      JSON.stringify({
        success: allVarsPresent,
        environmentVariables,
        message
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
