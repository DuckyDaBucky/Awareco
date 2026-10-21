# Decisions from the build

These are the requests that changed the demo, in the order they mattered. Keep them unless a later request replaces one.

## Repository

The project lives in the public GitHub repository [DuckyDaBucky/Awareco](https://github.com/DuckyDaBucky/Awareco). It was private at first, which is why an unsigned-in visit showed a 404. It is public now. `main` is the branch to publish.

## Home

The People panel and the Car panel are the large columns. AI.lonso is the narrower column between them.

Hovering People widens People. Hovering Car widens Car. Hovering AI.lonso widens the centre column in both directions and narrows the two side panels by the same amount.

The People photograph drifts upward on hover. It is a tall image, so a vertical background shift has room to travel. The car photograph is wide. The same vertical shift left it still. Hovering the car pans along the body, from the rear toward the nose, on the same six-second ease.

The home guide offers three questions only:

- one about the people behind the machine
- one that starts the match
- one about how the car works

Those ids are `guide_people`, `guide_match`, and `guide_car`.

## AI.lonso

The guide shows a small portrait, the name, and a Voice control. Questions are compact rows with an arrow, not full-width pills.

Choosing a question removes it from the list. The reply appears under the remaining questions. If that reply would sit below the screen, the page scrolls down to it. It does not scroll upward when the reply is already visible.

Voice reads the latest stored guide text. Stop cuts it off.

## The car

Component hotspots use one photograph per part: power unit, fuel system, chassis, active aero, floor and diffuser, energy recovery, cooling, brakes, gearbox, suspension, and tires.

“Explore generations” is a transparent pill with a lime outline, lime text, and an arrow. It must not pick up a link underline.

The evolution slider has seven stops, spaced evenly: 1959 DBR4, then AMR21 through AMR26. The long gap between 1959 and 2021 is one step, not sixty years of empty track. Releasing the slider snaps to the nearest car. The two neighbouring photographs crossfade while the thumb is between stops.

Under the slider, the year labels sit on their own row. The record is one card for the car and one card for its figures. The year and the car name appear once.

## People

Each of the twelve guides has a distinct portrait under `public/assets/people/`. They are fictional guides to real programmes.

## Background

The page is near-black, with a soft green wash. Photographs carry the car, the pit-lane atmosphere, and the people. Do not go back to flat line drawings for those surfaces.
