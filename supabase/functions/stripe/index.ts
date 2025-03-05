
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

    // Parse request payload
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error(`Error parsing request JSON: ${error.message}`);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { action, userId, ...data } = requestData;
    console.log(`Processing Stripe action: ${action} for user: ${userId}`);
    console.log('Action data:', JSON.stringify(data));

    if (!action) {
      throw new Error('Missing required action parameter');
    }

    // Validate userId is present for most operations
    if (!userId && action !== 'check-config') {
      throw new Error('Missing required userId parameter');
    }

    let result;
    switch (action) {
      case 'create-customer':
        // Create a new customer in Stripe
        if (!data.email) {
          throw new Error('Missing email for customer creation');
        }
        
        console.log(`Creating customer for email: ${data.email}`);
        try {
          result = await stripe.customers.create({
            email: data.email,
            metadata: {
              supabaseUserId: userId,
            },
          });
          console.log(`Successfully created customer: ${result.id}`);
        } catch (error) {
          console.error(`Error creating Stripe customer: ${error.message}`);
          throw error;
        }
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
        
        // Verify customer exists and is not deleted before proceeding
        try {
          const customer = await stripe.customers.retrieve(customerId);
          if (customer.deleted === true) {
            console.error(`Customer ${customerId} has been deleted`);
            throw new Error(`Customer ${customerId} has been deleted and cannot be used. Please create a new customer.`);
          }
        } catch (error) {
          console.error(`Error verifying customer: ${error.message}`);
          throw new Error(`Failed to verify customer: ${error.message}`);
        }
        
        // Attach the payment method to the customer if provided
        if (paymentMethodId) {
          console.log(`Attaching payment method: ${paymentMethodId} to customer: ${customerId}`);
          try {
            await stripe.paymentMethods.attach(paymentMethodId, {
              customer: customerId,
            });
            
            // Set as default payment method
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: paymentMethodId,
              },
            });
          } catch (attachError) {
            console.error(`Error attaching payment method: ${attachError.message}`);
            if (attachError.raw) {
              console.error(`Stripe raw error: ${JSON.stringify(attachError.raw)}`);
            }
            throw attachError;
          }
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
        if (!data.subscriptionId) {
          throw new Error('Missing subscriptionId for subscription retrieval');
        }
        
        console.log(`Retrieving subscription: ${data.subscriptionId}`);
        try {
          result = await stripe.subscriptions.retrieve(data.subscriptionId);
          console.log(`Successfully retrieved subscription: ${result.id}`);
        } catch (error) {
          console.error(`Error retrieving subscription: ${error.message}`);
          throw error;
        }
        break;

      case 'update-payment-method':
        // Update payment method for customer
        const { customer, paymentMethod } = data;
        
        if (!customer) {
          throw new Error('Missing customer ID for payment method update');
        }
        
        if (!paymentMethod) {
          throw new Error('Missing payment method ID for payment method update');
        }
        
        console.log(`Updating payment method: ${paymentMethod} for customer: ${customer}`);
        
        // Verify customer exists and is not deleted
        try {
          const customerData = await stripe.customers.retrieve(customer);
          if (customerData.deleted === true) {
            console.error(`Customer ${customer} has been deleted`);
            throw new Error(`Customer ${customer} has been deleted and cannot be updated. Please create a new customer.`);
          }
        } catch (error) {
          console.error(`Error verifying customer: ${error.message}`);
          throw new Error(`Failed to verify customer: ${error.message}`);
        }
        
        try {
          await stripe.paymentMethods.attach(paymentMethod, {
            customer,
          });
          await stripe.customers.update(customer, {
            invoice_settings: {
              default_payment_method: paymentMethod,
            },
          });
          result = { success: true };
          console.log(`Successfully updated payment method for customer: ${customer}`);
        } catch (error) {
          console.error(`Error updating payment method: ${error.message}`);
          throw error;
        }
        break;

      case 'cancel-subscription':
        // Cancel a subscription
        if (!data.subscriptionId) {
          throw new Error('Missing subscriptionId for subscription cancellation');
        }
        
        console.log(`Cancelling subscription: ${data.subscriptionId}`);
        try {
          result = await stripe.subscriptions.update(data.subscriptionId, {
            cancel_at_period_end: true,
          });
          console.log(`Successfully cancelled subscription: ${result.id}`);
        } catch (error) {
          console.error(`Error cancelling subscription: ${error.message}`);
          throw error;
        }
        break;

      case 'reactivate-subscription':
        // Reactivate a canceled subscription that hasn't expired yet
        if (!data.subscriptionId) {
          throw new Error('Missing subscriptionId for subscription reactivation');
        }
        
        console.log(`Reactivating subscription: ${data.subscriptionId}`);
        try {
          result = await stripe.subscriptions.update(data.subscriptionId, {
            cancel_at_period_end: false,
          });
          console.log(`Successfully reactivated subscription: ${result.id}`);
        } catch (error) {
          console.error(`Error reactivating subscription: ${error.message}`);
          throw error;
        }
        break;

      case 'get-product-prices':
        // Get all prices for a specific product
        if (!data.productId) {
          throw new Error('Missing productId for price retrieval');
        }
        
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
        console.log(`Success URL: ${successUrl}`);
        console.log(`Cancel URL: ${cancelUrl}`);
        
        try {
          // Verify that the customer exists before trying to create a checkout session
          console.log(`Verifying customer existence: ${checkoutCustomerId}`);
          try {
            const customer = await stripe.customers.retrieve(checkoutCustomerId);
            if (!customer) {
              throw new Error(`Customer ${checkoutCustomerId} does not exist`);
            }
            if (customer.deleted === true) {
              throw new Error(`Customer ${checkoutCustomerId} has been deleted and cannot be used. Please create a new customer.`);
            }
            console.log(`Customer verified: ${checkoutCustomerId}`);
          } catch (customerError) {
            console.error(`Error verifying customer: ${customerError.message}`);
            throw new Error(`Failed to verify customer: ${customerError.message}`);
          }
          
          // Verify that the price exists before trying to create a checkout session
          console.log(`Verifying price existence: ${checkoutPriceId}`);
          try {
            const price = await stripe.prices.retrieve(checkoutPriceId);
            if (!price || !price.active) {
              throw new Error(`Price ${checkoutPriceId} does not exist or is not active`);
            }
            console.log(`Price verified: ${checkoutPriceId} (${price.nickname || 'no nickname'})`);
          } catch (priceError) {
            console.error(`Error verifying price: ${priceError.message}`);
            throw new Error(`Failed to verify price: ${priceError.message}`);
          }
          
          // Create the checkout session
          console.log(`Creating checkout session with validated parameters`);
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
        if (!data.customerId) {
          throw new Error('Missing customerId for billing portal session creation');
        }
        
        if (!data.returnUrl) {
          throw new Error('Missing returnUrl for billing portal session creation');
        }
        
        console.log(`Creating billing portal session for customer: ${data.customerId}`);
        
        // Verify customer exists and is not deleted
        try {
          const customerData = await stripe.customers.retrieve(data.customerId);
          if (customerData.deleted === true) {
            console.error(`Customer ${data.customerId} has been deleted`);
            throw new Error(`Customer ${data.customerId} has been deleted. Please create a new customer.`);
          }
        } catch (error) {
          console.error(`Error verifying customer: ${error.message}`);
          throw new Error(`Failed to verify customer: ${error.message}`);
        }
        
        try {
          result = await stripe.billingPortal.sessions.create({
            customer: data.customerId,
            return_url: data.returnUrl,
          });
          console.log(`Successfully created billing portal session: ${result.url}`);
        } catch (error) {
          console.error(`Error creating billing portal session: ${error.message}`);
          throw error;
        }
        break;

      case 'check-config':
        // Check if Stripe is properly configured
        console.log('Checking Stripe configuration');
        try {
          // Attempt to make a simple API call to verify the API key works
          const testCall = await stripe.customers.list({ limit: 1 });
          result = { 
            success: true, 
            message: 'Stripe API key is valid and working correctly.',
            testResult: testCall.data.length > 0 ? 'Successfully connected to Stripe API' : 'Connected to Stripe API but no customers found'
          };
          console.log('Stripe configuration check successful');
        } catch (error) {
          console.error(`Stripe configuration check failed: ${error.message}`);
          result = { 
            success: false, 
            message: `Stripe API key validation failed: ${error.message}`,
            error: error.message
          };
        }
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
    
    // Return a well-structured error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        code: error.code || 'unknown_error',
        type: error.type || 'api_error',
        detail: error.raw ? JSON.stringify(error.raw) : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
