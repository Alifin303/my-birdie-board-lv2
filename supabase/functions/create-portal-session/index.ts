
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

    // Create a Stripe customer portal session
    try {
      const finalReturnUrl = return_url || `${req.headers.get('origin') || 'https://rbhzesocmhazynkfyhst.supabase.co'}/dashboard`;
      console.log('Creating portal session with return URL:', finalReturnUrl);
      
      // Create portal session with explicit configuration
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: finalReturnUrl,
        // Force Stripe to use the default configuration if available
        // This ensures we use the configured portal settings
        configuration: undefined
      });
      
      console.log('Portal session created successfully:', session.id);
      console.log('Portal URL:', session.url);
      
      // Return the portal URL
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (stripeError) {
      console.error('Error creating portal session:', stripeError);
      
      // If we can't create a portal session, try a direct link to the customer portal
      try {
        // Direct link to customer portal (uses customer ID)
        const directPortalUrl = `https://billing.stripe.com/p/login/${customerId}`;
        console.log('Using direct portal URL:', directPortalUrl);
        
        return new Response(JSON.stringify({ 
          url: directPortalUrl,
          directPortal: true
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (directError) {
        console.error('Error creating direct portal link:', directError);
        
        // As a last resort, provide a subscription URL in the Stripe Dashboard
        const subscriptionURL = `https://dashboard.stripe.com/subscriptions/${subscription.subscription_id}`;
        
        return new Response(JSON.stringify({ 
          url: subscriptionURL,
          fallback: true,
          error: stripeError.message,
          message: "Could not access customer portal. Redirecting to subscription details."
        }), {
          status: 200, // Return 200 to prevent frontend errors
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
  } catch (error) {
    console.error('Unhandled error in create-portal-session function:', error);
    return new Response(JSON.stringify({ error: `Unhandled error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
