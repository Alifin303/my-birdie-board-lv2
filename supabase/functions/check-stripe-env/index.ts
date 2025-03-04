
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Check required environment variables
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const results = {};
  let allSet = true;
  
  for (const envVar of requiredEnvVars) {
    const value = Deno.env.get(envVar);
    const isSet = !!value;
    results[envVar] = isSet;
    
    if (!isSet) {
      allSet = false;
    }
  }
  
  return new Response(
    JSON.stringify({
      success: allSet,
      environmentVariables: results,
      message: allSet 
        ? "All required Stripe environment variables are configured properly." 
        : "Some required environment variables are missing."
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: allSet ? 200 : 400
    }
  );
});
