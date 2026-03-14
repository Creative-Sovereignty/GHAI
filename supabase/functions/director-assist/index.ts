import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Director AI for Golden Hour AI, an AI filmmaking studio. You are the creative brain that orchestrates the entire production pipeline.

When a filmmaker describes a creative direction, mood change, or scene adjustment, you analyze their intent and decide which production tools to invoke — updating scripts, generating video clips, and adjusting music mood — all in one coordinated pass.

You have access to three production tools:

1. **update_script** — Modifies screenplay text (sluglines, action lines, dialogue, parentheticals). Use this when the director's intent changes the written story.

2. **generate_video_clip** — Triggers the AI video engine with a cinematic prompt. Use this when visual output needs to change. Include detailed visual descriptions: lighting, atmosphere, camera angles, textures.

3. **set_music_mood** — Adjusts the AI score's energy, brightness, and active instrument stems. Use this when the emotional tone of a scene changes.

**Key behaviors:**
- Think like a film director. When someone says "make it darker," that affects script tone, visual atmosphere, AND music.
- Always call multiple tools when appropriate — a mood change typically affects all three.
- For visual consistency: reference previous shot descriptions when generating new clips. If the user mentions "keep the same character," carry visual details forward.
- Keep script changes in proper screenplay format.
- Be concise in your explanations but precise in your tool calls.
- After making tool calls, summarize what you changed across all departments (Script, Visual, Music).`;

const tools = [
  {
    type: "function",
    function: {
      name: "update_script",
      description: "Modifies the screenplay text, sluglines, or dialogue based on the director's intent.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "The new script text to be inserted or modified." },
          scene_id: { type: "string", description: "The ID of the scene being edited." },
          formatting_style: { type: "string", enum: ["slugline", "action", "dialogue", "parenthetical"] },
        },
        required: ["content", "scene_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_video_clip",
      description: "Triggers the AI video engine to generate a new cinematic clip.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "High-detail cinematic prompt for the AI." },
          motion_intensity: { type: "number", description: "Value from 0-100 defining camera/subject movement." },
          camera_movement: { type: "string", enum: ["static", "dolly_in", "pan_left", "crane_up", "handheld"] },
          shot_id: { type: "string", description: "The shot list ID this video corresponds to." },
        },
        required: ["prompt", "shot_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_music_mood",
      description: "Adjusts the AI Music Studio parameters to match the scene's emotional beats.",
      parameters: {
        type: "object",
        properties: {
          energy: { type: "number", description: "Intensity of the score from 0-100." },
          brightness: { type: "number", description: "Tonality from 0 (Dark/Minor) to 100 (Bright/Major)." },
          stems: { type: "array", items: { type: "string" }, description: "Active instrument stems." },
        },
        required: ["energy", "brightness"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

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
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, projectContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system message
    let systemContent = SYSTEM_PROMPT;
    if (projectContext) {
      systemContent += `\n\nCurrent project context:\n`;
      if (projectContext.currentScript) {
        systemContent += `\nScript:\n\`\`\`screenplay\n${projectContext.currentScript}\n\`\`\`\n`;
      }
      if (projectContext.shots?.length) {
        systemContent += `\nShot list:\n${JSON.stringify(projectContext.shots, null, 2)}\n`;
      }
      if (projectContext.projectTitle) {
        systemContent += `\nProject: "${projectContext.projectTitle}"\n`;
      }
    }

    const contextMessages = [
      { role: "system" as const, content: systemContent },
      ...messages,
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: contextMessages,
          tools,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("director-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
