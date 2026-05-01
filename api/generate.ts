import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a parametric 3D CAD code generator for fab3d.io.

Your ONLY output is valid OpenSCAD code. Do NOT include:
- Markdown code fences (no \`\`\`openscad or \`\`\`)
- Explanations or commentary before/after code
- HTML or formatting of any kind

Rules for the OpenSCAD code you generate:
1. All dimensions must be in millimeters (mm)
2. Define all key dimensions as variables at the top (e.g., height = 40;)
3. Models must be manifold (watertight) and printable on FDM 3D printers
4. Default wall thickness: 2mm minimum unless specified
5. Use standard OpenSCAD primitives: cube(), cylinder(), sphere(), difference(), union(), translate(), rotate()
6. Keep models under 150 lines of code for performance
7. Assume the model will be 3D printed on a Bambu Lab or Prusa printer

Example output for "a simple box 40x30x20mm":
// Simple Box
width = 40;
depth = 30;
height = 20;
cube([width, depth, height]);

Now generate OpenSCAD code for the following user request:`;

// Simple in-memory rate limiting (resets on cold start)
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const entry = ipCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + hourMs });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { prompt, previousError } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (prompt.length > 500) {
    return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://fab3d.io',
      'X-Title': 'Fab3D',
    },
  });

  const userMessage = previousError
    ? `${previousError}\n\nPlease fix the code for this request: ${prompt}`
    : prompt;

  try {
    const completion = await client.chat.completions.create({
      model: 'xiaomi/mimo-v2-pro',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const scadCode = completion.choices[0]?.message?.content?.trim() ?? '';

    if (!scadCode) {
      return res.status(500).json({ error: 'No code generated. Try rephrasing your prompt.' });
    }

    // Strip any accidental code fences
    const cleaned = scadCode
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/^```\n?/gm, '')
      .trim();

    return res.status(200).json({ scadCode: cleaned });
  } catch (err) {
    console.error('API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Generation failed: ${message}` });
  }
}
