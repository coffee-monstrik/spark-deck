import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseDeck } from "../lib/decks/schema";
import {
  createInitialGameState,
  drawnCategoriesExhausted,
  initialEmptyState,
  isCategoryDepleted,
} from "../lib/game/state";
import { deserializeState, gameReducer } from "../lib/game/store";
import seedDeck from "../public/decks/spark-seed.json";

const parsedDeck = parseDeck(seedDeck);

describe("game store reducer and persistence", () => {
  let baseState = createInitialGameState({
    deck: parsedDeck,
    playerOneName: "Alex",
    playerTwoName: "Sam",
  });

  beforeEach(() => {
    baseState = createInitialGameState({
      deck: parsedDeck,
      playerOneName: "Alex",
      playerTwoName: "Sam",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects depleted categories", () => {
    const emptyStack = { ...baseState.drawnCategories[0], cards: [] };

    expect(isCategoryDepleted(emptyStack)).toBe(true);
    expect(isCategoryDepleted(baseState.drawnCategories[1])).toBe(false);
    expect(drawnCategoriesExhausted([emptyStack])).toBe(true);
  });

  it("selects a category and clears any active card", () => {
    const category = baseState.drawnCategories[0].name;
    const next = gameReducer(baseState, {
      type: "selectCategory",
      payload: { category },
    });

    expect(next.selectedCategory).toBe(category);
    expect(next.currentCard).toBeNull();
  });

  it("draws a card from the selected category", () => {
    const category = baseState.drawnCategories[0];
    vi.spyOn(Math, "random").mockReturnValue(0);

    const withSelection = gameReducer(baseState, {
      type: "selectCategory",
      payload: { category: category.name },
    });
    const afterDraw = gameReducer(withSelection, { type: "drawCard" });

    expect(afterDraw.currentCard).not.toBeNull();
    expect(afterDraw.drawnCategories[0].cards.length).toBe(category.cards.length - 1);
  });

  it("increments answered count when marking a card", () => {
    const category = baseState.drawnCategories[0];
    vi.spyOn(Math, "random").mockReturnValue(0);

    const withSelection = gameReducer(baseState, {
      type: "selectCategory",
      payload: { category: category.name },
    });
    const withCard = gameReducer(withSelection, { type: "drawCard" });
    const afterAnswer = gameReducer(withCard, { type: "markAnswered" });
    const ignored = gameReducer(baseState, { type: "markAnswered" });

    expect(afterAnswer.answeredCount).toBe(1);
    expect(afterAnswer.currentCard).toBeNull();
    expect(ignored.answeredCount).toBe(baseState.answeredCount);
  });

  it("rotates current player", () => {
    const turnOne = gameReducer(baseState, { type: "rotatePlayer" });
    const turnTwo = gameReducer(turnOne, { type: "rotatePlayer" });

    expect(turnOne.currentPlayer).toBe("player2");
    expect(turnTwo.currentPlayer).toBe("player1");
  });

  it("logs actions and toggles stop/continue flags", () => {
    const withLog = gameReducer(baseState, { type: "logAction", payload: "player1: picked" });
    const stopped = gameReducer(withLog, { type: "stop" });
    const resumed = gameReducer(stopped, { type: "continue" });

    expect(withLog.log).toContain("player1: picked");
    expect(stopped.status).toBe("stopped");
    expect(stopped.stopped).toBe(true);
    expect(resumed.status).toBe("ready");
    expect(resumed.stopped).toBe(false);
  });

  it("resets to the empty state", () => {
    const resetState = gameReducer(baseState, { type: "reset" });

    expect(resetState).toEqual(initialEmptyState);
  });

  it("hydrates stored state snapshots", () => {
    const snapshot = deserializeState(JSON.stringify(baseState));
    const hydrated = snapshot
      ? gameReducer(initialEmptyState, { type: "hydrate", payload: snapshot })
      : initialEmptyState;

    expect(snapshot).not.toBeNull();
    expect(hydrated.deck.id).toBe(baseState.deck.id);
    expect(hydrated.players.player1.name).toBe(baseState.players.player1.name);
  });

  it("detects deck completion via win state", () => {
    const emptiedCategories = baseState.drawnCategories.map((stack) => ({
      ...stack,
      cards: [],
    }));
    const finished = gameReducer(
      {
        ...baseState,
        drawnCategories: emptiedCategories,
        remainingCategories: [],
        currentCard: null,
      },
      { type: "continue" },
    );

    expect(finished.winState).toBe("deck-finished");
  });

  it("flags the drawn categories exhaustion win state", () => {
    const emptiedDrawn = baseState.drawnCategories.map((stack) => ({
      ...stack,
      cards: [],
    }));

    const exhausted = gameReducer(
      { ...baseState, drawnCategories: emptiedDrawn, currentCard: null },
      { type: "continue" },
    );

    expect(exhausted.winState).toBe("drawn-exhausted");
    expect(exhausted.remainingCategories.length).toBeGreaterThan(0);
  });
});
