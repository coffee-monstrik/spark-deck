import { describe, expect, it } from "vitest";

import seedDeck from "../public/decks/spark-seed.json";
import { parseDeck } from "../lib/decks/schema";
import {
  CATEGORY_PALETTE,
  canStartGame,
  createInitialGameState,
} from "../lib/game/state";

const parsedDeck = parseDeck(seedDeck);

describe("start flow", () => {
  it("creates initial state from the selected deck", () => {
    const state = createInitialGameState({
      deck: parsedDeck,
      playerOneName: "Alex",
      playerTwoName: "Sam",
    });

    expect(state.status).toBe("ready");
    expect(state.deck.id).toBe(parsedDeck.id);
    expect(state.players.player1.name).toBe("Alex");
    expect(state.players.player2.name).toBe("Sam");
    expect(state.drawnCategories.length).toBe(4);
    expect(new Set(state.drawnCategories.map((category) => category.name)).size).toBe(
      state.drawnCategories.length,
    );
    expect(state.answeredCount).toBe(0);
    expect(state.log.length).toBe(0);

    const drawnColors = state.drawnCategories.map((category) => category.color);
    expect(new Set(drawnColors).size).toBe(state.drawnCategories.length);
    drawnColors.forEach((color) =>
      expect(CATEGORY_PALETTE.includes(color)).toBe(true),
    );
  });

  it("respects default names when inputs are blank", () => {
    const state = createInitialGameState({
      deck: parsedDeck,
      playerOneName: " ",
      playerTwoName: "",
    });

    expect(state.players.player1.name).toBe("Me");
    expect(state.players.player2.name).toBe("You");
  });

  it("requires a deck before starting", () => {
    expect(canStartGame(null)).toBe(false);
    expect(canStartGame(undefined)).toBe(false);
    expect(canStartGame(parsedDeck)).toBe(true);
  });
});
