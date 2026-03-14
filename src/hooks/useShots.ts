import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Shot {
  id: string;
  project_id: string;
  scene_number: string;
  shot_code: string;
  shot_type: string;
  description: string;
  lens: string | null;
  movement: string | null;
  angle: string | null;
  duration: string | null;
  is_completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useShots(projectId: string | null) {
  return useQuery({
    queryKey: ["shots", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("shots")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Shot[];
    },
    enabled: !!projectId,
  });
}

export function useCreateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (shot: {
      project_id: string;
      scene_number: string;
      shot_code: string;
      shot_type: string;
      description: string;
      lens?: string;
      movement?: string;
      angle?: string;
      duration?: string;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase.from("shots").insert(shot).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["shots", data.project_id] });
    },
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Shot> & { id: string }) => {
      const { data, error } = await supabase.from("shots").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["shots", data.project_id] });
    },
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("shots").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["shots", projectId] });
    },
  });
}
