import { describe, expect, it } from "vitest";

import seedDeck from "../public/decks/spark-seed.json";
import { parseDeck } from "../lib/decks/schema";
import { createInitialGameState, drawnCategoriesExhausted } from "../lib/game/state";
import { gameReducer } from "../lib/game/store";

const deck = parseDeck(seedDeck);

describe("first winning condition", () => {
  it("triggers when all drawn categories are emptied", () => {
    const start = createInitialGameState({
      deck,
      playerOneName: "Alex",
      playerTwoName: "Sam",
    });

    const initialDrawnTotal = start.drawnCategories.reduce(
      (sum, stack) => sum + stack.cards.length,
      0,
    );

    let state = start;

    for (const stack of start.drawnCategories) {
      state = gameReducer(state, {
        type: "selectCategory",
        payload: { category: stack.name },
      });

      while (true) {
        state = gameReducer(state, { type: "drawCard" });
        if (!state.currentCard) break;
        state = gameReducer(state, { type: "markAnswered" });
      }
    }

    expect(drawnCategoriesExhausted(state.drawnCategories)).toBe(true);
    expect(state.winState).toBe("drawn-exhausted");
    expect(state.answeredCount).toBe(initialDrawnTotal);
  });

  it("repopulates from remaining categories when continuing after first win", () => {
    const start = createInitialGameState({
      deck,
      playerOneName: "Alex",
      playerTwoName: "Sam",
    });

    const emptiedDrawn = start.drawnCategories.map((stack) => ({ ...stack, cards: [] }));

    const state = gameReducer(
      {
        ...start,
        drawnCategories: emptiedDrawn,
        winState: "drawn-exhausted",
      },
      { type: "continue" },
    );

    expect(state.winState).not.toBe("drawn-exhausted");
    expect(state.drawnCategories.every((stack) => stack.cards.length > 0)).toBe(true);
    expect(state.remainingCategories.length + state.drawnCategories.length).toBeGreaterThan(0);
  });
});
