// Vercel Serverless Function: /api/chat
// Keeps your Anthropic API key on the server. Never expose it in frontend JS.
//
// Setup:
// 1. In your Vercel project settings, add an Environment Variable:
//      ANTHROPIC_API_KEY = sk-ant-xxxxxxxx
// 2. Place this file at /api/chat.js in the repo root (Vercel auto-detects
//    files under /api as serverless functions — no extra config needed).

const SYSTEM_PROMPT = `You are the friendly, knowledgeable assistant for Divine Glow Hub,
a luxury skincare e-commerce website. You help customers with:
- Product recommendations and skincare advice (skin types, ingredients, routines)
- Order questions: tracking, order status, cancellations before shipping
- General store questions: shipping, returns, how the site works (cart, custom kits, reviews)

Keep replies concise (2-4 sentences unless more detail is asked for), warm, and on-brand for
a premium skincare boutique. If you don't know something specific about a real order or account
(you have no access to live order data), tell the user to check their Orders page or contact
support, rather than guessing. Do not give medical diagnoses — for skin conditions beyond
general skincare advice, suggest seeing a dermatologist.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server misconfigured: missing API key" });
    return;
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Only keep the last ~12 turns to bound cost/latency
    const trimmed = messages.slice(-12).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000),
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      res.status(502).json({ error: "Assistant is temporarily unavailable" });
      return;
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "Sorry, I didn't get a response.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat function error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
