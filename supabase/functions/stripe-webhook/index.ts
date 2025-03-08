
// Follow Deno's ESM URL imports pattern
import Stripe from 'https://esm.sh/stripe@12.16.0?target=deno';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1';

// Define CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Log the function invocation
  console.log(`Stripe webhook function invoked at ${new Date().toISOString()}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400', // 24 hours caching for preflight
      } 
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    console.error(`Invalid method: ${req.method}. Webhook only accepts POST requests.`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Log all headers for debugging
    const headerEntries = Array.from(req.headers.entries());
    console.log('Request headers:', JSON.stringify(headerEntries));
    
    // Get the payload
    const payload = await req.text();
    console.log('Webhook payload size:', payload.length, 'bytes');
    console.log('Payload preview:', payload.substring(0, 200) + '...');
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(JSON.stringify({ 
        error: 'Server configuration error: Missing STRIPE_SECRET_KEY',
        headers_received: headerEntries.map(([key]) => key)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });
    
    // Parse the event data
    let event;
    const signatureHeader = req.headers.get('stripe-signature');
    
    // Verify with stripe-signature if present
    if (signatureHeader) {
      console.log('Verifying webhook with stripe-signature header');
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
      
      if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SIGNING_SECRET environment variable');
        return new Response(JSON.stringify({ 
          error: 'Server configuration error: Missing STRIPE_WEBHOOK_SIGNING_SECRET'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        event = await stripe.webhooks.constructEventAsync(
          payload, 
          signatureHeader, 
          webhookSecret
        );
        console.log(`Successfully verified Stripe event: ${event.type}`);
      } catch (err) {
        console.error(`Signature verification failed: ${err.message}`);
        return new Response(JSON.stringify({ 
          error: `Webhook signature verification failed: ${err.message}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      // If no signature, try parsing as JSON
      console.log('No stripe-signature header, parsing payload as JSON');
      try {
        event = JSON.parse(payload);
        console.log(`Parsed event type: ${event.type || 'Unknown type'}`);
      } catch (err) {
        console.error(`Error parsing JSON payload: ${err.message}`);
        return new Response(JSON.stringify({ 
          error: `Invalid JSON payload: ${err.message}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');

    // Process the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.pending':
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
    console.log('Successfully processed webhook event');
    return new Response(JSON.stringify({ 
      received: true, 
      event_type: event.type
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack
    }), {
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
  
  // Get additional subscription details
  const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
  const currentPeriodEnd = subscription.current_period_end ? 
    new Date(subscription.current_period_end * 1000).toISOString() : null;
  
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
      console.log(`Updating existing subscription: ${subscriptionId}`);
      const { error: updateError } = await supabase
        .from('customer_subscriptions')
        .update({
          status: status,
          cancel_at_period_end: cancelAtPeriodEnd,
          current_period_end: currentPeriodEnd,
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
      console.log(`Creating new subscription record for user: ${userId}`);
      
      const subscriptionData = {
        subscription_id: subscriptionId,
        customer_id: customerId,
        status: status,
        user_id: userId,
        cancel_at_period_end: cancelAtPeriodEnd,
        current_period_end: currentPeriodEnd,
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
        updated_at: new Date().toISOString(),
        cancel_at_period_end: true,
        current_period_end: deletedSubscription.current_period_end ? 
          new Date(deletedSubscription.current_period_end * 1000).toISOString() : null
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
  console.log(`Processing invoice: ${invoiceObject.id}, subscription: ${invoiceObject.subscription}`);
  
  if (invoiceObject.subscription) {
    try {
      // Get the subscription details
      const stripeSubscription = await stripe.subscriptions.retrieve(invoiceObject.subscription);
      const subId = stripeSubscription.id;
      const status = 'active'; // Force status to active for successful payments
      
      console.log(`Retrieved subscription after successful payment: ${subId}`);
      
      // Update the subscription status to active in our database
      const { error: paymentUpdateError } = await supabase
        .from('customer_subscriptions')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subId);
        
      if (paymentUpdateError) {
        console.error('Error updating subscription after successful payment:', paymentUpdateError);
        throw paymentUpdateError;
      }
      
      console.log(`Successfully updated subscription ${subId} to active status after payment`);
    } catch (err) {
      console.error(`Error updating subscription after payment: ${err.message}`);
      throw err;
    }
  } else {
    console.log('Invoice has no subscription, skipping');
  }
}

// Handle failed payment
async function handlePaymentFailure(event, supabase, stripe) {
  const failedInvoice = event.data.object;
  console.log(`Processing failed payment invoice: ${failedInvoice.id}, subscription: ${failedInvoice.subscription}`);
  
  if (failedInvoice.subscription) {
    try {
      // Get the subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
      console.log(`Stripe subscription status: ${stripeSubscription.status}`);
      
      // We don't automatically update the subscription status on payment failure
      // as the subscription may still be active or in a grace period
      console.log(`Recorded payment failure for subscription: ${failedInvoice.subscription}`);
    } catch (err) {
      console.error(`Error processing failed payment: ${err.message}`);
      throw err;
    }
  }
}
