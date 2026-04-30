# Product Requirements Document
## Text-to-CAD Feature for fab3d.io
**Version:** 1.0  
**Date:** April 29, 2026  
**Entity:** Fab3D LLC  
**Owner:** Open Cloth Build Session — ChatGPT 5.5 Pro  
**Status:** Ready to Build

---

## 1. Executive Summary

This PRD defines the complete build requirements for a **Text-to-CAD** feature to be deployed on **fab3d.io**. The feature enables users to type a natural language description (e.g., *"a 30mm hollow cylinder with 2mm walls and a flat lid"*) and instantly receive a browser-rendered, downloadable 3D model (STL/SCAD/OBJ).

The reference implementation is **[earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)**. The open-source architecture stack from **[Adam-CAD/CADAM](https://github.com/Adam-CAD/CADAM)** serves as the canonical technical blueprint. This product will be cloned, adapted, and deployed to fab3d.io under Fab3D LLC.

This is a **0-to-1 overnight build**. The document is written to be executed directly by an AI coding agent (Open Cloth / ChatGPT 5.5 Pro).

---

## 2. Background & Strategic Fit

Per the Fab3D LLC business plan (December 2025), the company's strategic roadmap includes:

- **80% near-term revenue:** AI product photography for 3D printing sellers
- **20% strategic growth driver:** Image-to-3D and Text-to-3D model generation

Text-to-CAD directly advances the 20% strategic pillar. It is the fastest path to differentiating fab3d.io as an **AI-native 3D tool platform**, not just a marketplace or photography tool.

**Key insight from market research:** No competitor currently offers a consumer-grade, 3D-printing-optimized text-to-CAD web app with print-ready STL export. Meshy.ai and Luma AI offer image-to-3D but require design skills or cost $20–100/month. This feature, deployed free-to-try on fab3d.io, creates a meaningful first-mover advantage.

---

## 3. Problem Statement

**User Problem:**  
3D printing creators and sellers cannot design 3D models from scratch. They lack CAD skills (Fusion 360, Blender, FreeCAD), lack time to learn, and face a creative bottleneck — they have ideas but cannot make them printable.

**Current alternatives are broken:**
- CAD software (Fusion 360, SolidWorks) → requires months of learning
- Meshy.ai / Luma AI → image-to-3D, not text-driven; not print-optimized
- Generic ChatGPT/Claude → can generate OpenSCAD code but provides no renderer or export

**The gap:** A simple, browser-native tool where a 3D printing hobbyist types what they want and downloads a print-ready STL in under 60 seconds.

---

## 4. Goals & Success Metrics

### Primary Goals (MVP — Build Tonight)
- [ ] Text prompt → 3D model rendered in-browser within 30 seconds
- [ ] Export as `.stl` and `.scad` formats
- [ ] Works on desktop Chrome/Firefox/Safari without installation
- [ ] Deploys to fab3d.io (Vercel or existing host)

### Secondary Goals (Post-MVP, Week 2)
- [ ] User accounts with generation history
- [ ] Parametric sliders for dimension tuning
- [ ] Image reference input (describe + show a photo)
- [ ] Credit-based usage system (free tier: 5/day, paid: unlimited)

### Success Metrics (30-day post-launch)
| Metric | Target |
|---|---|
| Unique users | 500+ |
| Models generated | 2,000+ |
| STL downloads | 800+ |
| Free → paid conversion | 8–12% |
| Average generation time | <30s |

---

## 5. User Personas

### Persona 1: The Etsy Seller (Primary)
- **Name:** Jake, 32, sells 3D printed organizers on Etsy
- **Pain:** Can't design new products; relies on free STLs from Printables
- **Goal:** Generate unique products that competitors don't have
- **Quote:** *"If I could just type what I want and get an STL, I'd pay for that."*

### Persona 2: The Hobbyist Maker (Secondary)
- **Name:** Maria, 28, has a Bambu Lab X1C
- **Pain:** Has creative ideas but no CAD training
- **Goal:** Print custom brackets, cases, and figurines
- **Quote:** *"I've been wanting a custom cable clip for months but can't model anything."*

### Persona 3: The Product Developer (Tertiary)
- **Name:** Derek, 45, runs a small hardware company
- **Pain:** Rapid prototyping is slow and expensive
- **Goal:** Generate concept models for client presentations
- **Quote:** *"I just need something to 3D print for a client meeting. It doesn't need to be perfect."*

---

## 6. User Flow (MVP)

```
Landing Page (fab3d.io/text-to-cad)
        │
        ▼
[Text Input Box]
"Describe your 3D model..."
        │
        ▼
[Generate Button] ──► API Call to LLM (ChatGPT / Claude)
                            │
                            ▼
                     LLM generates OpenSCAD code
                            │
                            ▼
                  OpenSCAD WASM executes in-browser
                            │
                            ▼
              Three.js renders 3D preview (rotate/zoom)
                            │
                      ┌─────┴─────┐
                      ▼           ▼
              [Download STL]  [Download .SCAD]
                      │
                      ▼
              (Optional) Sign up to save / get more credits
```

---

## 7. Feature Requirements

### 7.1 MVP Features (Build Tonight)

#### F1: Text Prompt Input
- Single text area, placeholder: *"e.g., A hollow cylinder 40mm tall, 25mm diameter, 2mm wall thickness with a removable flat lid"*
- Character limit: 500 characters
- Submit via Enter key or "Generate" button
- Show character counter

#### F2: LLM Code Generation
- Call OpenAI API (GPT-4o or GPT-5 if available) or Anthropic Claude API
- System prompt (see Section 9) instructs model to output valid OpenSCAD code only
- Strip markdown/code fences from output before passing to WASM engine
- Fallback prompt retry if output fails WASM validation (max 2 retries)

#### F3: In-Browser OpenSCAD WASM Execution
- Use `openscad-wasm` (https://github.com/openscad/openscad-wasm) to compile OpenSCAD code client-side
- No server-side rendering for MVP (reduces infra cost to ~$0)
- Generate `.stl` from OpenSCAD source in-browser
- Show spinner + "Generating your model…" during execution

#### F4: 3D Preview Renderer
- Use **Three.js** + **React Three Fiber** for STL preview
- Orbit controls (mouse drag to rotate, scroll to zoom)
- Auto-center and auto-scale model on load
- Background: dark gradient (#1a1a2e or similar — brand-consistent with fab3d.io)
- Show model dimensions overlay (bounding box: W x D x H in mm)

#### F5: Export Buttons
- **Download STL** — triggers browser file download of generated `.stl`
- **Download .SCAD** — downloads raw OpenSCAD source code
- File naming: `fab3d_{timestamp}.stl`

#### F6: Usage Limits (Guest)
- Guest users: 5 generations per day (tracked via localStorage + IP if possible)
- Show remaining credit counter: "3/5 free generations remaining today"
- On limit reached: show sign-up modal with offer ("Sign up free for 10/day")

#### F7: Error Handling
- If LLM returns non-OpenSCAD output → show: "Hmm, couldn't generate that. Try rephrasing."
- If WASM fails to compile → show error + display raw SCAD code for debugging
- Network error → "Connection issue. Please try again."
- Loading timeout (>60s) → "This one's taking longer than expected. Still working…"

---

### 7.2 Post-MVP Features (Week 2+)

#### F8: Parametric Sliders
- After generation, extract numeric values from OpenSCAD variables
- Render as sliders (e.g., "Height: [──●──] 40mm")
- Changing slider re-runs WASM without new LLM call (fast, <2s)
- Reference: CADAM implementation at adam.new/cadam

#### F9: Image Reference Input
- Allow image upload alongside text prompt
- Pass image URL to Claude/GPT-4o vision API for visual grounding
- Useful for "Make a version of this bracket but 10mm taller" flows

#### F10: User Accounts & History
- Supabase auth (email/password + Google OAuth)
- Save all generations with prompt + SCAD code + thumbnail
- "My Models" dashboard

#### F11: Credit System
- Free: 10 generations/day (logged in)
- Starter ($9/mo): 100 generations/month
- Pro ($29/mo): unlimited (integrates with existing fab3d.io billing via Stripe)

#### F12: Share & Embed
- Shareable link to any generated model (public viewer)
- Embed code for blogs/forums: `<iframe src="fab3d.io/model/{id}">`

---

## 8. Technical Architecture

### 8.1 Architecture Overview

```
┌────────────────────────────────────────────────────┐
│                   fab3d.io Frontend                │
│         React 18 + TypeScript + Vite               │
│                                                    │
│  ┌──────────────┐     ┌───────────────────────┐    │
│  │ Text Input   │────►│  LLM API Service      │    │
│  │ Component    │     │  (OpenAI / Claude)    │    │
│  └──────────────┘     └──────────┬────────────┘    │
│                                  │ OpenSCAD Code   │
│                       ┌──────────▼────────────┐    │
│                       │  openscad-wasm         │    │
│                       │  (in-browser engine)   │    │
│                       └──────────┬────────────┘    │
│                                  │ STL Buffer      │
│                       ┌──────────▼────────────┐    │
│                       │  Three.js Renderer    │    │
│                       │  (React Three Fiber)  │    │
│                       └──────────┬────────────┘    │
│                                  │                 │
│                       ┌──────────▼────────────┐    │
│                       │  Export: STL / SCAD   │    │
│                       └───────────────────────┘    │
└────────────────────────────────────────────────────┘
            │                         │
   ┌────────▼──────┐         ┌────────▼──────┐
   │  Supabase     │         │  OpenAI /     │
   │  (Auth + DB)  │         │  Anthropic    │
   │  (Post-MVP)   │         │  API          │
   └───────────────┘         └───────────────┘
```

### 8.2 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript + Vite | Fast dev, type safety, matches CADAM reference |
| **3D Rendering** | Three.js + React Three Fiber (R3F) | Industry standard, handles STL well |
| **CAD Engine** | OpenSCAD WebAssembly | Browser-native, no server needed, free |
| **AI Backend** | OpenAI GPT-4o API (or Claude 3.5 Sonnet) | Best code generation for OpenSCAD |
| **Backend/Auth** | Supabase (post-MVP) | PostgreSQL + edge functions + auth in one |
| **Styling** | Tailwind CSS + shadcn/ui | Fast UI, accessible, matches modern design |
| **Deployment** | Vercel | Zero-config deploy, CI/CD from GitHub |
| **Domain** | fab3d.io/text-to-cad | Subdirectory or subdomain |
| **Payments** | Stripe (existing Fab3D LLC account) | Already set up per business plan |

### 8.3 Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "@react-three/fiber": "^8.0.0",
    "@react-three/drei": "^9.0.0",
    "three": "^0.160.0",
    "openscad-wasm": "^0.4.1",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "@supabase/supabase-js": "^2.0.0",
    "tailwindcss": "^3.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## 9. LLM System Prompt (Critical)

This is the most important technical asset. The system prompt must constrain the LLM to produce only valid, executable OpenSCAD code that fab3d.io's WASM engine can compile.

```
You are a parametric 3D CAD code generator for fab3d.io.

Your ONLY output is valid OpenSCAD code. Do NOT include:
- Markdown code fences (no ```openscad or ```)
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

Now generate OpenSCAD code for the following user request:
```

### 9.1 Prompt Enhancement Tips for Edge Cases
- If user asks for text/lettering: use `linear_extrude` + `text()` in OpenSCAD
- If user asks for threads: use BOSL2 library (`include <BOSL2/std.scad>`)
- If model fails WASM compile: add retry with note "Previous code failed. Fix this OpenSCAD code: [error]"

---

## 10. Component Breakdown

### 10.1 Component Tree

```
<App>
  <Header logo="fab3d.io" nav=["Home", "Text-to-CAD", "Pricing"] />
  <TextToCADPage>
    <PromptPanel>
      <PromptInput />
      <GenerateButton />
      <ExamplePrompts />         // "Try: a phone stand, a cable clip..."
      <CreditCounter />          // "3/5 free generations today"
    </PromptPanel>
    <ModelViewerPanel>
      <LoadingSpinner />         // shown during generation
      <ModelViewer>              // Three.js canvas
        <OrbitControls />
        <STLGeometry />
        <DimensionOverlay />
      </ModelViewer>
      <ExportButtons>
        <DownloadSTL />
        <DownloadSCAD />
        <ShareButton />          // post-MVP
      </ExportButtons>
      <RawCodeViewer />          // collapsible, shows OpenSCAD source
    </ModelViewerPanel>
  </TextToCADPage>
  <SignUpModal />                // shown on credit limit
  <Footer />
</App>
```

### 10.2 Core Hook: `useTextToCAD`

```typescript
// hooks/useTextToCAD.ts
interface UseTextToCADResult {
  generate: (prompt: string) => Promise<void>;
  scadCode: string | null;
  stlBuffer: ArrayBuffer | null;
  isLoading: boolean;
  error: string | null;
  dimensions: { width: number; depth: number; height: number } | null;
}

export function useTextToCAD(): UseTextToCADResult {
  // 1. Call /api/generate with prompt → get OpenSCAD code
  // 2. Pass SCAD code to openscad-wasm → get STL ArrayBuffer
  // 3. Parse bounding box from STL for dimension display
  // 4. Return stlBuffer to ModelViewer for Three.js rendering
}
```

### 10.3 API Route: `/api/generate`

```typescript
// api/generate.ts (Vercel serverless function)
export default async function handler(req, res) {
  const { prompt } = req.body;
  
  // Rate limiting check
  // Call OpenAI API with system prompt + user prompt
  // Strip code fences from response
  // Return { scadCode: string }
}
```

---

## 11. File Structure

```
fab3d-text-to-cad/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── PromptInput.tsx
│   │   ├── GenerateButton.tsx
│   │   ├── ModelViewer.tsx           // Three.js R3F canvas
│   │   ├── STLLoader.tsx             // loads STL buffer into R3F
│   │   ├── ExportButtons.tsx
│   │   ├── CreditCounter.tsx
│   │   ├── RawCodeViewer.tsx
│   │   ├── SignUpModal.tsx
│   │   ├── ExamplePrompts.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useTextToCAD.ts           // main orchestration hook
│   │   ├── useOpenSCAD.ts            // WASM wrapper
│   │   └── useCredits.ts             // localStorage credit tracker
│   ├── lib/
│   │   ├── openai.ts                 // OpenAI client setup
│   │   ├── openscad-wasm-loader.ts   // WASM init
│   │   ├── stl-utils.ts              // STL parse + bounding box
│   │   └── prompts.ts                // system prompt constants
│   ├── pages/
│   │   ├── index.tsx                 // landing / marketing
│   │   └── text-to-cad.tsx           // main feature page
│   ├── styles/
│   │   └── globals.css
│   └── App.tsx
├── api/
│   └── generate.ts                   // serverless API route
├── .env.local                        // OPENAI_API_KEY, etc.
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 12. Environment Variables

```bash
# .env.local
VITE_OPENAI_API_KEY=sk-...          # or use server-side only
OPENAI_API_KEY=sk-...               # server-side API calls (Vercel)
ANTHROPIC_API_KEY=sk-ant-...        # fallback / alternative LLM
VITE_SUPABASE_URL=https://...       # post-MVP
VITE_SUPABASE_ANON_KEY=eyJ...       # post-MVP
STRIPE_SECRET_KEY=sk_live_...       # post-MVP billing
```

> ⚠️ **Security note:** Never expose `OPENAI_API_KEY` in client-side code. All LLM calls must route through `/api/generate` serverless function on Vercel.

---

## 13. Deployment to fab3d.io

### 13.1 Option A — Subdirectory (Recommended for tonight)
Deploy the app to Vercel and route `fab3d.io/text-to-cad` via Vercel rewrites or nginx proxy to the new Next.js/Vite app.

```json
// vercel.json
{
  "rewrites": [
    { "source": "/text-to-cad/(.*)", "destination": "/$1" }
  ]
}
```

### 13.2 Option B — Subdomain
Deploy to `cad.fab3d.io` — fastest path, no routing conflicts.

### 13.3 Deployment Steps

```bash
# 1. Clone and install
git clone https://github.com/Adam-CAD/CADAM.git fab3d-text-to-cad
cd fab3d-text-to-cad
npm install

# 2. Configure env variables
cp .env.local.template .env.local
# Fill in OPENAI_API_KEY and Supabase keys

# 3. Update branding
# - Replace Adam CAD logo with Fab3D logo
# - Update color scheme to match fab3d.io
# - Change app title to "Fab3D Text-to-CAD"
# - Update system prompt in src/lib/prompts.ts

# 4. Test locally
npm run dev

# 5. Deploy to Vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

---

## 14. Design Spec

### 14.1 Visual Language
- Match fab3d.io brand (dark theme preferred for 3D visualization)
- Model viewer background: `#111827` (dark slate)
- Primary accent: `#6366f1` (indigo) or existing fab3d.io brand color
- Font: Inter or Geist (already in CADAM)

### 14.2 Landing Page Copy

**Hero Headline:**  
`Turn Words into 3D Models. Instantly.`

**Sub-headline:**  
`Describe what you want to print. Fab3D generates a ready-to-print STL in seconds. No CAD skills required.`

**CTA Button:** `Try It Free →`

**Social Proof (placeholder):**  
`Join 500+ makers generating models with Fab3D AI`

### 14.3 Example Prompts (shown below input)
- `A wall-mount phone holder with a 15-degree tilt`
- `A 40mm diameter knob with a D-shaped 6mm shaft hole`
- `A business card holder that holds 20 cards at 70-degree angle`
- `A cable clip for a 5mm cable with a desk edge mount`

---

## 15. Build Order (Overnight Execution Sequence)

This is the prioritized build sequence for Open Cloth / ChatGPT 5.5 Pro:

### Phase 1: Foundation (Hours 1–2)
1. `npm create vite@latest fab3d-cad -- --template react-ts`
2. Install all dependencies (Three.js, R3F, Tailwind, shadcn/ui)
3. Set up Vercel project + GitHub repo
4. Configure environment variables

### Phase 2: Core Pipeline (Hours 2–5)
5. Build `/api/generate` serverless function with OpenAI call + system prompt
6. Integrate `openscad-wasm` — initialize and expose `compile(scadCode)` → `ArrayBuffer`
7. Build `useTextToCAD` hook connecting prompt → LLM → WASM → STL buffer
8. Build `ModelViewer` component with Three.js R3F + STL geometry loader

### Phase 3: UI Layer (Hours 5–7)
9. Build `PromptInput` + `GenerateButton` with loading state
10. Build `ExportButtons` (STL + SCAD downloads)
11. Build `CreditCounter` with localStorage tracking
12. Add `ExamplePrompts` chip row
13. Add `RawCodeViewer` collapsible panel
14. Apply Tailwind styling + dark theme

### Phase 4: Polish & Deploy (Hours 7–8)
15. Error handling for all failure states
16. Responsive layout (mobile-friendly)
17. Update branding to fab3d.io (logo, colors, title)
18. `vercel --prod` deploy
19. Test end-to-end on live URL
20. Share link

---

## 16. Quality Checklist (Pre-Launch)

- [ ] Text prompt → STL generated in <30s on average prompt
- [ ] STL downloads correctly and opens in Cura/PrusaSlicer
- [ ] SCAD file downloads and is valid OpenSCAD
- [ ] 3D viewer: rotate, zoom, pan all work
- [ ] Credit counter: counts down, resets after 24h
- [ ] Sign-up modal shows at credit limit
- [ ] Error messages show for bad prompts or network failures
- [ ] Works on Chrome, Firefox, Safari (desktop)
- [ ] Loads on mobile (may not be interactive — acceptable for MVP)
- [ ] Deployed to Vercel, accessible via fab3d.io URL
- [ ] No API keys exposed in client bundle

---

## 17. Cost & Revenue Model

### Infrastructure Cost (MVP)
| Item | Monthly Cost |
|---|---|
| Vercel (Hobby/Pro) | $0–$20 |
| OpenAI API (GPT-4o @ $0.005/call, 2,000 calls/month) | ~$10 |
| Supabase (free tier) | $0 |
| **Total** | **~$10–$30/month** |

### Revenue Potential
Referencing the Fab3D LLC business plan financial model:
- **Free tier conversion:** 8–12% → at 500 users/month = 40–60 paid users
- **Starter plan ($9/mo):** 40 users = $360 MRR in month 1
- **By Month 3:** ~200 paid users = $1,800+ MRR from this feature alone

This feature is a **top-of-funnel acquisition driver** — users discover fab3d.io through Text-to-CAD, then upsell into AI product photography tools (the 80% revenue core).

---

## 18. Open Questions / Decisions Needed

| # | Question | Recommended Answer |
|---|---|---|
| 1 | Use GPT-4o or Claude 3.5 Sonnet for code gen? | GPT-4o (better at OpenSCAD code) |
| 2 | Server-side or client-side WASM? | Client-side WASM (cheaper, faster) |
| 3 | Deploy as subdirectory or subdomain? | Subdomain `cad.fab3d.io` for MVP speed |
| 4 | Use CADAM as base or build from scratch? | Fork CADAM, rebrand — saves 6+ hours |
| 5 | Supabase for auth on day 1? | No — localStorage only for MVP |
| 6 | Support STEP/OBJ export on day 1? | No — STL + SCAD only |

---

## 19. References

| Resource | Link | Purpose |
|---|---|---|
| Reference Implementation | https://github.com/earthtojake/text-to-cad | Original inspiration |
| Open Source Base | https://github.com/Adam-CAD/CADAM | Fork for overnight build |
| OpenSCAD WASM | https://github.com/openscad/openscad-wasm | Browser CAD engine |
| Fab3D Business Plan | Internal (December 2025) | Strategic context |
| CADAM Live Demo | https://adam.new/cadam | UX reference |
| Text2CAD Paper (NeurIPS 2024) | https://sadilkhan.github.io/text2cad-project/ | Academic backing |

---

*Document prepared by Perplexity AI for Open Cloth / ChatGPT 5.5 Pro build session.*  
*Entity: Fab3D LLC | Target deployment: fab3d.io | Build window: Overnight*
