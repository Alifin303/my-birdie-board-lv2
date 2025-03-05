
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";

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
    // Get the Stripe secret key from environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      throw new Error('Missing STRIPE_SECRET_KEY');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { action, userId, ...data } = await req.json();
    console.log(`Processing Stripe action: ${action} for user: ${userId}`);
    console.log('Action data:', JSON.stringify(data));

    let result;
    switch (action) {
      case 'create-customer':
        // Create a new customer in Stripe
        result = await stripe.customers.create({
          email: data.email,
          metadata: {
            supabaseUserId: userId,
          },
        });
        break;

      case 'create-subscription':
        // Create a subscription for a customer
        const { customerId, priceId, paymentMethodId } = data;
        
        // Validate required fields
        if (!customerId) {
          throw new Error('Missing customerId for subscription creation');
        }
        
        if (!priceId) {
          throw new Error('Missing priceId for subscription creation');
        }
        
        console.log(`Creating subscription for customer: ${customerId} with price: ${priceId}`);
        
        // Attach the payment method to the customer
        if (paymentMethodId) {
          console.log(`Attaching payment method: ${paymentMethodId} to customer: ${customerId}`);
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
          });
          
          // Set as default payment method
          await stripe.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
        }
        
        // Create the subscription with expanded invoice and payment intent
        try {
          result = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
          });
          console.log(`Subscription created successfully: ${result.id}`);
        } catch (subError) {
          console.error(`Error creating subscription: ${subError.message}`);
          if (subError.raw) {
            console.error(`Stripe raw error: ${JSON.stringify(subError.raw)}`);
          }
          throw subError;
        }
        break;

      case 'get-subscription':
        // Get subscription details
        result = await stripe.subscriptions.retrieve(data.subscriptionId);
        break;

      case 'update-payment-method':
        // Update payment method for customer
        const { customer, paymentMethod } = data;
        await stripe.paymentMethods.attach(paymentMethod, {
          customer,
        });
        await stripe.customers.update(customer, {
          invoice_settings: {
            default_payment_method: paymentMethod,
          },
        });
        result = { success: true };
        break;

      case 'cancel-subscription':
        // Cancel a subscription
        result = await stripe.subscriptions.update(data.subscriptionId, {
          cancel_at_period_end: true,
        });
        break;

      case 'reactivate-subscription':
        // Reactivate a canceled subscription that hasn't expired yet
        result = await stripe.subscriptions.update(data.subscriptionId, {
          cancel_at_period_end: false,
        });
        break;

      case 'get-product-prices':
        // Get all prices for a specific product
        console.log(`Getting prices for product: ${data.productId}`);
        try {
          const prices = await stripe.prices.list({
            product: data.productId,
            active: true,
            expand: ['data.product'],
          });
          
          console.log(`Found ${prices.data.length} prices for product ${data.productId}`);
          result = prices.data;
        } catch (priceError) {
          console.error(`Error fetching prices: ${priceError.message}`);
          throw priceError;
        }
        break;

      case 'create-checkout-session':
        // Create a checkout session for subscription
        const { priceId: checkoutPriceId, customerId: checkoutCustomerId, successUrl, cancelUrl } = data;
        
        // Validate required fields
        if (!checkoutCustomerId) {
          throw new Error('Missing customerId for checkout session creation');
        }
        
        if (!checkoutPriceId) {
          throw new Error('Missing priceId for checkout session creation');
        }
        
        if (!successUrl || !cancelUrl) {
          throw new Error('Missing return URLs for checkout session');
        }
        
        console.log(`Creating checkout session for customer: ${checkoutCustomerId}, price: ${checkoutPriceId}`);
        
        try {
          result = await stripe.checkout.sessions.create({
            customer: checkoutCustomerId,
            payment_method_types: ['card'],
            line_items: [
              {
                price: checkoutPriceId,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
          });
          console.log(`Checkout session created: ${result.id}, URL: ${result.url}`);
        } catch (checkoutError) {
          console.error(`Error creating checkout session: ${checkoutError.message}`);
          if (checkoutError.raw) {
            console.error(`Stripe raw error: ${JSON.stringify(checkoutError.raw)}`);
          }
          throw checkoutError;
        }
        break;

      case 'create-billing-portal-session':
        // Create a billing portal session for managing subscriptions
        result = await stripe.billingPortal.sessions.create({
          customer: data.customerId,
          return_url: data.returnUrl,
        });
        break;

      default:
        console.error(`Unsupported action: ${action}`);
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Stripe API error: ${error.message}`);
    if (error.raw) {
      console.error(`Stripe raw error: ${JSON.stringify(error.raw)}`);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
