# Dolce Vita — Wedding Invitation (recreation)

A standalone static recreation of the "Dolce Vita" wedding invitation
(webgencyinvitations.com/dolcevita), built from an REA design-system audit
(`~/workspace/rea-runs/dolcevita/DESIGN_SYSTEM.md`).

Open it by double-clicking `index.html` (or serve the folder with any static
server). No build step, no backend. The only external dependency is Google
Fonts (Imperial Script, Ovo, Rufina).

## What was recreated

- Single centred ~390px column with wide white margins on desktop; full-width
  on mobile. Background `#fffdfb`, text `#3a3a3a`/`#4a4a4a`, dusty-blue
  accents `#64a0bd`/`#52839c`/`#7a9aaa`, pale sky `#9bc9e1` buttons.
- All 11 sections in the reference's order: envelope intro → hero → scratch
  date → welcome letter → schedule → venue → dress code → photo gallery →
  colours → RSVP → closing. No nav, no countdown, no story/registry/FAQ.
- Interactions (all working, Playwright-tested in headless Chrome):
  - Envelope (mobile <981px): gold heart wax seal, "Click to open", flap
    fly-out animation; opens the page and starts the music.
  - Hero: slow Ken Burns zoom, falling petals, drifting birds, subtle scroll
    parallax.
  - Scratch-off date: 3 canvas-coated tiles (14 / September / 2027); scratch
    with mouse or touch; >40% cleared per tile reveals it; all three done →
    "You're invited!" + gold flash + 80-piece confetti.
  - Gallery slider: 10 slides, prev/next arrows, dots, drag/swipe.
  - Dress-code swatches: all 5 palette colours render visibly.
  - RSVP modal: name required, single-choice attendance, optional food
    intolerances, validation, success state; submissions stored in
    `localStorage` under `dolcevita_rsvps` (demo only — no backend).
  - Venue "View the location" links to a Google Maps search (new tab).
  - Fade-in on scroll; `prefers-reduced-motion` disables animation.

## What is original (not copied)

Nothing was downloaded, hotlinked or reused from webgencyinvitations.com or
tildacdn.net.

- **Images (16, all AI-generated, eye-checked):** `images/` — hero terrace,
  venue villa, RSVP header, closing sunset, gallery-01…10, two watercolor
  ornaments. Romantic painterly style, no text in images, no identifiable
  real people (silhouettes / backs to camera / close-ups only).
- **Copy:** original letter text, schedule labels, dress-code guidance.
- **Names/place/date:** placeholder couple **Elena & Marcus** (not the
  reference's couple), venue **Villa Serena, Lake Como** (not Casa del Mar,
  Cancún), date **14 September 2027** (the reference's 14 Sep 2025 is past).

## Bugs in the reference that were fixed

- Schedule order: the reference listed Dinner 20:00 *after* Party 21:00.
  Here it is chronological: Doors 16:30, Ceremony 17:00, Cocktail 18:00,
  Dinner 20:00, Party 21:00, End 23:00.
- RSVP typos fixed: "Do you have any food intolerances?",
  "Unfortunately, I can't", "I'll tell you a bit later".
- Dress-code swatches: invisible on the original; here all 5 render visibly.
- RSVP deadline updated to "Please RSVP before August 30" (for the 2027 date).

## Music

`audio/wedding-piano.mp3` — "Romantic Inspiration" by Rafael Krux, released
under **CC0 1.0** (public domain) via FreePD, mirrored at
github.com/SoundSafari/CC0-1.0-Music. Verified: MP3, 320 kbps, 2:30.
The floating play/pause toggle (mobile only, appears after the envelope
opens) really plays/pauses it; the envelope click starts it. On desktop
there is no music UI, exactly like the reference (music is mobile-only).

## Deviations from the reference

- **Hero is a still image, not a video.** The reference uses an MP4; video
  generation is region-blocked here, so the AI hero image is used with a
  Ken Burns zoom + falling petals instead.
- **Envelope/music are mobile-only** (hidden at ≥981px), exactly like the
  reference.
- The reference's letter record carries a `#121212` background value, but the
  visible artboard is `#fffdfb`, so the page stays `#fffdfb` throughout.
- The RSVP form has no backend: submissions are demo-only localStorage.
  The reference's submission endpoint was not discoverable (no action URL).
- A discreet "Skip intro" link was added under the envelope (the reference
  has none) so the page can be entered without the animation.

## Preview hooks (for QA only)

- `index.html?noenvelope=1` — skip the envelope and go straight to the page.
- `index.html?rsvp=1` — open the RSVP modal on load.

## Files

```
index.html          page markup (11 sections + RSVP modal)
styles.css          all styling (palette, fonts, envelope, timeline, slider…)
script.js           all interactions (envelope, music, petals, scratch,
                    confetti, slider, RSVP)
images/             16 AI-generated images (hero, venue, rsvp-header,
                    closing, gallery-01…10, ornament-floral, ornament-corner)
audio/              wedding-piano.mp3 (CC0, Rafael Krux — "Romantic Inspiration")
```
