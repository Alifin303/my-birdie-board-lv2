import { supabase } from "@/integrations/supabase/client";

export interface StripeCustomer {
  id: string;
  email: string;
}

export interface StripeSubscription {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        product: string;
        unit_amount: number;
      }
    }>
  };
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
  nickname?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface BillingPortalSession {
  url: string;
}

export interface StripeEnvCheck {
  success: boolean;
  environmentVariables: Record<string, boolean>;
  message: string;
  stripeConnectionValid?: boolean;
  stripeMessage?: string;
}

class StripeService {
  async checkEnvironment(): Promise<StripeEnvCheck> {
    try {
      console.log("Checking Stripe environment configuration...");
      const response = await fetch(`${supabase.functions.url}/check-stripe-env`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to check Stripe environment:", errorText);
        throw new Error(errorText || "HTTP error " + response.status);
      }
      
      const data = await response.json();
      console.log("Stripe environment check result:", data);
      return data;
    } catch (error) {
      console.error("Failed to check Stripe environment:", error);
      return {
        success: false,
        environmentVariables: {},
        message: error.message || "Failed to check Stripe environment"
      };
    }
  }

  async validateStripeConfig(): Promise<boolean> {
    try {
      console.log("Validating Stripe configuration...");
      const response = await fetch(`${supabase.functions.url}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check-config'
        })
      });
      
      if (!response.ok) {
        console.error("Error validating Stripe configuration:", await response.text());
        return false;
      }
      
      const data = await response.json();
      console.log("Stripe configuration validation result:", data);
      return data.success === true;
    } catch (error) {
      console.error("Error validating Stripe configuration:", error);
      return false;
    }
  }

  async createCustomer(email: string): Promise<StripeCustomer> {
    try {
      console.log(`Creating Stripe customer for email: ${email}`);
      const response = await fetch(`${supabase.functions.url}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-customer',
          userId: null,
          email
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creating Stripe customer:", errorText);
        throw new Error(errorText || "HTTP error " + response.status);
      }
      
      const data = await response.json();
      
      if (!data || !data.id) {
        throw new Error('Invalid response from server when creating customer');
      }
      
      console.log(`Successfully created Stripe customer: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in createCustomer:", error);
      throw error;
    }
  }

  async createSubscription(customerId: string, priceId: string, paymentMethodId?: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Creating subscription for customer: ${customerId}, price: ${priceId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'create-subscription',
          userId: session.user.id,
          customerId,
          priceId,
          paymentMethodId
        }
      });

      if (error) {
        console.error("Error creating Stripe subscription:", error);
        throw error;
      }
      
      if (!data || !data.id) {
        throw new Error('Invalid response from server when creating subscription');
      }
      
      console.log(`Successfully created subscription: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in createSubscription:", error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Getting subscription: ${subscriptionId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'get-subscription',
          userId: session.user.id,
          subscriptionId
        }
      });

      if (error) {
        console.error("Error getting Stripe subscription:", error);
        throw error;
      }
      
      if (!data || !data.id) {
        throw new Error('Invalid response from server when retrieving subscription');
      }
      
      console.log(`Successfully retrieved subscription: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in getSubscription:", error);
      throw error;
    }
  }

  async updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<{ success: boolean }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Updating payment method for customer: ${customerId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'update-payment-method',
          userId: session.user.id,
          customer: customerId,
          paymentMethod: paymentMethodId
        }
      });

      if (error) {
        console.error("Error updating payment method:", error);
        throw error;
      }
      
      console.log("Payment method updated successfully");
      return data;
    } catch (error) {
      console.error("Error in updatePaymentMethod:", error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Cancelling subscription: ${subscriptionId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'cancel-subscription',
          userId: session.user.id,
          subscriptionId
        }
      });

      if (error) {
        console.error("Error canceling subscription:", error);
        throw error;
      }
      
      console.log(`Successfully cancelled subscription: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in cancelSubscription:", error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Reactivating subscription: ${subscriptionId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'reactivate-subscription',
          userId: session.user.id,
          subscriptionId
        }
      });

      if (error) {
        console.error("Error reactivating subscription:", error);
        throw error;
      }
      
      console.log(`Successfully reactivated subscription: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in reactivateSubscription:", error);
      throw error;
    }
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    try {
      console.log(`Creating checkout session for customer: ${customerId}, price: ${priceId}`);
      console.log(`Success URL: ${successUrl}`);
      console.log(`Cancel URL: ${cancelUrl}`);
      
      if (!customerId) throw new Error('Missing customerId parameter');
      if (!priceId) throw new Error('Missing priceId parameter');
      if (!successUrl) throw new Error('Missing successUrl parameter');
      if (!cancelUrl) throw new Error('Missing cancelUrl parameter');

      const response = await fetch(`${supabase.functions.url}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-checkout-session',
          userId: null,
          customerId,
          priceId,
          successUrl,
          cancelUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creating checkout session:", errorText);
        
        if (errorText.includes('deleted')) {
          console.log('Customer has been deleted in Stripe. Will recreate the customer and try again.');
          
          // Update our database record to mark the customer as deleted
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase
              .from('customer_subscriptions')
              .update({
                status: 'customer_deleted',
                subscription_id: null
              })
              .eq('user_id', session.user.id);
            
            // Get the user's email to create a new customer
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', session.user.id)
              .single();
              
            if (!profile || !profile.email) {
              throw new Error('Could not find user email to recreate Stripe customer');
            }
            
            // Create a new customer
            const newCustomer = await this.createCustomer(profile.email);
            
            // Update the customer_subscriptions table with the new customer ID
            await supabase
              .from('customer_subscriptions')
              .update({
                customer_id: newCustomer.id,
                status: 'created',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', session.user.id);
              
            // Try again with the new customer ID
            return await this.createCheckoutSession(newCustomer.id, priceId, successUrl, cancelUrl);
          }
        }
        
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.url) {
        console.error("Invalid response data:", data);
        throw new Error('Invalid response from server when creating checkout session');
      }
      
      console.log(`Checkout session created successfully: ${data.id}`);
      return data;
    } catch (error) {
      console.error("Error in createCheckoutSession:", error);
      throw error;
    }
  }

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<BillingPortalSession> {
    try {
      console.log(`Creating billing portal session for customer: ${customerId}`);
      
      const response = await fetch(`${supabase.functions.url}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-billing-portal-session',
          userId: null,
          customerId,
          returnUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creating billing portal session:", errorText);
        
        if (errorText.includes('deleted')) {
          console.log('Customer has been deleted in Stripe. Will recreate the customer and try again.');
          
          // Update our database record to mark the customer as deleted
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase
              .from('customer_subscriptions')
              .update({
                status: 'customer_deleted',
                subscription_id: null
              })
              .eq('user_id', session.user.id);
            
            // Get the user's email to create a new customer
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', session.user.id)
              .single();
              
            if (!profile || !profile.email) {
              throw new Error('Could not find user email to recreate Stripe customer');
            }
            
            // Create a new customer
            const newCustomer = await this.createCustomer(profile.email);
            
            // Update the customer_subscriptions table with the new customer ID
            await supabase
              .from('customer_subscriptions')
              .update({
                customer_id: newCustomer.id,
                status: 'created',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', session.user.id);
              
            // Try again with the new customer ID
            return await this.createBillingPortalSession(newCustomer.id, returnUrl);
          }
        }
        
        throw new Error(`Failed to create billing portal session: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.url) {
        throw new Error('Invalid response from server when creating billing portal session');
      }
      
      console.log(`Billing portal session created successfully`);
      return data;
    } catch (error) {
      console.error("Error in createBillingPortalSession:", error);
      throw error;
    }
  }

  async getProductPrices(productId: string): Promise<StripePrice[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Getting prices for product: ${productId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'get-product-prices',
          userId: session.user.id,
          productId
        }
      });

      if (error) {
        console.error("Error fetching product prices:", error);
        throw error;
      }
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response from server when fetching product prices');
      }
      
      console.log(`Found ${data.length} prices for product: ${productId}`);
      return data;
    } catch (error) {
      console.error("Error in getProductPrices:", error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
