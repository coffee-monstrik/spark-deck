# Spark Deck Implementation Plan

Goal: Build the two-player Spark Deck game per project_description.md using Next.js, static deck JSON, CSS modules, and session-only persistence.

## Step 1: Define deck data model and assets - done!
- Specify deck JSON schema (id, name, description, theme colors, font family, categories, cards[{id, category, text}]).
- Store decks in a static folder (e.g., public/decks) and add a sample deck that matches the schema.
- Add TypeScript types plus a small runtime validator to guard against malformed decks.
- Tests: unit test that loads a sample deck, validates shape, and confirms categories are unique and cards map to known categories.

## Step 2: Implement Landing page - done!
- UI: greeting, player name inputs (defaults Me/You), deck selection cards with description and highlight, Start Game button.
- Logic: on submit, load chosen deck, initialize store (copy deck data, shuffle categories/cards, pick 4 categories), set current player, reset log/answered counters.
- Tests: start flow sets state correctly, prevents start without deck, respects default names.

## Step 3: Game state store and persistence - done!
- Create a client-side game store (React context + reducer) holding players, selected deck copy, current player, answered count, action log, and flags for winning/stop states.
- Implement actions: start game, select category, draw card, log action, mark card answered, rotate player, continue/stop, reset.
- Persist/hydrate to sessionStorage; ensure reset clears storage.
- Tests: reducer unit tests for each action and hydration logic; manual check that refresh restores session.

## Step 4: Routing, guards, and layout - done!
- Use App Router routes: `/` (landing), `/categories`, `/card`, `/win`, `/final`, `/stop` (labels can be adjusted but keep separation).
- Add a guard wrapper that redirects to `/` if required state is missing or game finished.
- Build a shared layout with footer and base CSS variables; include a global stop control where required.
- Tests: navigation with/without state; ensure direct URL entry without session state returns to landing.

## Step 5: Category page (2x2 grid) - done!
- Display current player prompt, answered counter, stop control, and four category tiles styled with deck theme.
- Grey out empty categories and block clicks while still visible.
- On category click: log `{player}: category X`, rotate current player, and route to card page with selected category.
- Check winning condition: if all four drawn categories are empty, route to winning screen (first condition) before allowing new picks.
- Tests: manual scenario where categories exhaust; unit/integration test ensures empty categories disable selection and trigger win condition when all are empty.

## Step 6: Card page (question view) - done!
- Show category, current player, question text, Your Turn button, stop control.
- On load, draw a random unused card from the selected category;
- On Your Turn: remove used card from the in-memory deck, copy.log `{player}: question text`, increment answered counter; route back to categories screen redraw 4 categories randomly and swap current player for next pick.
- Tests: repeated plays never repeat a card; answered counter increments; category empties after last card and is marked grey on return.

## Step 7: Winning condition screens - done!
- Final page when entire deck is exhausted: display completion message and stop control.
- Tests: simulate exhaustion of drawn categories vs entire deck to ensure correct screen and branching.

## Step 8: Stop/summary page and transcript - done!
- Show player stats: turns taken, categories chosen, questions answered per player, ordered action log.
- Provide option to email transcript (e.g., `mailto:` link prefilled with log text; placeholder for future SMTP/service integration).
- Tests: log formatting matches recorded actions; email link contains transcript snippet.

## Step 9: Styling and theming



