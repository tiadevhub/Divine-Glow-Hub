# Adding the chatbot to Divine Glow Hub

## Files in this package
- `chatbot.css` — widget styling
- `chatbot.js` — widget UI + logic (talks to `/api/chat`)
- `api/chat.js` — Vercel serverless function that calls Claude's API server-side

## 1. Add files to your repo
Copy these into your repo like this:

```
Divine-Glow-Hub/
├── chatbot.css        ← new
├── chatbot.js          ← new
├── api/
│   └── chat.js         ← new
├── index.html
├── shop.html
├── ...
```

## 2. Include the widget on your pages
Add this to the `<head>` of each HTML page you want the chatbot on
(or just add it to every page for a site-wide assistant):

```html
<link rel="stylesheet" href="chatbot.css">
```

And this right before the closing `</body>` tag:

```html
<script src="chatbot.js"></script>
```

Tip: if all your pages already share a common include/footer, add it there once
instead of editing every file individually.

## 3. Get a Claude API key
1. Go to https://console.anthropic.com
2. Sign up / log in, add billing
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

## 4. Add the key to Vercel
1. Open your project on https://vercel.com
2. **Settings → Environment Variables**
3. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key
   - Environment: Production (and Preview/Development if you test locally)
4. Redeploy

Vercel auto-detects `api/chat.js` as a serverless function — no extra config needed.

## 5. Test locally (optional)
```bash
npm i -g vercel
vercel dev
```
Then open the site locally and try the chat widget.

## Customizing
- Edit `SYSTEM_PROMPT` in `api/chat.js` to change what the bot knows/focuses on
  (e.g. paste in real product names, shipping policy, FAQ).
- Colors in `chatbot.css` are set to a gold/cream palette to match a luxury
  skincare look — tweak the `#c9a15a` / `#8a6d3b` hex values to match your
  exact brand colors.
- `model: "claude-sonnet-5"` in `api/chat.js` — swap for `"claude-haiku-4-5-20251001"`
  if you want a cheaper/faster model for simple Q&A.
