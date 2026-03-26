import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LUMA_API_BASE = "https://api.lumalabs.ai/dream-machine/v1";
const CREDIT_COST = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const LUMA_API_KEY = Deno.env.get("LUMA_API_KEY");
    if (!LUMA_API_KEY) {
      throw new Error("LUMA_API_KEY is not configured");
    }

    const body = await req.json();
    const { action } = body;

    // ──────────────────────────────────────────────
    // ACTION: poll — check generation status
    // ──────────────────────────────────────────────
    if (action === "poll") {
      const { generationId } = body;
      if (!generationId) {
        return new Response(JSON.stringify({ error: "generationId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const pollResp = await fetch(`${LUMA_API_BASE}/generations/${generationId}`, {
        headers: {
          Authorization: `Bearer ${LUMA_API_KEY}`,
          Accept: "application/json",
        },
      });

      if (!pollResp.ok) {
        throw new Error(`Poll failed: ${pollResp.status}`);
      }

      const status = await pollResp.json();
      console.log(`Poll for ${generationId}: state=${status.state}`);

      if (status.state === "completed") {
        // Deduct credits on completion
        const { data: credits } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle();

        const balance = credits?.balance ?? 100;
        await supabase
          .from("user_credits")
          .update({ balance: balance - CREDIT_COST })
          .eq("user_id", userId);

        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: -CREDIT_COST,
          action_type: "video_generation",
        });

        return new Response(JSON.stringify({
          state: "completed",
          videoUrl: status.assets?.video,
          thumbnailUrl: status.assets?.thumbnail,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (status.state === "failed") {
        return new Response(JSON.stringify({
          state: "failed",
          error: status.failure_reason || "Video generation failed",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Still processing
      return new Response(JSON.stringify({
        state: status.state,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ──────────────────────────────────────────────
    // ACTION: submit (default) — start generation
    // ──────────────────────────────────────────────
    const { prompt, style, aspectRatio } = body;

    // Credit check
    const { data: credits } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    const balance = credits?.balance ?? 100;
    if (balance < CREDIT_COST) {
      return new Response(
        JSON.stringify({ error: `Insufficient credits. Video generation costs ${CREDIT_COST} credits.` }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullPrompt = `${style || "Cinematic"} style. ${prompt.trim()}`;
    const arMap: Record<string, string> = { "16:9": "16:9", "9:16": "9:16", "1:1": "1:1", "4:3": "4:3" };

    console.log(`Starting Luma generation for user ${userId}: "${fullPrompt.substring(0, 80)}..."`);

    const createResp = await fetch(`${LUMA_API_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LUMA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: "ray-2",
        aspect_ratio: arMap[aspectRatio] || "16:9",
        loop: false,
      }),
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      console.error(`Luma API create error: ${createResp.status}`, errText);
      if (createResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please wait and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Luma API error: ${createResp.status} - ${errText}`);
    }

    const generation = await createResp.json();
    console.log(`Luma generation created: ${generation.id}`);

    // Return immediately with generation ID — client will poll
    return new Response(
      JSON.stringify({
        generationId: generation.id,
        state: generation.state || "queued",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("luma-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
