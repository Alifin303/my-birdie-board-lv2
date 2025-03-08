
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@13.11.0';

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
    const { user_id, return_url } = await req.json();
    
    // Enhanced logging for debugging
    console.log(`Portal session request for user ${user_id}`);
    console.log(`Return URL provided: ${return_url || 'No, using default'}`);
    console.log(`Origin header: ${req.headers.get('origin')}`);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Find customer by user ID
    console.log(`Searching for Stripe customer with user_id: ${user_id}`);
    const { data: customers, error: searchError } = await stripe.customers.search({
      query: `metadata["user_id"]:"${user_id}"`,
    });

    if (searchError) {
      console.error('Stripe customer search error:', searchError);
      throw new Error('Failed to find Stripe customer');
    }

    if (!customers || customers.length === 0) {
      console.log(`No Stripe customer found for user_id: ${user_id}`);
      return new Response(
        JSON.stringify({ error: 'No Stripe customer found for this account' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const customer = customers[0];
    console.log(`Found customer: ${customer.id}`);

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: return_url || `${req.headers.get('origin')}/dashboard`,
    });

    console.log(`Created portal session: ${session.id}`);
    console.log(`Portal URL: ${session.url}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create portal session' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
