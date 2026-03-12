import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a professional storyboard assistant for Golden Hour AI, an AI filmmaking studio. You generate detailed scene descriptions for storyboard frames.

When given a prompt (a scene description, mood, or concept), generate storyboard frames as structured JSON using the provided tool.

Each frame should include:
- scene: The scene heading in standard screenplay format (e.g. "INT. COFFEE SHOP - DAY")
- description: A concise visual description of the shot (camera angle, subject, action)
- notes: Technical/mood notes (lighting, color palette, camera movement, lens)

Generate 3-6 frames per request unless specified otherwise. Make shots cinematic and varied (wide, medium, close-up, inserts). Think like a cinematographer.`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, existingFrames } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextMsg = existingFrames?.length
      ? `\n\nExisting storyboard frames for context:\n${JSON.stringify(existingFrames)}`
      : "";

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
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt + contextMsg },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_frames",
                description: "Generate storyboard frames with scene headings, descriptions, and notes",
                parameters: {
                  type: "object",
                  properties: {
                    frames: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          scene: { type: "string", description: "Scene heading (e.g. INT. OFFICE - DAY)" },
                          description: { type: "string", description: "Visual shot description" },
                          notes: { type: "string", description: "Technical/mood notes" },
                        },
                        required: ["scene", "description", "notes"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["frames"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_frames" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "No frames generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const frames = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(frames), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("storyboard-assist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
