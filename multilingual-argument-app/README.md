# CrossTalk — Multilingual Argument App

A Netlify-ready single-page web app for the multilingual argument challenge.

## What it does

- Two participants choose different languages.
- Each person writes or speaks in their own language.
- Messages appear as a live conversation.
- The app translates each message into the other participant's language.
- Browser speech synthesis reads translated messages aloud.
- Browser speech recognition allows microphone input.
- An **Interrupt** button lets the other participant cut in.
- The UI includes an active argument state, timer, turn indicator and emotional/interrupt styling.
- Works as a static site on Netlify — no server is required for the core demo.

## Netlify deployment

### Option 1 — Drag and drop

1. Zip/unzip the project.
2. Open Netlify.
3. Add a new site.
4. Drag the project folder into Netlify Drop.
5. Netlify will publish `index.html`.

### Option 2 — GitHub

Push this folder to GitHub, then in Netlify choose **Add new site → Import an existing project** and select the repository.

Build command: **leave blank**

Publish directory: **`.`**

## Translation

The app has a small built-in demo dictionary for reliable demo phrases.

For messages outside that dictionary it tries the MyMemory public translation endpoint. Public translation services have usage limits, so for a production version you should connect a proper translation provider through a Netlify Function.

Recommended production architecture:

Browser → `/api/translate` → Netlify Function → translation provider

Never put a paid API secret directly in `assets/app.js`.

## Voice

Speech recognition and speech synthesis use browser APIs. Chrome/Edge generally provide the best support.

Microphone permission must be granted by the browser.

## Demo flow

1. Choose English + Hindi (or another pair).
2. Click **Start the argument**.
3. Select Person A.
4. Type: `Why are you always late?`
5. Send.
6. Switches to Person B automatically.
7. Use the microphone or type a reply.
8. Press **INTERRUPT** to cut in.
9. Watch the translated messages appear under each original message.

## Suggested pitch

"CrossTalk is a live conversation layer for two people who don't share a language. It doesn't force either person to switch languages. They speak naturally, interrupt, react and change their minds while the system translates the conversation between them."

## Files

- `index.html` — application UI
- `assets/style.css` — responsive visual design
- `assets/app.js` — conversation, translation, voice and interaction logic
- `netlify/functions/` — reserved for secure production API integrations
