// Supabase Edge Function: ai-assistant
// Deploy with: supabase functions deploy ai-assistant
// Set secret: supabase secrets set GEMINI_API_KEY=your_key
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiKey) return new Response(JSON.stringify({ error: "AI service is not configured." }), { status: 503, headers: cors });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "Sign in required." }), { status: 401, headers: cors });
  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response(JSON.stringify({ error: "Invalid session." }), { status: 401, headers: cors });

  try {
    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 8000) : "";
    const mode = typeof body.mode === "string" ? body.mode.slice(0, 80) : "Answer a question";
    if (!prompt) return new Response(JSON.stringify({ error: "Prompt is required." }), { status: 400, headers: cors });

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(geminiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: "You are NEBULA DESTINY's helpful assistant. Be accurate, clear, safe, and age-appropriate. If unsure, say so. The user's selected task is: " + mode }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.7 }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: result?.error?.message || "AI provider request failed." }), { status: 502, headers: cors });
    }
    const text = result?.candidates?.[0]?.content?.parts?.map((p: {text?: string}) => p.text || "").join("") || "No text response returned.";
    return new Response(JSON.stringify({ text }), { status: 200, headers: cors });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Could not process this AI request." }), { status: 500, headers: cors });
  }
});
