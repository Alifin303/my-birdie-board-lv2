
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
    console.log('Create checkout function called');
    
    // Parse request body
    const requestData = await req.json();
    const { user_id, email, return_url } = requestData;
    
    console.log('Request parameters:', { user_id, email, return_url_provided: !!return_url });
    
    if (!user_id) {
      console.error('Missing user_id in request');
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePriceId = Deno.env.get('STRIPE_PRICE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment variables check:', { 
      hasStripeKey: !!stripeSecretKey, 
      hasStripePriceId: !!stripePriceId,
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
    
    if (!stripePriceId) {
      console.error('STRIPE_PRICE_ID not configured');
      return new Response(JSON.stringify({ error: 'Stripe price ID missing' }), {
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

    // Check if user already has a customer ID
    console.log('Checking for existing subscription for user:', user_id);
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('customer_subscriptions')
      .select('customer_id')
      .eq('user_id', user_id)
      .maybeSingle();
      
    if (subscriptionError) {
      console.error('Error querying existing subscription:', subscriptionError);
      return new Response(JSON.stringify({ error: `Database error: ${subscriptionError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let customerId = existingSubscription?.customer_id;
    console.log('Existing customer ID:', customerId || 'None found');

    // If no customer ID exists, create a new customer
    if (!customerId) {
      console.log('Creating new Stripe customer with email:', email);
      try {
        const customer = await stripe.customers.create({
          email: email,
          metadata: { user_id },
        });
        
        customerId = customer.id;
        console.log('New customer created with ID:', customerId);
        
        // Store the customer ID in our database
        const { error: customerError } = await supabase
          .from('customer_subscriptions')
          .insert({
            user_id,
            customer_id: customerId,
            subscription_id: null,
            status: 'created'
          });
          
        if (customerError) {
          console.error('Error storing customer ID:', customerError);
          throw new Error(`Failed to store customer ID: ${customerError.message}`);
        }
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError);
        return new Response(JSON.stringify({ error: `Stripe error: ${stripeError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log(`Using customer ID: ${customerId} for checkout session`);

    // Create a new checkout session
    try {
      const finalReturnUrl = return_url || 'https://rbhzesocmhazynkfyhst.supabase.co/dashboard';
      console.log('Creating checkout session with return URL:', finalReturnUrl);
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: finalReturnUrl,
        cancel_url: finalReturnUrl,
        subscription_data: {
          metadata: { user_id },
        },
      });

      console.log('Checkout session created successfully:', session.id);
      
      // Return the checkout URL
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (stripeError) {
      console.error('Error creating checkout session:', stripeError);
      return new Response(JSON.stringify({ error: `Stripe checkout error: ${stripeError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Unhandled error in create-checkout function:', error);
    return new Response(JSON.stringify({ error: `Unhandled error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
