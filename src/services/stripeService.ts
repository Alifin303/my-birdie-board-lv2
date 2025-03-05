
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
      const { data, error } = await supabase.functions.invoke('check-stripe-env');
      
      if (error) {
        console.error("Failed to check Stripe environment:", error);
        throw error;
      }
      
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
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'check-config'
        }
      });
      
      if (error) {
        console.error("Error validating Stripe configuration:", error);
        return false;
      }
      
      console.log("Stripe configuration validation result:", data);
      return data.success === true;
    } catch (error) {
      console.error("Error validating Stripe configuration:", error);
      return false;
    }
  }

  async createCustomer(email: string): Promise<StripeCustomer> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Creating Stripe customer for email: ${email}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'create-customer',
          userId: session.user.id,
          email
        }
      });

      if (error) {
        console.error("Error creating Stripe customer:", error);
        throw error;
      }
      
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Creating checkout session for customer: ${customerId}, price: ${priceId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'create-checkout-session',
          userId: session.user.id,
          customerId,
          priceId,
          successUrl,
          cancelUrl
        }
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        throw new Error(`Failed to create checkout session: ${error.message}`);
      }
      
      if (!data || !data.url) {
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    try {
      console.log(`Creating billing portal session for customer: ${customerId}`);
      const { data, error } = await supabase.functions.invoke('stripe', {
        body: {
          action: 'create-billing-portal-session',
          userId: session.user.id,
          customerId,
          returnUrl
        }
      });

      if (error) {
        console.error("Error creating billing portal session:", error);
        throw error;
      }
      
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
