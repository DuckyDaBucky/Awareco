# Make A Mark Live

A local, interactive demonstration of a proposed Cognizant experience for the Aston Martin Aramco Formula One Team. Conversations are prewritten. Figures come from the handoff in `content/handoff/make-a-mark-live.json`. Nothing here calls a model, takes payment, or stores an account.

This is not an official team product.

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 47231
```

Open http://127.0.0.1:47231.

## Check

```bash
npm test
npm run build
```

Presenter controls live at `/demo`. Alt+Shift+D opens them. Reset clears the browser session.

The header uses `public/assets/brand/amf1-header-white.svg` unchanged.
