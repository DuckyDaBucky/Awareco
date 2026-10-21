# Interface

## Colour and type

| Token | Value | Use |
| --- | --- | --- |
| Opal | `#00665E` | Green wash in the background |
| Deep | `#07110F` | Panels |
| Dark | `#000000` | Page |
| Lime | `#CEDC00` | Marks, links, the current year, Voice |
| Lime hover | `#B9C600` | Hover on lime controls |

Display type is Aston Martin Flare. Body type is Aston Martin Sans. Both are in `public/assets/fonts/` as woff2. Flare is for titles, the car name, and metric values. Sans is for paragraphs and the question list.

## Home grid

Resting columns are `1.35fr 0.75fr 1.35fr`.

| Hover | Columns |
| --- | --- |
| People | `1.85fr 0.6fr 0.95fr` |
| Car | `0.95fr 0.6fr 1.85fr` |
| AI.lonso | `0.8fr 1.85fr 0.8fr` |

The transition is 420ms. Below 980px the grid is one column and the hover rules must not turn it back into three columns.

People background position moves from `center 55%` to `center 30%`. Car background position moves from `78% center` to `22% center`. Both use a 6 second ease. The car rule has to come after the shared entry hover rule, or the shared vertical shift wins and the car stops moving.

## Evolution

The slider track is 64px tall so the year labels have a row of their own. End labels are aligned to the ends of the track. The current year is lime.

The record under the track is a two-column grid. With no metrics, it is a single column. The copy card shows the year as a small label, then the car name, then the sentence, then the photograph credit.

## AI.lonso conversation

The component is `Conversation` in `src/components/Chrome.tsx`. On the home page it receives a `guide`, which switches on the compact layout. Other surfaces still use the chip list.

After an answer arrives, the page scrolls only when the bottom of that answer is below the viewport. The scroll target is the guide bubble, not the user’s line, so two smooth scrolls do not fight.

## Buttons

`.btn` is an inline flex pill with no underline. `.btn.sleek` is transparent, lime text, a 1px lime border, and an arrow. Use that for “Explore generations” and “Back to the component explorer”.
