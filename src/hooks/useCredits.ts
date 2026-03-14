import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["credits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_credits" as any)
        .select("balance")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      // If no row yet, return default
      if (!data) return { balance: 100 };
      return data as { balance: number };
    },
  });
}
