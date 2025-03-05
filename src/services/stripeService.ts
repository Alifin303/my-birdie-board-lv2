
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
}

class StripeService {
  async checkEnvironment(): Promise<StripeEnvCheck> {
    try {
      const { data, error } = await supabase.functions.invoke('check-stripe-env');
      
      if (error) throw error;
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

  async createCustomer(email: string): Promise<StripeCustomer> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create-customer',
        userId: session.user.id,
        email
      }
    });

    if (error) throw error;
    return data;
  }

  async createSubscription(customerId: string, priceId: string, paymentMethodId?: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create-subscription',
        userId: session.user.id,
        customerId,
        priceId,
        paymentMethodId
      }
    });

    if (error) throw error;
    return data;
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'get-subscription',
        userId: session.user.id,
        subscriptionId
      }
    });

    if (error) throw error;
    return data;
  }

  async updatePaymentMethod(customerId: string, paymentMethodId: string): Promise<{ success: boolean }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'update-payment-method',
        userId: session.user.id,
        customer: customerId,
        paymentMethod: paymentMethodId
      }
    });

    if (error) throw error;
    return data;
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'cancel-subscription',
        userId: session.user.id,
        subscriptionId
      }
    });

    if (error) throw error;
    return data;
  }

  async reactivateSubscription(subscriptionId: string): Promise<StripeSubscription> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'reactivate-subscription',
        userId: session.user.id,
        subscriptionId
      }
    });

    if (error) throw error;
    return data;
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

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

    if (error) throw error;
    return data;
  }

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<BillingPortalSession> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('stripe', {
      body: {
        action: 'create-billing-portal-session',
        userId: session.user.id,
        customerId,
        returnUrl
      }
    });

    if (error) throw error;
    return data;
  }
}

export const stripeService = new StripeService();
