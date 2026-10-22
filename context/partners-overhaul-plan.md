# People and Partners Experience Overhaul Plan

## Implementation Status

The prototype implementation was completed on the `codex/work` branch. It now includes the shared programme record, all 12 enriched community profiles, the Partner portfolio workspace, programme workspaces, evidence comparison, scenario persistence, synchronized reports, data-quality status handling, guarded leadership routes, responsive layouts, and expanded automated coverage.

Production identity, server-side authorization, collaborative approval history, and a persistent backend remain deployment concerns rather than capabilities of this browser-only demonstration. The interface now makes that boundary explicit and keeps the presenter role switch separate from the guarded views.

## Purpose

Transform the current People and Partners demonstration into a coherent evidence experience. The People space will become the canonical source for each community programme's story, outcomes, visualizations, sources, and limitations. The Partners space will reuse that foundation and add portfolio analysis, planning, verification, reporting, and governance workflows.

This is a structural overhaul rather than a visual reskin. It includes the information architecture, content model, verification model, programme-profile design, partner workflows, data visualizations, reports, access behavior, and state handling.

The existing implementation is concentrated in [`src/pages/PeoplePages.tsx`](../src/pages/PeoplePages.tsx), [`src/pages/PartnerPages.tsx`](../src/pages/PartnerPages.tsx), and [`content/handoff/make-a-mark-live.json`](../content/handoff/make-a-mark-live.json).

## Product Direction

The redesigned experience should communicate one connected idea:

> Community is where programme impact becomes understandable; Partners is where that verified impact becomes usable.

The community experience should help a visitor understand who a programme serves, what happened, what evidence exists, and what remains unknown. The partner experience should help authorized users review a portfolio, investigate individual programmes, compare results, plan initiatives, manage evidence gaps, and produce defensible reports.

The product should never imply that an activity metric proves a long-term outcome, that an illustrative scenario is a reported result, or that missing evidence equals zero.

## Experience Architecture

### People and community

- `/people` — programme discovery with filters, evidence coverage, partner information, and meaningful previews.
- `/people/:programmeId` — the canonical master programme profile.
- `/match` — optional guided discovery that routes visitors to the same canonical profiles.

### Partners

- `/partners` — role-appropriate portfolio overview.
- `/partners/programmes/:programmeId` — partner programme workspace built on the master profile.
- `/partners/compare` — normalized programme comparison.
- `/partners/scenarios` — scenario library and planning tools.
- `/partners/reports` — report builder and generated reports.
- `/partners/data-quality` — evidence gaps, owners, status, and review history.
- `/partners/inclusion` — protected leadership view.
- `/partners/business-case` — protected planning view.

The existing `/partners/programmes`, `/partners/simulate`, and `/partners/gaps` paths may redirect to the new routes during migration.

## Design Principles

1. **One programme, one source of truth.** Community and Partner surfaces must consume the same programme record rather than maintaining parallel summaries.
2. **Evidence before decoration.** Visual prominence must follow evidence quality, not merely the size of a number.
3. **Programme context is persistent.** Users should always know which programme, partner, period, and scope they are viewing.
4. **Reported, derived, and illustrative values remain visibly distinct.** Labels and styling must survive into exports.
5. **No misleading fallbacks.** A programme without numerical outcomes receives an honest empty state, not unrelated global metrics.
6. **Visualizations answer specific questions.** Charts are selected by data shape and analytical purpose rather than applied uniformly.
7. **Progressive disclosure.** Lead with a clear narrative and headline evidence; expose methodology, citations, and limitations without hiding them.
8. **Accessible by default.** Charts need text equivalents, keyboard support, sufficient contrast, and reduced-motion behavior.
9. **Role visibility is not authorization.** Protected content requires route and data enforcement, not hidden navigation alone.
10. **Respect source rights.** Prefer original, detailed summaries with precise citations. Reproduce full third-party articles only when permission or an appropriate license is confirmed; otherwise use short attributed excerpts and official links.

## Phase 1 — Evidence and Content Foundation

Expand the programme model before rebuilding the interface. Each programme should support:

- Stable programme and partner identifiers.
- Programme purpose, audience, location, delivery period, and status.
- A short overview and a substantial original editorial summary.
- Optional approved quotations or short attributed excerpts.
- Activity, output, outcome, target, and context metrics.
- Historical values and reporting periods.
- Units, scope, definitions, methodology, and calculation notes.
- Source references at claim or metric level, including page or section where possible.
- Verification status, reviewer, review date, and partner-approval status.
- Explicit data gaps and limitations.
- Media with attribution, alt text, usage rights, and approval state.
- Related programmes, calls to action, and partner-facing extensions.

Use human-readable evidence states:

| State | Meaning |
| --- | --- |
| Verified | Checked against an approved primary source |
| Reported | Published by the named organization but not independently verified here |
| Derived | Calculated from cited inputs with a visible method |
| Illustrative | A planning assumption or demonstration scenario |
| Awaiting review | Entered but not approved for external use |
| Unavailable | Evidence is not loaded or has not been reported |

Deliverables:

- Revised TypeScript types and handoff schema.
- Migration of all 12 existing programmes.
- A claim-to-source validation routine.
- Content and source-rights guidelines.
- A visible evidence-coverage model that does not reward quantity over quality.

## Phase 2 — Master Community Programme Profile

Rebuild `/people/:programmeId` as the definitive programme view.

Recommended page structure:

1. **Programme hero** — programme, partner, purpose, current reporting period, primary image, and approval state.
2. **Impact at a glance** — three to five meaningful measures with definitions and evidence labels.
3. **Programme story** — a detailed, readable, sourced editorial summary rather than two short generic paragraphs.
4. **Evidence in context** — purpose-built charts, comparisons, milestones, or qualitative evidence.
5. **Journey or timeline** — when the source material supports stages or repeated delivery.
6. **What the evidence shows** — supported conclusions stated plainly.
7. **What it does not show** — causal, longitudinal, or demographic limitations.
8. **Sources and methodology** — source library, page-level references, calculations, and review state.
9. **Related programmes and actions** — connections without distracting from the evidence.
10. **Optional guide** — conversational exploration using only the same approved programme record.

The profile needs explicit layouts for three evidence conditions:

- Rich quantitative and qualitative evidence.
- Partial evidence with limited metrics.
- Narrative-only evidence with no numerical outcomes.

Acceptance criteria:

- No profile shows another programme's data.
- Every factual claim has traceable provenance.
- Missing evidence is visible and understandable.
- The story remains useful with JavaScript chart enhancements unavailable.
- Mobile reading order matches the narrative hierarchy.

## Phase 3 — Partner Workspace Redesign

Replace the current collection of analytics panels with a role-aware working environment.

### Portfolio overview

The landing page should answer:

- Which programmes belong to this portfolio?
- What changed during the selected reporting period?
- Which targets are on track, at risk, or unsupported by current evidence?
- Which evidence has been reviewed and approved?
- What requires partner or AMF1 attention?
- What is ready for external reporting?

Suggested modules include portfolio status, programme cards, trend summaries, target progress, evidence coverage, open data gaps, report readiness, and recent review activity.

### Programme workspace

Reuse the master programme profile as the evidence core, then add partner-only capabilities:

- Partner-specific targets and reporting periods.
- Period-over-period analysis.
- Comparable programme benchmarks where definitions genuinely align.
- Evidence review and approval state.
- Internal ownership and follow-up actions.
- Scenario planning connected to the programme.
- Selection of claims, metrics, and visuals for reports.

### Role model

- Charity partners see their authorized programmes, reports, scenarios, and data requests.
- Commercial partners see their authorized activations and programme evidence.
- AMF1 leadership sees the approved cross-portfolio view plus protected inclusion and business-case areas.

The current role selector may remain as a clearly labelled presenter control in demo mode, but it must be isolated from the production authorization design.

## Phase 4 — Data Visualization System

Create a small, reusable visualization grammar rather than one universal dashboard chart.

| Question | Preferred treatment |
| --- | --- |
| How has a measure changed? | Time-series line or slope chart |
| How close are we to a target? | Target-progress display with baseline and deadline |
| Where do participants move through a programme? | Funnel or staged journey |
| What happened before and after? | Paired comparison with methodological caveat |
| Where did activity occur? | Geographic view only when location data is approved |
| How do programmes compare? | Normalized bars or table with definition checks |
| What evidence is missing? | Coverage matrix or structured empty state |
| What happened when? | Milestone timeline |

Every visualization must show or expose:

- Metric definition and unit.
- Reporting period.
- Population or operational scope.
- Source and evidence state.
- Any transformation, normalization, or rounding.
- A text equivalent and accessible labels.

Portfolio-level environmental data must be visibly separated from programme-level community evidence. A global footprint chart must never appear to describe the selected programme.

## Phase 5 — Reporting and Workflow

Reports should be generated from the same programme and evidence records displayed in the workspace.

The report builder should support:

- Programme and reporting-period selection.
- Approved headline outcomes and visualizations.
- Source references and methodology.
- Limitations and current data gaps.
- Saved scenario inputs, assumptions, outputs, and timestamp.
- Partner branding and report purpose.
- Draft, reviewed, approved, and superseded states.
- Print/PDF output with accessible HTML retained as the canonical representation.

Gap management should include an owner, explanation, current state, required evidence, next action, and change history. Updating a gap must immediately affect report readiness and generated reports.

## Phase 6 — Access, State, and Integrity Fixes

Resolve the following known defects as part of the overhaul:

- Protect leadership routes instead of only hiding their navigation links.
- Prevent programme selection from unexpectedly changing the active role.
- Remove global metric fallbacks for programmes with no numerical outcomes.
- Separate portfolio-wide footprint data from programme data.
- Persist the complete scenario record rather than only its identifier.
- Include scenario inputs and results in reports.
- Make edited gap status flow into reports and readiness calculations.
- Ensure deep links select a valid authorized programme without silently broadening access.
- Keep reported facts, derived calculations, and scenarios distinct throughout the UI and exports.
- Define a storage boundary so demo-only browser state can later be replaced with a real service without rewriting presentation components.

## Phase 7 — Validation and Rollout

Validation should cover content, interaction, security behavior, accessibility, and visual quality.

Required test scenarios:

- All 12 programmes render correctly with rich, partial, or absent metrics.
- Claim and metric citations resolve to valid sources.
- No role can reach unauthorized routes through a direct URL.
- Programme switching never changes role implicitly.
- Portfolio data cannot be mistaken for programme data.
- Gap edits and scenario saves appear accurately in reports.
- Reports preserve evidence labels and limitations.
- Keyboard, screen-reader, narrow-screen, and reduced-motion experiences remain usable.
- Print/PDF layouts preserve hierarchy, attribution, and page breaks.

Roll out incrementally through one mastered reference programme, a small mixed-evidence cohort, and then the full portfolio.

## Reference Implementation

Use the Aleto leadership programme as the first complete vertical slice because it has multiple metrics, survey outcomes, a clear partner relationship, and documented evidence ambiguity that the interface must explain responsibly.

The reference slice should include:

- Migrated evidence schema.
- Master community profile.
- Partner programme workspace.
- At least two appropriate visualizations.
- Evidence and limitation panels.
- Scenario connection.
- Gap-management behavior.
- Complete generated report.
- Automated tests for citations, state, and access.

Once approved, convert this implementation into reusable components and migration guidance for the remaining programmes.

## Delivery Sequence

1. Audit the 12 programme records and their sources.
2. Finalize the evidence, citation, approval, and media schema.
3. Create low-fidelity information architecture and page flows.
4. Build the Aleto master community profile.
5. Extend Aleto into the Partner programme workspace.
6. Build report generation from the shared record.
7. Correct role, route, scenario, and gap-state behavior.
8. Define and implement the visualization component set.
9. Test the reference slice with realistic missing and conflicting evidence.
10. Migrate the remaining programmes in evidence-quality batches.
11. Complete responsive, accessibility, and visual-quality passes.
12. Remove or redirect obsolete Partner routes and components.

## Definition of Done

The overhaul is complete when:

- Community and Partner views share one canonical programme record.
- All factual content is sourced and carries an appropriate evidence state.
- All programmes provide a useful experience regardless of evidence density.
- No unrelated metric is used as a fallback.
- Visualizations have a clear analytical purpose and accessible equivalent.
- Partner users can understand portfolio status, investigate programmes, plan scenarios, manage gaps, and produce reports.
- Leadership content is protected at route and data level.
- Reports reproduce the selected evidence, gaps, scenarios, sources, and limitations accurately.
- Automated tests cover critical evidence and role behavior.
- The experience meets agreed responsive and accessibility standards.

## Open Product Decisions

The following decisions should be resolved during discovery without blocking the initial Aleto reference slice:

- Whether the fictional guides remain central, become secondary, or are removed from programme profiles.
- Whether Partner users review evidence, approve it, or only consume approved records.
- Which identity provider and authorization model a production version would use.
- Whether report history and approval history are required in the prototype or only represented in the data model.
- Which third-party source material may be reproduced and which must be summarized and linked.
- Which programmes have enough comparable definitions for cross-programme benchmarking.
- Whether the business case belongs inside the Partner product or remains a pitch-only presenter surface.
