---
name: Mr. K's Training
description: A one-person daily brain-game habit, carried on a single ticket that is both home and map.
colors:
  amber: "#ffb000"
  ink: "#0e1b2c"
  ink-soft: "#33445a"
  on-ink-soft: "#cdd6e2"
  paper: "#fff"
  panel-tint: "#e9edf2"
typography:
  numeral:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 800
    lineHeight: 1
  display:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.2
  row-title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1.2
  prompt:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.3
  reading:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
  button-tap:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.25
  button-large:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.25
  button:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  button-small:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  tile: "10px"
  control: "14px"
  panel: "20px"
  circle: "50%"
spacing:
  tight: "8px"
  row: "12px"
  stack: "14px"
  trial-inset: "18px"
  gutter: "20px"
  panel-inset: "22px"
  tap: "60px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "76px"
  button-primary-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-primary-disabled:
    backgroundColor: "{colors.panel-tint}"
    textColor: "{colors.ink-soft}"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "76px"
  button-secondary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-large:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button-large}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "104px"
  button-go:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.display}"
    rounded: "{rounded.control}"
    padding: "14px 24px"
    height: "124px"
  button-tap:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button-tap}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
    height: "150px"
  button-small:
    textColor: "{colors.paper}"
    typography: "{typography.button-small}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "{spacing.tap}"
  option:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
    height: "76px"
  option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  choice:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 8px"
    height: "168px"
  choice-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  text-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
    height: "76px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  pass-row-current:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    typography: "{typography.row-title}"
    padding: "8px 22px"
    height: "92px"
  spot:
    backgroundColor: "{colors.panel-tint}"
    rounded: "{rounded.circle}"
    size: "64px"
  tile:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.tile}"
  tile-lit:
    backgroundColor: "{colors.ink}"
---

# Design System: Mr. K's Training

## Overview

**Creative North Star: "The Day's Pass"**

One white ticket on a dark navy surround is the whole world. The pass is both home and map: she leaves it to play a game and returns to the same ticket with the next row lit. Everything else, from a game to a settings page to a warning, is the same white panel on the same navy, so nothing feels like going somewhere new.

The system borrows the structure of a boarding pass and a departure board: numbered rows, heavy dividing rules, tabular numerals, a perforated tear line with punched notches. It borrows no flight imagery or vocabulary. Density is deliberately low and the type is very large, because the only player needs larger text, has less steady hands and can't be expected to know app conventions. Hierarchy comes from size, weight and one lit row, never from decoration.

German and Vietnamese copy is an unreviewed draft. No wording is recorded here as a standard, and layouts must hold up when strings change length.

**Key Characteristics:**
- One white panel on a navy surround, on every screen.
- One amber row that says where she is today.
- Very large type, with 20 px as the floor.
- Controls that are unmistakably shapes, with generous targets and a visible press.
- Flat surfaces, ink rules and almost no motion.

## Colors

A near-monochrome pairing of navy and white, with one saturated amber that carries position.

### Primary
- **Departure Amber** (#ffb000): The band behind the current row on the pass and the arrow in the go button. It also marks text selection, and focus rings on the navy surround. The app icon and the install-help illustration show the same band because they are pictures of the pass. Ink reads on it at 9.46:1.

### Neutral
- **Night Ink** (#0e1b2c): The surround, all text on white, rules, filled buttons, selected options, lit tiles and game shapes. Used on white it reaches 17.33:1.
- **Slate Ink** (#33445a): Quiet notes on white and the disabled button label (9.93:1 on white).
- **Pale Slate** (#cdd6e2): Secondary text on the navy surround only (11.81:1 on ink).
- **Ticket White** (#fff): The panel, button labels on ink, and all primary text on the surround.
- **Tint** (#e9edf2): Resting fill of location spots, disabled button fill, and the light table rules on fact lists. At 1.18:1 against white it never carries meaning alone.

### Named Rules
**The One Lit Row Rule.** Amber as a state means "you are here" and appears on one row of the pass. The go-button arrow is its only companion. Selected options, correct answers, lit tiles, game feedback and charts never use it.

**The No Amber On White Rule.** Amber never colours text, icons or rings directly on white (1.83:1). That is why focus rings switch to ink inside a panel.

**The No Red Rule.** The system has no red and no alarm colour. A wrong answer is an ink cross, and nothing on her screens signals failure with colour.

## Typography

**Display Font:** Be Vietnam Pro (with system-ui, sans-serif)
**Body Font:** Be Vietnam Pro (with system-ui, sans-serif)

**Character:** One sturdy, friendly grotesque with full Vietnamese diacritics, doing every job through size and weight alone. Numerals are tabular everywhere (`font-variant-numeric: tabular-nums`), which gives the rows their departure-board steadiness.

### Hierarchy
- **Numeral** (800, 52px, 1): Row numbers on the pass. Digits only, so the tight line height is safe.
- **Display** (800, 46px, 1.2): The word on the go button.
- **Headline** (800, 34px, 1.2): Panel titles on game introductions, warnings and settings.
- **Row Title** (700, 31px, 1.2): Game names on the pass.
- **Title** (800, 26px, 1.2): Section and head-row titles. The greeting runs larger at 28px, also at 800.
- **Prompt** (700, 26px, 1.3): The centred instruction sentence in a game.
- **Reading** (500, 24px, 1.45): Explanatory paragraphs in panels.
- **Body** (500, 20px, 1.4): The base size and the floor, used for quiet notes. Row times and the date sit between the two at 23px.
- **Button labels** (700, 24px; large 800, 32px; tap 800, 40px; small 700, 20px): Never forced to uppercase. Full-width buttons balance their lines (`text-wrap: balance`).

### Named Rules
**The 20 Pixel Floor Rule.** No text is smaller than 20 px. When a long word doesn't fit, wrap or restructure; don't shrink below the floor.

**The Three Weights Rule.** Be Vietnam Pro ships at 500, 700 and 800, in the Latin, Latin Extended and Vietnamese subsets, bundled with the app and precached so it works offline. Use no other weight. A fourth would be synthesised or missing.

**The Room For Marks Rule.** Text that can carry Vietnamese diacritics keeps a line height of at least 1.2 and is never clipped.

## Layout

The app is a single column of `min(100vw, 520px)`, centred on the navy surround, with a 20px gutter and safe-area insets added to the top and bottom. On desktop it stays that column rather than reflowing. The private view is the one exception, widening to 720px because it is read by her child in an ordinary browser. Landscape on a short screen (height up to 520px) is replaced by a full-screen request to turn the phone upright.

Each screen has a bar of at least 64px on the surround (title on the left, one small button on the right) and a panel below. On the pass and in games the panel grows to fill the remaining height (`100svh`), so the primary action stays within thumb reach at the bottom. Messages and dialogs centre their panel vertically instead.

Spacing is roomy and slightly irregular by role: 22px panel inset, 18px around game content, 14px between stacked buttons and choices, 8 to 16px within groups. Rows on the pass flex to share spare height, from a 92px minimum.

**The Still Field Rule.** In the speed game nothing shifts between the flash, the cover and the questions. The field keeps one square size (minimum 280px), and stimuli are always in the DOM and only toggled visible.

## Elevation & Depth

The system is flat. There are no cast shadows, blurs or translucent layers: depth is the white panel against the navy, and rules divide everything inside it. The only `box-shadow` values are inset rings drawn during a press.

**The Punched Not Lifted Rule.** The ticket is paper lying flat. Its one dimensional detail is the pair of notches cut from its edges, which are simply the surround showing through.

## Shapes

Corners are gently and consistently rounded: 14px on controls, 20px on panels, 10px on memory tiles. Location spots are full circles. Lines are heavy, at 3px ink for rules and outlined controls, with 4px on spots and 2px tint rules for quiet table rows. Icons are simple inline SVGs in `currentColor`, solid or thick-stroked (stroke 7 on a 48 unit grid), and game pieces are solid silhouettes. The tear line is a row of round 4px-radius ink dots between two 30px circular notches.

## Components

Controls are plain, tactile and literal: a filled or outlined shape that looks pressable to someone who has never used an app.

### Buttons
- **Shape:** Gently rounded (14px), full width except the small button, 76px minimum height.
- **Primary:** Ink fill with white text, for the one obvious next action.
- **Secondary:** 3px ink outline with ink text, for the equally clear alternative or way back.
- **Large:** Primary at 104px and 32px type, used when a dialog has a safe main choice.
- **Tap:** Primary at 150px and 40px type, the single answer button in the tap game.
- **Small:** 3px white outline with white text on the surround, 60px minimum, used only in the top bars. It may pair an icon with its word.
- **Press:** Primary inverts to white with ink text and a 4px inset ink ring. Secondary, options and choices fill ink with white text. Small buttons are the exception today: they only gain a 3px inset ring, which is a known gap and not a pattern.
- **Focus:** 4px ring at 3px offset, amber on the surround and ink inside a panel.
- **Disabled:** Tint fill with Slate Ink text.

### Options
- **Style:** Outlined 76px rows or a three-column segment, in 26px bold.
- **State:** Selected fills ink with white text. Language rows add a check icon. A press inverts either state.

### Inputs
- **Style:** White fill, 3px ink outline, 14px radius, 76px minimum, 24px bold, with a 22px bold label above.
- **Focus:** The ink ring used throughout panels.

### Cards / Containers
The panel is the only container: white, 20px radius, no border or shadow, clipping its contents. Nothing nests a panel inside a panel.

### The Pass (signature)
A head row (title and date), then numbered rows divided by 3px ink rules, then the tear line and a stub holding one action. A finished row swaps its number for a check icon. Ink text stays on the row in every state, so only the band behind it changes. When she finishes a game the band slides once from the finished row to the next (1000ms after a 450ms delay, `cubic-bezier(0.45, 0, 0.25, 1)`), and with reduced motion it simply appears. This is the only animated transition in the system. When every row is done the band disappears and the stub reports it in words.

### Go Button
A primary button 124px tall with the word on the left at display size, the time beneath it at 22px, and a 56px solid amber arrow on the right. The arrow currently stays amber when a press turns the button white (1.83:1), which is a known gap and not a pattern.

### Answer Choices
Two equal outlined cells side by side, each a picture above its word, at least 168px tall in play. In the speed game they stretch to fill the free height.

### Playing Pieces
Location spots are tinted circles with a 4px ink outline, at least 64px. Memory tiles are white squares with a 3px ink outline that fill ink when lit. These are the game board, so they carry no labels; the prompt sentence above them says what to do. Two known gaps: a lit tile shows no change when pressed, and tiles in the 5 by 5 grid fall below 60px on screens narrower than about 408px (66px on her phone).

### Demo Target
A 6px ink ring at 5px offset around the element she should tap, leaving its fill unchanged, on spots, choices and buttons alike. The doubled line reads as "this one" without implying it was already pressed. Demo targets are not live controls.

### Private View
Ink line charts on two tint rules, with a readout above and a table behind a worded disclosure. Trends appear here and nowhere on her screens. Chart axis labels currently fall below the 20 px floor because they scale with the chart (about 8px on a phone, 16px on desktop), which is a known gap and not a lower floor.

## Do's and Don'ts

### Do:
- **Do** put every screen on the navy surround in one white panel, with one obvious next action.
- **Do** give every button a word. The exceptions are the game's own pieces (location spots, memory tiles), whose instruction is the prompt sentence, and numeral options, whose heading names them.
- **Do** make every new press state an inversion of the control, visible without fine eyesight.
- **Do** keep text at 20 px or larger and targets at 60 px or larger.
- **Do** mark a demo target with the 6px ink ring and leave its fill alone.
- **Do** tell game states apart by shape and fill pattern, as the system's ink-only pieces do.
- **Do** let strings change: German and Vietnamese copy is an unreviewed draft, so test layout rather than fixing wording.

### Don't:
- **Don't** use amber for selection, success, games, charts or emphasis, or directly on white.
- **Don't** use an icon alone as a navigation, confirm or settings control.
- **Don't** fill a demo target to highlight it. Fill means lit or selected.
- **Don't** add red, cast shadows, a fourth font weight or a second typeface.
- **Don't** add planes, barcodes or flight wording. The ticket structure is enough.
- **Don't** make her home screen a dashboard of cards, streaks or scores.
- **Don't** add movement beyond the band's one slide and the demo's blink, which holds still under reduced motion.
