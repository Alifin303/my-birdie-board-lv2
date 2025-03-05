
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';
import Stripe from 'https://esm.sh/stripe@11.18.0?target=deno';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

// Initialize Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: { persistSession: false }
  }
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestId = crypto.randomUUID();
    const { action, userId, ...params } = await req.json();
    
    console.log(`[${requestId}] Processing ${action} request`);

    switch (action) {
      case 'check-config': {
        const isConfigValid = !!(
          Deno.env.get('STRIPE_SECRET_KEY') &&
          Deno.env.get('STRIPE_WEBHOOK_SECRET')
        );
        
        return new Response(
          JSON.stringify({ success: isConfigValid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-customer': {
        const { email } = params;
        
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Creating customer for email: ${email}`);
        
        const customer = await stripe.customers.create({
          email,
          metadata: {
            userId: userId || 'unknown' // Store the user ID in metadata for webhook processing
          }
        });
        
        console.log(`Created customer: ${customer.id}`);
        
        return new Response(
          JSON.stringify(customer),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-subscription': {
        const { subscriptionId } = params;
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Subscription ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Retrieving subscription: ${subscriptionId}`);
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        return new Response(
          JSON.stringify(subscription),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-checkout-session': {
        const { customerId, priceId, successUrl, cancelUrl } = params;
        
        if (!customerId || !priceId || !successUrl || !cancelUrl) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Creating checkout session for customer: ${customerId}, price: ${priceId}`);
        
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
        
        console.log(`Created checkout session: ${session.id}`);
        
        return new Response(
          JSON.stringify(session),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-billing-portal-session': {
        const { customerId, returnUrl } = params;
        
        if (!customerId || !returnUrl) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Creating billing portal session for customer: ${customerId}`);
        
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
        
        console.log(`Created billing portal session: ${session.id}`);
        
        return new Response(
          JSON.stringify(session),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel-subscription': {
        const { subscriptionId } = params;
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Subscription ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Cancelling subscription: ${subscriptionId}`);
        
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        
        console.log(`Cancelled subscription: ${subscription.id}`);
        
        // Update our database record
        if (userId) {
          await supabaseAdmin
            .from('customer_subscriptions')
            .update({
              cancel_at_period_end: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('subscription_id', subscriptionId);
        }
        
        return new Response(
          JSON.stringify(subscription),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reactivate-subscription': {
        const { subscriptionId } = params;
        
        if (!subscriptionId) {
          return new Response(
            JSON.stringify({ error: 'Subscription ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Reactivating subscription: ${subscriptionId}`);
        
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
        
        console.log(`Reactivated subscription: ${subscription.id}`);
        
        // Update our database record
        if (userId) {
          await supabaseAdmin
            .from('customer_subscriptions')
            .update({
              cancel_at_period_end: false,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('subscription_id', subscriptionId);
        }
        
        return new Response(
          JSON.stringify(subscription),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-product-prices': {
        const { productId } = params;
        
        if (!productId) {
          return new Response(
            JSON.stringify({ error: 'Product ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Getting prices for product: ${productId}`);
        
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
        });
        
        console.log(`Found ${prices.data.length} prices for product: ${productId}`);
        
        return new Response(
          JSON.stringify(prices.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
