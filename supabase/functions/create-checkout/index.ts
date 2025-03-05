
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
    // Parse request body
    const { user_id, email, return_url } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user already has a customer ID
    const { data: existingSubscription } = await supabase
      .from('customer_subscriptions')
      .select('customer_id')
      .eq('user_id', user_id)
      .maybeSingle();

    let customerId = existingSubscription?.customer_id;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      console.log('Creating new Stripe customer');
      const customer = await stripe.customers.create({
        email: email,
        metadata: { user_id },
      });
      
      customerId = customer.id;
      
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
    }
    
    console.log(`Using customer ID: ${customerId}`);

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID'),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: return_url,
      cancel_url: return_url,
      subscription_data: {
        metadata: { user_id },
      },
    });

    // Return the checkout URL
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
