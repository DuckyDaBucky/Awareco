# Product

Make A Mark Live is a Cognizant concept for the Aston Martin Aramco Formula One Team. The written proposal is `public/sources/full-proposal.md`. The pitch is that the team’s impact data becomes something a fan can explore and a partner can check.

Three spaces:

- **The Car.** Eleven components, each with a photograph, a 2025 and 2026 description, and sourced figures. A separate evolution view scrubs from the 1959 DBR4 to the 2026 AMR26.
- **The People.** Twelve guides, each tied to a real programme. Portraits are fictional people made for the demonstration. The programmes and the figures are from the handoff.
- **The Partners.** A role-based view for a charity, a sponsor, and an internal reader. `/partners?programme=aleto` selects the Aleto programme and the role that owns it.

AI.lonso is the guide on the home page. The name on screen is `AI.lonso`. The face is a Wikimedia portrait of Fernando Alonso. Voice playback reads the selected stored answer through the browser speech API. There is a play and stop control. Nothing is generated at runtime.

## What the screen is allowed to say

Answers, metrics, and links come from `content/handoff/make-a-mark-live.json`. A number on screen has a source in that file. The validator in `src/lib/logic.ts` checks the expected counts and that ids point at each other.

Expected counts: 49 metrics, 42 sources, 99 questions, 11 components, 12 people, 100 actions, 28 routes.

Do not put presenter caveats in the interface. Lines such as “interactive concept demo”, “conversations are prewritten”, and “this fictional guide did not design the component” were removed on purpose. Those points belong in the presentation and in this folder, not on a card the audience reads.

Do not repeat tires and wheels as separate hotspots. There is one tires component.

The header logo is `public/assets/brand/amf1-header-white.svg`. Leave that file as it was supplied.
