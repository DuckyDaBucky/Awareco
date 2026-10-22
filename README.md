# Make A Mark Live

Interactive demonstration for the Aston Martin Aramco Formula One Team. Fans move through the car, the people behind the programmes, and a partner view. AI.lonso guides them with stored questions and answers.

Public repository: [github.com/DuckyDaBucky/Awareco](https://github.com/DuckyDaBucky/Awareco)

Live site: [awareco.vercel.app](https://awareco.vercel.app). Pushes to `main` deploy there.

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

## Race Weekend historical replay

From the homepage, click **Race weekend**, or open `/race`. Press **Play replay**. The default is 20× (about 4 minutes 46 seconds for the full replay); choose 60× for about 95 seconds. Select Alonso or Stroll, pause, restart, or drag the timeline in either direction. Driver switching preserves the race clock. All values derive from one `requestAnimationFrame` clock. The replay starts paused and automatically stops at the end.

The included `public/data/2025-austin.json` (~1.4 MB) contains the **19 October 2025 United States Grand Prix**, 56 laps, with Fernando Alonso #14 and Lance Stroll #18. No API calls, Python runtime, internet connection, or API keys are needed to run the demo. Fonts and branding are already local. External source links require internet to open; their assumptions and factor values are documented in the page and local files.

- Recorded car signals and approximate X/Y coordinates: [OpenF1, session 9888](https://openf1.org/docs/).
- Actual lap/sector times, lap-end positions, and tyre compounds: [TracingInsights’ archived FastF1 export](https://github.com/TracingInsights-Archive/2025/tree/main/United%20States%20Grand%20Prix/Race).
- Classification cross-check: [FIA final classification](https://www.fia.com/system/files/decision-document/2025_united_states_grand_prix_-_final_race_classification.pdf), Alonso 1:35:10.162 (P10), Stroll 1:35:14.939 (P12); winner 1:34:00.161. The clock runs until the last AMF1 finish, not just the winner’s finish.

The circuit outline uses Alonso’s fastest race lap (54). One original sample per half-second bucket is kept; the frontend interpolates recorded locations and speed only across intervals ≤3 seconds. Larger gaps freeze/fade the marker and withhold telemetry. There are no gaps >3 seconds in this cache; small initial/final coverage gaps are disclosed. Map positions are approximate, not precision GPS. Turn annotations come from the archived FastF1/MultiViewer circuit data. Lap-end position is explicitly the last completed crossing, not a live inferred leaderboard.

**Environmental values are models, not team telemetry.** Fuel is a declared 100 kg per-car race scenario. Integrate distance × (0.35 + 0.65 × throttle fraction), then normalize to the scenario total. Gaps use mean race distance/time × 0.7. The ±10% range is fuel-budget sensitivity, not measured uncertainty or a confidence interval. Fuel and impact clamp at that driver’s finish and are independent of playback speed and seek history.

Carbon uses the [DESNZ 2025 conversion factors](https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025), generic 100% mineral petrol: 3.135 kg tailpipe CO₂/kg, 3.15408213 kg combustion CO₂e/kg, plus 0.81593523 kg upstream CO₂e/kg = **3.97001736 kg CO₂e/kg illustrative fuel lifecycle (well-to-wheel)**. Exact source rows, units, and boundaries are in `public/data/emissions-reference.json`. This does not establish the actual fuel blend or lifecycle factor of AMF1’s 2025 fuel. Sustainable fuels still emit tailpipe CO₂. Other race-weekend emissions are unavailable, not zero.

Hybrid energy is an educational MGU-K illustration, using 60 kW recovery on recorded braking and 80 kW deployment at high throttle, with a 4 MJ battery initially holding 2 MJ and caps of 2 MJ recovery/4 MJ deployment per lap. Stored energy is conserved; MGU-H flows and losses are not modeled. Recorded throttle/brake state is distinguished from inferred energy. Insights use deterministic source-grounded rules. [AMF1’s 2024 ESG report](https://downloads.astonmartinf1.com/MakeAMark_ESG_Report_2024.pdf) provides historical annual context only; no annual footprint is apportioned to Austin.

To regenerate the included dataset from public archives (stdlib Python only; network needed on the first run):

```bash
python3 scripts/prepare-race-openf1.py
```

Raw responses are cached in ignored `.cache-race/openf1/`; later exports work offline. The exported JSON records retrieval time, exact source URLs, response hashes, timing alignment and coverage. The shared origin aligns the archived Alonso finish to his FIA duration, then maps UTC telemetry through archived LapStartDate/LapStartTime. Stroll’s finish provides an independent alignment check. Original samples are retained, not generated.

The direct FastF1 ingestion path is also available:

```bash
python3 -m venv .venv-race
.venv-race/bin/pip install -r scripts/requirements-race.txt
.venv-race/bin/python scripts/prepare-race.py
```

This investigates and uses `Session.load()`, `laps.get_pos_data()`, `laps.get_car_data()`, `pick_fastest()` and `get_circuit_info()`. The upstream F1 timing archive returned HTTP 401 during preparation, so the **shipped dataset uses the public archive fallback above**. Direct ingestion can be used if archive access becomes available; a failed direct load does not overwrite the shipped file.

```bash
npm test
npm run build
npx playwright test e2e/race.spec.ts
```

Tests cover classification, interpolation, missing data, all clock speeds, deterministic scrubbing, fuel/carbon factors, energy conservation and per-lap limits. Chrome tests cover homepage navigation, pause/resume, driver switching, forward/backward scrubbing, restart, race-end behavior, desktop/mobile screenshots, and loading with external requests blocked. Screenshots are saved in `test-results/`.

## Layout

| Path | What it is |
| --- | --- |
| `src/` | React app |
| `content/handoff/make-a-mark-live.json` | Metrics, sources, questions, people, components, and actions |
| `public/assets/` | Photographs, the header logo, and the brand fonts |
| `public/sources/full-proposal.md` | The written proposal |
| `context/` | Decisions from the build, so the next person can continue it |
