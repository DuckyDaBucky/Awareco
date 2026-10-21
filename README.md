# Make A Mark Live

Interactive demonstration for the Aston Martin Aramco Formula One Team. Fans move through the car, the people behind the programmes, and a partner view. AI.lonso guides them with stored questions and answers.

Public repository: [github.com/DuckyDaBucky/Awareco](https://github.com/DuckyDaBucky/Awareco)

This is a local demonstration. It does not call a model, take payment, or store an account. It is not an official team product. The build notes for the next person are in [`context/`](context/README.md).

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:47231](http://127.0.0.1:47231). The dev server listens on `127.0.0.1` port `47231`.

```bash
npm test
npm run build
```

Presenter controls are at `/demo`. Alt+Shift+D opens them. Reset clears the browser session.

## Layout

| Path | What it is |
| --- | --- |
| `src/` | React app |
| `content/handoff/make-a-mark-live.json` | Metrics, sources, questions, people, components, and actions |
| `public/assets/` | Photographs, the header logo, and the brand fonts |
| `public/sources/full-proposal.md` | The written proposal |
| `context/` | Decisions from the build, so the next person can continue it |
