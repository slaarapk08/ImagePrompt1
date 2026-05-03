import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STYLE_PROMPTS: Record<string, string> = {
  midjourney:
    "Generate a Midjourney-optimized prompt. Use rich descriptive phrases separated by commas. Include subject, composition, lighting, style, mood, camera/lens details, and end with parameters like '--ar 16:9 --v 6 --style raw'. No filler words.",
  stable_diffusion:
    "Generate a Stable Diffusion prompt. Use comma-separated tags ordered by importance: subject, details, style, quality boosters (masterpiece, best quality, ultra detailed, 8k). Then add a 'Negative prompt:' line with common negatives.",
  dalle:
    "Generate a DALL·E 3 prompt as a single fluent natural-language paragraph (2-4 sentences). Vivid, descriptive, no tag lists or parameters.",
  photorealistic:
    "Generate a hyper-detailed photorealistic prompt. Specify camera (e.g. Sony A7R IV), lens (e.g. 85mm f/1.4), lighting setup, time of day, color grading, film stock, and physical environment. Emphasize realism.",
  artistic:
    "Generate an artistic / fine-art prompt. Reference art movements, specific artists, medium (oil, watercolor, ink), brushwork, color palette, and emotional tone.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, style = "midjourney" } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const styleInstruction = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.midjourney;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert prompt engineer for AI image generation. Analyze images with precision and produce prompts that would recreate them faithfully. Output ONLY the prompt text — no preamble, no explanations, no markdown, no quotes.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: styleInstruction },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const prompt = data.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(JSON.stringify({ prompt, style }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("image-to-prompt error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
