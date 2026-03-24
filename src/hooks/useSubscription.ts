import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const TIERS = {
  pro: {
    price_id: "price_1TEJMZ7pm1sWSXu2cMZxcH3J",
    product_id: "prod_UCioB4YN7q42vp",
    name: "Pro",
    price: "$29/mo",
  },
  studio: {
    price_id: "price_1TEJN07pm1sWSXu2GWmTPF5r",
    product_id: "prod_UCio296kndLNzb",
    name: "Studio",
    price: "$79/mo",
  },
} as const;

export type TierKey = keyof typeof TIERS | "free";

export function useSubscription() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<TierKey>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscribed(false);
      setTier("free");
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscribed(data.subscribed);
      setSubscriptionEnd(data.subscription_end);

      if (data.subscribed && data.product_id) {
        const found = Object.entries(TIERS).find(([, t]) => t.product_id === data.product_id);
        setTier(found ? (found[0] as TierKey) : "free");
      } else {
        setTier("free");
      }
    } catch {
      // silent fail – treat as free
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  const openPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) window.open(data.url, "_blank");
  };

  return { subscribed, tier, subscriptionEnd, loading, checkSubscription, startCheckout, openPortal };
}
