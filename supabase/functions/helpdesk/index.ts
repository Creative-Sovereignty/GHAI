import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FAQ_KNOWLEDGE = `
Golden Hour AI FAQ:
- Golden Hour AI is an AI-powered filmmaking studio for creating short films from script to screen.
- No filmmaking experience needed. AI assists with each step.
- Features: Script Editor, Storyboard Studio, Shot List Tracker, Veo 3 video generation, Timeline Editor, AI Music Studio.
- All content is private and protected by row-level security.
- It's a PWA - installable on mobile via browser "Add to Home Screen".
- Uses state-of-the-art AI models for text, image, music, and video generation.
- Free plan includes 3 projects and 5 AI generations/mo. Pro ($19/mo) and Studio ($49/mo) plans available.
- Videos export as standard MP4 format.
- For support issues, you can create a ticket and the team will follow up.
`;

const SYSTEM_PROMPT = `You are the Golden Hour AI support assistant. You help users with questions about the Golden Hour AI filmmaking platform.

${FAQ_KNOWLEDGE}

Guidelines:
- Be friendly, helpful, and concise.
- Answer questions using the FAQ knowledge above.
- If a user describes a bug or issue you cannot resolve, offer to create a support ticket.
- When creating a ticket, confirm the details with the user and use the create_ticket tool.
- Format responses with markdown when helpful.
- Stay on topic - you only help with Golden Hour AI related questions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, createTicket } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Handle ticket creation
    if (createTicket) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("support_tickets").insert({
        subject: createTicket.subject,
        description: createTicket.description,
        email: createTicket.email || null,
        status: "open",
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: "Ticket created successfully!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream AI response
    const tools = [
      {
        type: "function",
        function: {
          name: "create_ticket",
          description: "Create a support ticket when the user has an issue that needs human follow-up",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Brief summary of the issue" },
              description: { type: "string", description: "Detailed description of the problem" },
              email: { type: "string", description: "User's email for follow-up (if provided)" },
            },
            required: ["subject", "description"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("helpdesk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
