# Prompt Enhancer

A minimal, professional web app that rewrites a rough prompt into a clearer, more effective one,
using the Groq API. Built as a React (Vite) frontend with a Node serverless backend, structured
for zero-config deployment on Vercel.

## Project structure

```
prompt-enhancer/
├── api/
│   └── enhance.js        # Vercel serverless function, calls the Groq API
├── client/                # React (Vite) frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json           # Root build script for Vercel
├── vercel.json             # Routing + build configuration
└── .env.example
```

There is no database in this version — the app is stateless (it just transforms text on request).
If you later want to save prompt history per user, you can add MongoDB/Mongoose inside a new
`api/` route without changing the rest of the setup.

## 1. Get a Groq API key

Create a free key at https://console.groq.com/keys.

## 2. Local development

You need two terminals: one for the frontend, one for the API.

**Install dependencies**

```bash
cd client
npm install
```

**Run the API locally with the Vercel CLI** (recommended, from the project root)

```bash
npm install -g vercel
vercel dev
```

This serves both `/api/enhance` and the built frontend on one port (usually `http://localhost:3000`).

Alternatively, to run just the frontend with hot reload while pointing at a deployed API, run:

```bash
cd client
npm run dev
```

and set `VITE`'s dev proxy target in `client/vite.config.js` to your API's URL.

**Set your environment variable locally**

Copy `.env.example` to `.env` at the project root and add your key:

```bash
cp .env.example .env
```

```
GROQ_API_KEY=your_groq_api_key_here
```

## 3. Deploy to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, click **Add New Project** and import the repository.
3. Vercel will detect `vercel.json` and use:
   - Build command: `npm run build`
   - Output directory: `client/dist`
   - The `api/` folder is deployed automatically as serverless functions.
4. Under **Project Settings → Environment Variables**, add:
   - `GROQ_API_KEY` = your Groq API key
5. Deploy. Your app will be live at `https://your-project.vercel.app`.

## How it works

- The frontend sends the raw prompt to `POST /api/enhance`.
- The serverless function sends it to Groq's chat completions endpoint
  (`llama-3.3-70b-versatile`) with a system instruction that asks the model to return only the
  improved prompt text.
- The enhanced prompt is returned as JSON and rendered in the UI, with a copy button and an
  option to feed the result back in as a new starting point.

## Customizing the model

The Groq model is set in `api/enhance.js`:

```js
model: 'llama-3.3-70b-versatile',
```

Swap this for any other model available in your Groq account if you'd like a different
speed/quality trade-off.
