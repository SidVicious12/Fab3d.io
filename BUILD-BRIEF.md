# Fab3D.io — Build Brief

## What to Build
A Text-to-CAD web app for fab3d.io. Users type a natural language description of a 3D model, and the app generates OpenSCAD code via LLM, compiles it in-browser with WASM, renders it with Three.js, and lets users download STL/SCAD files.

## Reference Architecture
Study `/tmp/CADAM/` — this is the canonical reference. It's a Vite + React + TypeScript + Tailwind + shadcn/ui app. Use this as your structural template.

## Tech Stack (Required)
- **Vite + React 18 + TypeScript**
- **Tailwind CSS + shadcn/ui** for UI components
- **Three.js + React Three Fiber (@react-three/fiber) + @react-three/drei** for 3D preview
- **OpenSCAD WASM** for in-browser CAD compilation (see https://github.com/openscad/openscad-wasm)
- **OpenAI SDK** for LLM code generation (GPT-4o)
- Deploy to **Vercel**

## Key Reference Materials
- Full PRD: `/Users/sid/fab3d-build/PRD.md` (READ THIS FIRST — it has the complete spec)
- Design screenshots: `/Users/sid/fab3d-build/design-screenshots/` (10 reference images)
- Reference repo 1: `/tmp/CADAM/` (Vite+React+TS architecture reference)
- Reference repo 2: `/tmp/text-to-cad/` (CAD generation harness)

## Project Location
`/Users/sid/fab3d-build/`

## GitHub Remote
`https://github.com/SidVicious12/Fab3d.io.git` (empty repo, already cloned)

## Landing Page Design Direction
Dark theme. Think futuristic 3D tool — dark gradient backgrounds (#1a1a2e deep navy to #0f0f23), electric blue/cyan accents (#00d4ff), clean sans-serif typography. The hero section should have a big text input asking "What do you want to create?" with a glowing generate button. Below: a 3D viewport showing a sample model. The vibe is: "AI-native CAD tool" — not a marketplace, not a blog. A tool.

## MVP Features (Build ALL of these)
1. **Landing page** with hero section, text input, and generate button
2. **LLM integration** — call OpenAI API with system prompt to generate OpenSCAD code
3. **OpenSCAD WASM execution** — compile generated code in-browser
4. **Three.js 3D viewer** — render the compiled STL with orbit controls
5. **Export buttons** — Download STL and Download SCAD
6. **Error handling** — graceful failures with user-friendly messages
7. **Responsive design** — works on desktop browsers
8. **Usage limits** — 5 free generations per day (localStorage tracking)

## System Prompt for LLM (From PRD)
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

## Important Notes
- OpenSCAD WASM is tricky. If you can't get it working perfectly, use a server-side fallback or mock the compilation and note what's needed.
- The 3D viewer is the hero feature. Make it look incredible.
- Commit frequently. Push to the GitHub remote when done.
- After building, run `npm run build` to verify it compiles.
- If Vercel CLI auth is needed, note it but don't block.

## Completion
When the build is complete:
1. Push all code to the GitHub repo
2. Send a completion message via: `openclaw message send --channel telegram --target "telegram:8054447181" --message "Fab3d.io build complete! [summary of what was built]"`

If the build fails fatally, send a failure message via the same route.
