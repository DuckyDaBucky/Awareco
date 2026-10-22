# Files

## App

| File | Role |
| --- | --- |
| `src/App.tsx` | Routes |
| `src/pages/Home.tsx` | Home grid and the three guide questions |
| `src/pages/CarPages.tsx` | Component explorer and the evolution slider |
| `src/components/CarStage.tsx` | Top-down car, hotspots, component panel |
| `src/components/Chrome.tsx` | Header, menu, conversation, metrics, source drawer |
| `src/components/ProgrammeEvidence.tsx` | Shared programme cards, profiles, evidence labels, visualizations, and source library |
| `src/components/Portraits.tsx` | Guide portraits |
| `src/lib/content.ts` | Reads the handoff and looks up records |
| `src/lib/logic.ts` | Matching, scenarios, and the handoff validator |
| `src/lib/programmes.ts` | Canonical enriched programme records shared by People and Partners |
| `src/lib/store.ts` | Session state for threads, role, and programme |
| `src/lib/speech.ts` | Play and stop for the stored answer |
| `src/styles.css` | Layout and brand styling |
| `vite.config.ts` | Dev server on `127.0.0.1:47231` |

## Content and images

`content/handoff/make-a-mark-live.json` remains the contract for metrics, sources, questions, roles, scenarios, and actions. Detailed programme editorial structure lives in `src/lib/programmes.ts`; both People and Partners consume the merged canonical record returned by `getProgrammeRecord`.

| Folder | Contents |
| --- | --- |
| `public/assets/car/` | Top-down car and the side photograph on the home panel |
| `public/assets/eras/` | 1959 DBR4 and AMR21 through AMR26 |
| `public/assets/parts/` | One photograph for each of the eleven components |
| `public/assets/people/` | Twelve guide portraits |
| `public/assets/brand/` | Header logo and the Alonso portrait |
| `public/assets/atmosphere/` | Pit-lane photograph and the floor wash |
| `public/assets/fonts/` | Flare and Sans |

The Alonso credit on the home guide is: Portrait: Off The Track Media, CC BY 2.0, via Wikimedia Commons. Evolution photographs carry their own credit in the record card.

## Routes worth knowing

`/` home, `/car` and `/car/:componentId`, `/car/evolution`, `/people` and `/people/:personaId`, `/match`, `/impact`, `/race`, `/simulate`, `/demo`, and `/methodology`.

The Partner workspace uses `/partners`, `/partners/programmes`, `/partners/programmes/:programmeId`, `/partners/compare`, `/partners/scenarios`, `/partners/reports`, `/partners/data-quality`, `/partners/inclusion`, and `/partners/business-case`. The old `/partners/simulate` and `/partners/gaps` paths remain as compatible aliases.

A missing route renders the in-app missing page.

## Local run

`npm run dev` is the command. Keep the host on `127.0.0.1`. Listening on every interface dropped the tunnel that opens the dev server from a browser on another machine. Port `47231` is deliberate, so it does not collide with 3000 or 5173.

`npm test` runs the handoff checks. `npm run build` typechecks and builds.
