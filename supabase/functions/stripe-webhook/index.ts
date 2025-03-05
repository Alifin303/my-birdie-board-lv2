
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the request header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16', // Use your preferred API version
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse the webhook payload
    const payload = await req.text();
    
    // Verify the webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || '';
    
    console.log('Received webhook with signature:', signature.substring(0, 10) + '...');
    console.log('Using webhook secret:', webhookSecret ? 'Configured (not showing for security)' : 'Not configured');
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log(`Processing subscription: ${subscription.id}, status: ${subscription.status}`);
        
        // Update subscription in database
        const { error: upsertError } = await supabase
          .from('customer_subscriptions')
          .upsert({
            subscription_id: subscription.id,
            customer_id: subscription.customer,
            status: subscription.status,
            user_id: subscription.metadata?.user_id || '', // Make sure to include user_id in metadata when creating subscriptions
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'subscription_id'
          });
          
        if (upsertError) {
          console.error('Error updating subscription in database:', upsertError);
          return new Response(JSON.stringify({ error: upsertError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log(`Subscription deleted: ${deletedSubscription.id}`);
        
        // Update the subscription status to 'canceled'
        const { error: deleteError } = await supabase
          .from('customer_subscriptions')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('subscription_id', deletedSubscription.id);
          
        if (deleteError) {
          console.error('Error updating deleted subscription:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        break;
        
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a successful response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
