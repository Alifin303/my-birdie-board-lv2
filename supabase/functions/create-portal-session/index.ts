
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
      .select('customer_id')
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

    // Create a Stripe customer portal session
    try {
      const finalReturnUrl = return_url || 'https://rbhzesocmhazynkfyhst.supabase.co/dashboard';
      console.log('Creating portal session with return URL:', finalReturnUrl);
      
      // Basic configuration for the portal
      const portalOptions = {
        customer: customerId,
        return_url: finalReturnUrl,
        // Add configuration to avoid the "No configuration provided" error
        configuration: {
          business_profile: {
            headline: "Manage your subscription"
          },
          features: {
            subscription_cancel: { enabled: true },
            subscription_pause: { enabled: true },
            customer_update: { 
              enabled: true,
              allowed_updates: ["email", "address", "shipping", "phone", "tax_id"]
            },
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true }
          }
        }
      };
      
      const session = await stripe.billingPortal.sessions.create(portalOptions);

      console.log('Portal session created successfully:', session.id);
      
      // Return the portal URL
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (stripeError) {
      console.error('Error creating portal session:', stripeError);
      
      // Provide more specific error message for customer portal configuration
      if (stripeError.message && stripeError.message.includes('No configuration provided')) {
        return new Response(JSON.stringify({ 
          error: "Stripe Customer Portal is not configured. Please set up your Customer Portal in the Stripe Dashboard.",
          details: "Go to https://dashboard.stripe.com/test/settings/billing/portal to configure your Customer Portal settings.",
          stripe_error: stripeError.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: `Stripe error: ${stripeError.message}` }), {
        status: 500,
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
