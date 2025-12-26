# Spark Deck (Codex Project Description)

## App description
Spark Deck is a lightweight two-player card-prompt game built with Next.js and static JSON decks. Players choose a deck, take turns picking categories for each other, and answer randomly drawn questions until either the drawn categories are exhausted or the entire deck is finished. Your progress is saved only for this browser session.

## Game workflow & features
- Players enter names (defaults: "Me" and "You"), pick a deck, and optionally enable timers or category card counts.
- The deck is cloned into in-memory category stacks; cards are shuffled and categories are randomized.
- Four categories are drawn at a time and displayed as a 2x2 grid. Empty categories appear disabled.
- Current player chooses a category for the other player, then the current player rotates.
- A random card from the chosen category is drawn and removed immediately; the answering player sees the question and optional timer.
- On "Your Turn", the answer is logged, answer duration recorded (if timer is enabled), answered count increments, and the game returns to category selection.
- Win states:
  - Drawn categories exhausted (milestone) -> /win screen with option to continue.
  - Entire deck exhausted -> /final screen.
- Stop control is available throughout the game to pause and view summary stats/transcript.

## Screens
- Landing (`/`)
  - App intro, player name inputs, deck selection cards, optional settings (timer, cards left), Start Game.
- Categories (`/categories`)
  - Current chooser prompt, 2x2 category tiles, answered counter, Stop button.
- Card (`/card`)
  - Category title, question card, current answerer, optional timer, optional cards-left count, "Your Turn".
- Milestone win (`/win`)
  - Shown when all 4 drawn categories are empty; shows answered/total stats and lets you continue or stop.
- Final (`/final`)
  - Shown when no cards remain in the deck; offers stop/summary or restart.
- Stop & Summary (`/stop`)
  - Player stats (questions answered, longest answer time, top categories), transcript log, and resume/new game.

## Implementation details (important notes)
- Decks: Static JSON files in `public/decks` loaded server-side in `lib/decks/load.ts` and validated in `lib/decks/schema.ts`.
  - Schema includes: `id`, `name`, `description`, `approximateTimeMinutes`, `categories`, `cards[{id, category, text}]`.
- Game state: `lib/game/state.ts` defines `GameState`, win checks, and category color assignment. `lib/game/store.tsx` holds the reducer and sessionStorage persistence.
  - `drawnCategories` holds the current 4 category stacks; `remainingCategories` holds the rest.
  - Cards are removed on draw, not on answer, so card counts reflect remaining after the current card is shown.
  - `answerTimer` tracks elapsed time for the active card; durations are stored per player.
- Routing & guards: `app/components/game-guard.tsx` redirects to `/` if state is missing, to `/stop` when paused, and to `/final` when finished (unless explicitly allowed).
- Stop/resume: `StopControl` stores `lastRoute`, dispatches `stop`, and navigates to `/stop`. Resume returns to `lastRoute` and unpauses the timer.
- Settings: Landing page toggles are stored in state (`showTimer`, `showCardsLeft`) and drive conditional UI in `/card` and `/categories`.
- Styling: global styles in `app/globals.css`, shared layout in `app/components/game-layout.tsx`, persistent footer in `app/components/footer.tsx`.

## Implementation details (deeper dive)
- State shape: `GameState` in `lib/game/state.ts` is the source of truth (players, deck metadata, drawn/remaining category stacks, selected category, current card, timers, logs, win state, and settings).
- State updates: all mutations go through the reducer in `lib/game/store.tsx`. The reducer is pure; side effects live in components via `useEffect` (e.g., draw a card on `/card`, reshuffle on `/categories`).
- Actions you will see most:
  - `start`: build the initial state from a deck, shuffle cards, draw the first 4 categories, set players/settings.
  - `selectCategory` + `rotatePlayer`: choose a category and immediately switch who answers next.
  - `drawCard`: pick a random card from the selected category and remove it from that stack.
  - `markAnswered`: increments `answeredCount` and clears the current card.
  - `reshuffleCategories`: redraws the 4 visible categories from the pool.
  - `continue`: handles the “drawn categories exhausted” milestone by repopulating from remaining cards.
  - `stop` / `resume`: pauses and resumes the timer and stores the last route for return.
- Win logic: `evaluateWinState` is used after relevant actions to detect “drawn categories exhausted” vs “deck finished” and drives routing to `/win` or `/final`.
- Timer behavior: `answerTimer` starts on `drawCard`, pauses on `stop`, and resumes on `resume`. Elapsed time is computed in the card page and recorded on answer.
- Logs & stats: `logAction` is append-only; the stop page derives stats by parsing log entries (categories chosen vs questions answered) and timing arrays.
- Persistence: the store hydrates from `sessionStorage` on mount, and writes the entire state on each change when the game is active.

## File map (quick navigation)
- `app/page.tsx`
- `app/components/landing.tsx`
- `app/categories/page.tsx`
- `app/card/page.tsx`
- `app/win/page.tsx`
- `app/final/page.tsx`
- `app/stop/page.tsx`
- `lib/game/state.ts`
- `lib/game/store.tsx`
- `lib/decks/schema.ts`
- `lib/decks/load.ts`
