
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
    const { user_id, user_email, user_name, success_url, cancel_url } = await req.json();
    
    // Enhanced logging for debugging
    console.log(`Checkout request received with parameters:`, {
      user_id,
      user_email,
      user_name: user_name || 'Not provided',
      success_url: success_url ? 'Provided' : 'Not provided',
      cancel_url: cancel_url ? 'Provided' : 'Not provided'
    });

    if (!user_id || !user_email) {
      return new Response(
        JSON.stringify({ error: 'User ID and email are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Stripe with the secret key
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured in environment');
      throw new Error('Stripe configuration error');
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const origin = req.headers.get('origin');
    console.log(`Request origin: ${origin}`);
    
    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    if (!priceId) {
      console.error('STRIPE_PRICE_ID environment variable is not set');
      throw new Error('Stripe configuration error');
    }
    console.log(`Using Stripe price ID: ${priceId}`);

    // Use the origin from the request to build the success and cancel URLs
    const defaultSuccessUrl = `${origin}/auth/callback?subscription_status=success`;
    const defaultCancelUrl = `${origin}/checkout?canceled=true`;

    // Create or retrieve the customer first to ensure they exist
    let customerId: string;
    
    // Search for existing customer
    console.log(`Searching for existing Stripe customer with user_id: ${user_id}`);
    const { data: customers } = await stripe.customers.search({
      query: `metadata["user_id"]:"${user_id}"`,
    });

    if (customers && customers.length > 0) {
      // Use existing customer
      customerId = customers[0].id;
      console.log(`Using existing customer: ${customerId}`);
      
      // Update customer information in case it has changed
      await stripe.customers.update(customerId, {
        email: user_email,
        name: user_name || undefined,
      });
      console.log(`Updated customer information`);
    } else {
      // Create new customer
      console.log(`Creating new Stripe customer for user: ${user_id}`);
      const customer = await stripe.customers.create({
        email: user_email,
        name: user_name || undefined,
        metadata: {
          user_id: user_id,
        },
      });
      customerId = customer.id;
      console.log(`Created new customer: ${customerId}`);
    }

    // Create Checkout session
    console.log(`Creating checkout session for customer: ${customerId}`);
    const finalSuccessUrl = success_url || defaultSuccessUrl;
    const finalCancelUrl = cancel_url || defaultCancelUrl;
    
    console.log(`Success URL: ${finalSuccessUrl}`);
    console.log(`Cancel URL: ${finalCancelUrl}`);
    
    // Add trial_period_days to subscription_data to enable the free trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      subscription_data: {
        metadata: {
          user_id: user_id,
        },
        trial_period_days: 7, // 7-day free trial
      },
      allow_promotion_codes: true,
    });

    console.log(`Created checkout session: ${session.id}`);
    console.log(`Checkout URL: ${session.url}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
