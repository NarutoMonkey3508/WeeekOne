// WeeekOne idea assistant: a Netlify Function that talks to Claude.
// The browser sends the chat so far; this adds the instructions, calls Claude and
// returns the reply. The API key lives in Netlify's environment variables
// (ANTHROPIC_API_KEY) and never reaches the browser.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";

// Limits that keep a public page from running up the bill.
const MAX_MESSAGES = 24;          // about 12 back-and-forths per chat
const MAX_CHARS_PER_MESSAGE = 1500;
const MAX_TOTAL_CHARS = 16000;
const MAX_TOKENS = 4000;          // per reply (includes the model's thinking)

const SYSTEM = `You are the idea assistant on the WeeekOne website.

About WeeekOne: a small student-run studio. It gets local businesses online in one week (website, Google Maps listing, Instagram, logo and menu), and it offers Idea Launch for $400: name ideas, a logo, a landing page with a waitlist sign-up, and a short brand guide, usually within a week.

Your job: help the visitor find a small business idea that fits them.
- Ask one short question at a time, three or four questions at most before suggesting ideas. Useful things to learn: what they enjoy or are good at, who they'd like to help, online or in person near them, how much time and money they can put in.
- Then suggest 3 specific ideas. For each one: the idea name in **bold**, one line on why it fits them, and a cheap first step they could take this week to test it.
- After that, help them compare or refine the ideas, or narrow down to one.

Style: friendly, plain words, like a helpful older friend. Keep replies short: under 120 words, or under 250 when you list the 3 ideas. Use "-" bullet lists and **bold** only. No headings, tables, code or emoji.

Be honest and safe:
- Never promise income, sales or success, and never make up statistics.
- Say when an idea needs a licence, permit, insurance or food-safety rules, and tell them to check their local rules.
- Many visitors may be young. Keep ideas safe and legal. If someone says they are under 18, suggest they involve a parent or guardian for money, contracts or meeting customers.
- Don't ask for personal details such as full name, address, phone number or school. If they share them, don't repeat them.

When they've picked an idea or sound ready, mention once that they can tap "Send my idea to WeeekOne" under the chat to get help launching it with Idea Launch. Don't be pushy.

Stay on topic: business ideas and starting a small business. If asked about something else, kindly steer back. Don't write homework, essays or code.`;

const json = (status, body) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function cleanMessages(input) {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;
  let total = 0;
  const out = [];
  for (let i = 0; i < input.length; i++) {
    const m = input[i];
    const role = i % 2 === 0 ? "user" : "assistant"; // must alternate, starting with the visitor
    if (!m || m.role !== role || typeof m.content !== "string") return null;
    const content = m.content.trim();
    if (!content || content.length > MAX_CHARS_PER_MESSAGE) return null;
    total += content.length;
    out.push({ role, content });
  }
  if (out[out.length - 1].role !== "user" || total > MAX_TOTAL_CHARS) return null;
  return out;
}

function allowedOrigin(req) {
  const origin = req.headers.get("origin");
  const site = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL].filter(Boolean);
  if (site.length === 0 || !origin) return true; // local testing
  return site.some(u => new URL(u).origin === origin);
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!allowedOrigin(req)) return json(403, { error: "forbidden" });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: "not_configured" });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "bad_request" }); }
  const messages = cleanMessages(body && body.messages);
  if (!messages) return json(400, { error: "too_long_or_invalid" });

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      output_config: { effort: "low" }, // chat: quick replies, lower cost
      // If a safety check declines a reply, the API retries on a suitable fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages,
    });

    if (response.stop_reason === "refusal") {
      return json(200, { reply: "I can't help with that one. Let's get back to finding a business idea that fits you. What do you enjoy doing?" });
    }
    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    if (!text) return json(502, { error: "empty_reply" });
    return json(200, { reply: text, cut_off: response.stop_reason === "max_tokens" });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error("Idea assistant: API key problem:", error.message);
      return json(503, { error: "not_configured" });
    }
    if (error instanceof Anthropic.RateLimitError) return json(429, { error: "busy" });
    if (error instanceof Anthropic.BadRequestError) {
      console.error("Idea assistant: bad request:", error.message);
      return json(400, { error: "bad_request" });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Idea assistant: API error ${error.status}:`, error.message);
      return json(502, { error: "upstream" });
    }
    console.error("Idea assistant: unexpected error:", error);
    return json(500, { error: "server" });
  }
};

export const config = { path: "/api/idea-chat" };
