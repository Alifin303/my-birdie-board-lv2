
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
      
      // First try to create a customer portal session
      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: finalReturnUrl
        });
        
        console.log('Portal session created successfully:', session.id);
        
        // Return the portal URL if successful
        return new Response(JSON.stringify({ url: session.url }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (portalError) {
        console.error('Portal creation error:', portalError);
        
        // If portal creation fails, check if it's due to portal not being configured
        if (portalError.message && portalError.message.includes('No configuration provided')) {
          // Provide a direct link to the subscription in Stripe Dashboard
          const subscriptionURL = `https://dashboard.stripe.com/subscriptions/${subscription.subscription_id}`;
          console.log("Portal not configured, redirecting to subscription URL:", subscriptionURL);
          
          // Also provide a link to the Stripe Customer Portal configuration page
          return new Response(JSON.stringify({ 
            url: subscriptionURL,
            portalNotConfigured: true,
            portalConfigUrl: "https://dashboard.stripe.com/settings/billing/portal",
            message: "Stripe Customer Portal is not configured yet. Redirecting to subscription details.",
            customerPortalUrl: "https://billing.stripe.com/p/login/fZe4huew7a0072UcMM"
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // For other errors, rethrow to be caught by the outer catch block
        throw portalError;
      }
    } catch (stripeError) {
      console.error('Error creating portal session:', stripeError);
      
      // Handle the specific case of portal not being configured
      if (stripeError.message && stripeError.message.includes('No configuration provided')) {
        const stripeConfigUrl = "https://dashboard.stripe.com/settings/billing/portal";
        const subscriptionURL = `https://dashboard.stripe.com/subscriptions/${subscription.subscription_id}`;
        
        return new Response(JSON.stringify({ 
          error: "Stripe Customer Portal not configured",
          portalConfigUrl: stripeConfigUrl,
          alternativeUrl: subscriptionURL,
          customerPortalUrl: "https://billing.stripe.com/p/login/fZe4huew7a0072UcMM",
          message: "Please configure your Stripe Customer Portal or use the subscription URL instead."
        }), {
          status: 200, // Return 200 to prevent frontend errors, but with special fields
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
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
