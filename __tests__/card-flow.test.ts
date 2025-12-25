import { describe, expect, it } from "vitest";

import seedDeck from "../public/decks/spark-seed.json";
import { parseDeck } from "../lib/decks/schema";
import { createInitialGameState, isCategoryDepleted } from "../lib/game/state";
import { gameReducer } from "../lib/game/store";

const deck = parseDeck(seedDeck);

const startState = () =>
  createInitialGameState({
    deck,
    playerOneName: "Alex",
    playerTwoName: "Sam",
  });

describe("card page flow", () => {
  it("draws unique cards and exhausts the category", () => {
    let state = startState();
    const target = state.drawnCategories[0];

    state = gameReducer(state, {
      type: "selectCategory",
      payload: { category: target.name },
    });

    const seen = new Set<string>();

    while (true) {
      const stack = state.drawnCategories.find((entry) => entry.name === target.name);
      if (!stack || stack.cards.length === 0) {
        break;
      }

      state = gameReducer(state, { type: "drawCard" });
      expect(state.currentCard).not.toBeNull();

      const card = state.currentCard!;
      expect(seen.has(card.id)).toBe(false);
      seen.add(card.id);

      state = gameReducer(state, { type: "markAnswered" });
    }

    const depletedStack = state.drawnCategories.find((entry) => entry.name === target.name);
    expect(depletedStack?.cards.length).toBe(0);
    expect(isCategoryDepleted(depletedStack!)).toBe(true);
    expect(seen.size).toBe(target.cards.length);
    expect(state.answeredCount).toBe(seen.size);
  });

  it("logs answered cards and rotates the player for the next pick", () => {
    let state = startState();
    const target = state.drawnCategories[0];

    state = gameReducer(state, {
      type: "selectCategory",
      payload: { category: target.name },
    });
    state = gameReducer(state, { type: "rotatePlayer" }); // categories page swap
    state = gameReducer(state, { type: "drawCard" });

    const card = state.currentCard!;
    const currentPlayer = state.players[state.currentPlayer].name;

    state = gameReducer(state, {
      type: "logAction",
      payload: `${currentPlayer}: ${card.text}`,
    });
    state = gameReducer(state, { type: "markAnswered" });
    state = gameReducer(state, { type: "rotatePlayer" }); // next picker

    expect(state.log[state.log.length - 1]).toBe(`${currentPlayer}: ${card.text}`);
    expect(state.answeredCount).toBe(1);
    expect(state.currentPlayer).toBe("player1");
  });
});
