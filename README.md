# Gizmo's Coloring Book

An AI-powered coloring book app that generates custom coloring pages from text prompts. Built as a Christmas gift for my mom, named after her cat Gizmo.

![Gizmo's Coloring Book](gizmo.png)

## Features

- **AI Image Generation** - Text-to-image coloring pages using Google Gemini 2.5 Flash
- **Tap-to-Fill Coloring** - Flood fill with RGB threshold detection for imperfect AI-generated lines
- **Touch-Optimized UX** - Hold-to-scroll for easy navigation while zoomed in with stylus
- **Multi-Level Zoom** - 1x, 1.5x, 2x, 3x zoom levels for detailed work
- **Undo/Redo** - 20-step history for mistake-free coloring
- **Auto-Save** - Work persists in localStorage across sessions
- **PWA Support** - Installable as a native app on iPad/tablets

## Tech Stack

- **Frontend:** React 18, HTML5 Canvas
- **Backend:** Netlify Functions (serverless)
- **AI:** Google Gemini 2.5 Flash Preview (image generation)
- **Hosting:** Netlify
- **PWA:** Web App Manifest, Apple touch icons

## Technical Highlights

### Flood Fill with Threshold Detection
AI-generated line art doesn't have perfectly clean boundaries. Implemented RGB threshold detection to make paint bucket fill work reliably on slightly imperfect lines—comparing pixel color distance rather than exact matches.

### Touch Gesture Handling
Distinguishes between quick taps (fill color) and hold-and-drag (scroll canvas) using touch timing thresholds. Enables natural stylus workflow without dedicated pan/zoom modes.

### Serverless API Proxy
Netlify Function proxies requests to Gemini API, keeping the API key secure and avoiding CORS issues with client-side requests.

## Live Demo

[gizmocoloringbook.netlify.app](https://gizmocoloringbook.netlify.app)

## Local Development

```bash
npm install
netlify dev
```

Requires `GEMINI_API_KEY` environment variable.

## License

MIT
