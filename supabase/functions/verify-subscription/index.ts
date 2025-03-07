
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

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
    const { subscription_id } = await req.json();
    
    if (!subscription_id) {
      return new Response(JSON.stringify({ error: 'Missing subscription_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Verifying subscription ID:', subscription_id);

    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    try {
      // Retrieve the subscription directly from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscription_id);
      
      console.log('Stripe subscription info:', {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end
      });

      // Initialize Supabase client to update subscription status
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Update the subscription in the database to match Stripe
        if (subscription.status === 'active') {
          console.log('Updating subscription in database to active status');
          const { error } = await supabase
            .from('customer_subscriptions')
            .update({ 
              status: subscription.status,
              updated_at: new Date().toISOString() 
            })
            .eq('subscription_id', subscription_id);
            
          if (error) {
            console.error('Error updating subscription in database:', error);
          } else {
            console.log('Successfully updated subscription status in database');
          }
        }
      }

      return new Response(JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end ? 
          new Date(subscription.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return new Response(JSON.stringify({ 
        error: stripeError.message,
        type: 'stripe_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('General error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
