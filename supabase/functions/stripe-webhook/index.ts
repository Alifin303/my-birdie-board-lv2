
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  // Return a friendly message for GET requests (browser testing)
  if (req.method === 'GET') {
    return new Response(JSON.stringify({
      status: "online",
      message: "Stripe webhook endpoint is active. This endpoint expects POST requests from Stripe with proper signature headers, not GET requests from a browser."
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Only process webhook data for POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get the request body as text
    const payload = await req.text();
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Get webhook signing secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SIGNING_SECRET environment variable');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify the event
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        payload, 
        signature, 
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Handle the event
    console.log(`Processing event type: ${event.type}`);
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event, supabase);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeletion(event, supabase);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event, supabase, stripe);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailure(event, supabase, stripe);
        break;
        
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

// Handle subscription creation and updates
async function handleSubscriptionChange(event, supabase) {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const userId = subscription.metadata?.user_id;
  const status = subscription.status;
  
  console.log(`Processing subscription: ${subscriptionId}, status: ${status}, for user: ${userId}`);
  
  try {
    // Check if we have an existing subscription record
    const { data: existingSubscription, error: queryError } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .maybeSingle();
      
    if (queryError) {
      console.error('Error checking for existing subscription:', queryError);
      throw queryError;
    }
    
    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('customer_subscriptions')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully updated subscription: ${subscriptionId}`);
    } else if (userId) {
      // Insert new subscription
      const subscriptionData = {
        subscription_id: subscriptionId,
        customer_id: customerId,
        status: status,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('customer_subscriptions')
        .insert(subscriptionData);
        
      if (insertError) {
        console.error('Error inserting new subscription:', insertError);
        throw insertError;
      }
      
      console.log(`Successfully created new subscription for user: ${userId}`);
    } else {
      console.error('Cannot create subscription record without user_id in metadata');
      throw new Error('Missing user_id in subscription metadata');
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
    throw dbError;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeletion(event, supabase) {
  const deletedSubscription = event.data.object;
  console.log(`Subscription deleted: ${deletedSubscription.id}`);
  
  try {
    // Update the subscription status to 'canceled'
    const { error: deleteError } = await supabase
      .from('customer_subscriptions')
      .update({ 
        status: 'canceled', 
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', deletedSubscription.id);
      
    if (deleteError) {
      console.error('Error updating deleted subscription:', deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully marked subscription ${deletedSubscription.id} as canceled`);
  } catch (dbError) {
    console.error('Database error:', dbError);
    throw dbError;
  }
}

// Handle successful payment
async function handlePaymentSuccess(event, supabase, stripe) {
  const invoiceObject = event.data.object;
  console.log(`Processing successful payment invoice: ${invoiceObject.id}`);
  
  if (invoiceObject.subscription) {
    try {
      // Get the subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(invoiceObject.subscription);
      
      // Update the subscription status in our database
      const { error: paymentUpdateError } = await supabase
        .from('customer_subscriptions')
        .update({ 
          status: stripeSubscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', stripeSubscription.id);
        
      if (paymentUpdateError) {
        console.error('Error updating subscription after successful payment:', paymentUpdateError);
        throw paymentUpdateError;
      }
      
      console.log(`Successfully updated subscription ${stripeSubscription.id} status after payment`);
    } catch (err) {
      console.error(`Error updating subscription after payment: ${err.message}`);
      throw err;
    }
  }
}

// Handle failed payment
async function handlePaymentFailure(event, supabase, stripe) {
  const failedInvoice = event.data.object;
  console.log(`Processing failed payment invoice: ${failedInvoice.id}`);
  
  if (failedInvoice.subscription) {
    try {
      // Get the subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
      
      // Update the subscription status in our database
      const { error: paymentFailureError } = await supabase
        .from('customer_subscriptions')
        .update({ 
          status: stripeSubscription.status,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', stripeSubscription.id);
        
      if (paymentFailureError) {
        console.error('Error updating subscription after failed payment:', paymentFailureError);
        throw paymentFailureError;
      }
      
      console.log(`Successfully updated subscription ${stripeSubscription.id} status after failed payment`);
    } catch (err) {
      console.error(`Error processing failed payment: ${err.message}`);
      throw err;
    }
  }
}
