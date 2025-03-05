
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

// Comprehensive CORS headers for all response types
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

console.log('Test public function is starting - NO AUTH REQUIRED');

serve(async (req) => {
  // Log all request details to help debug
  console.log('Request received at ' + new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries([...req.headers.entries()]));
  console.log('Client IP:', req.headers.get('x-forwarded-for') || 'unknown');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }
  
  // Return a simple response for any method
  return new Response(
    JSON.stringify({
      message: "This is a public test function. No authorization required.",
      timestamp: new Date().toISOString(),
      request_info: {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries([...req.headers.entries()]),
        client_ip: req.headers.get('x-forwarded-for') || 'unknown',
      }
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});
