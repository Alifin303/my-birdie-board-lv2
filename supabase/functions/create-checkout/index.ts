
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
    
    // Log request for debugging
    console.log(`Checkout request: ${JSON.stringify({
      user_id,
      user_email,
      success_url_provided: !!success_url,
      cancel_url_provided: !!cancel_url
    }, null, 2)}`);

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const origin = req.headers.get('origin');
    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    
    if (!priceId) {
      console.error('STRIPE_PRICE_ID environment variable is not set');
      throw new Error('Stripe configuration error');
    }

    // Use the origin from the request to build the success and cancel URLs
    const defaultSuccessUrl = `${origin}/auth/callback?subscription_status=success`;
    const defaultCancelUrl = `${origin}/checkout?canceled=true`;

    // Create or retrieve the customer first to ensure they exist
    let customerId: string;
    
    // Search for existing customer
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
    } else {
      // Create new customer
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
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
      subscription_data: {
        metadata: {
          user_id: user_id,
        },
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
