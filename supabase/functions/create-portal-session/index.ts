
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers for preflight requests
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
    console.log('Create portal session function called');
    
    // Parse request body
    const requestData = await req.json();
    const { user_id, return_url } = requestData;
    
    console.log('Request parameters:', { user_id, return_url_provided: !!return_url });
    
    if (!user_id) {
      console.error('Missing user_id in request');
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment variables check:', { 
      hasStripeKey: !!stripeSecretKey, 
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(JSON.stringify({ error: 'Stripe configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get customer ID for this user
    console.log('Looking up customer ID for user:', user_id);
    const { data: subscription, error: subscriptionError } = await supabase
      .from('customer_subscriptions')
      .select('customer_id, subscription_id')
      .eq('user_id', user_id)
      .maybeSingle();
      
    if (subscriptionError) {
      console.error('Error querying customer subscription:', subscriptionError);
      return new Response(JSON.stringify({ error: `Database error: ${subscriptionError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!subscription?.customer_id) {
      console.error('No customer ID found for this user');
      return new Response(JSON.stringify({ error: 'No subscription found for this user' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const customerId = subscription.customer_id;
    console.log('Found customer ID:', customerId);
    console.log('Found subscription ID:', subscription.subscription_id);

    // Create a Stripe customer portal session - Simplified approach
    try {
      const finalReturnUrl = return_url || `${req.headers.get('origin') || 'https://rbhzesocmhazynkfyhst.supabase.co'}/dashboard`;
      console.log('Creating portal session with return URL:', finalReturnUrl);
      
      // Create a basic portal session without any configuration
      // Let Stripe use the default configuration from the dashboard
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: finalReturnUrl
      });

      console.log('Portal session created successfully:', session.id);
      
      // Return the portal URL
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (stripeError) {
      console.error('Error creating portal session:', stripeError);
      
      return new Response(JSON.stringify({ 
        error: `Stripe error: ${stripeError.message}`,
        details: stripeError
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Unhandled error in create-portal-session function:', error);
    return new Response(JSON.stringify({ error: `Unhandled error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
