"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import {
  CategoryStack,
  GameState,
  StartConfig,
  createInitialGameState,
  evaluateWinState,
  initialEmptyState,
} from "./state";

const STORAGE_KEY = "spark-deck:game-state";

export type GameAction =
  | { type: "start"; payload: StartConfig }
  | { type: "selectCategory"; payload: { category: string } }
  | { type: "drawCard" }
  | { type: "logAction"; payload: string }
  | { type: "markAnswered" }
  | { type: "rotatePlayer" }
  | { type: "continue" }
  | { type: "stop" }
  | { type: "reset" }
  | { type: "hydrate"; payload: GameState };

type GameContextValue = {
  state: GameState;
  dispatch: (action: GameAction) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

const nextPlayer = (current: GameState["currentPlayer"]): GameState["currentPlayer"] =>
  current === "player1" ? "player2" : "player1";

const withWinState = (state: GameState): GameState => ({
  ...state,
  winState: evaluateWinState(state),
});

const drawCardFromCategory = (state: GameState): GameState => {
  if (!state.selectedCategory) {
    return state;
  }

  const targetIndex = state.drawnCategories.findIndex(
    (stack) => stack.name.toLowerCase() === state.selectedCategory?.toLowerCase(),
  );
  if (targetIndex === -1) {
    return state;
  }

  const target = state.drawnCategories[targetIndex];
  if (target.cards.length === 0) {
    return { ...state, currentCard: null };
  }

  const cardIndex = Math.floor(Math.random() * target.cards.length);
  const card = target.cards[cardIndex];

  const updatedStack: CategoryStack = {
    ...target,
    cards: target.cards.filter((_, index) => index !== cardIndex),
  };

  const updatedCategories = [...state.drawnCategories];
  updatedCategories[targetIndex] = updatedStack;

  return {
    ...state,
    currentCard: card,
    drawnCategories: updatedCategories,
  };
};

const reducer = (_state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "start":
      return withWinState(createInitialGameState(action.payload));
    case "selectCategory":
      return {
        ..._state,
        selectedCategory: action.payload.category,
        currentCard: null,
      };
    case "drawCard":
      return withWinState(drawCardFromCategory(_state));
    case "logAction":
      return { ..._state, log: [..._state.log, action.payload] };
    case "markAnswered": {
      if (!_state.currentCard) {
        return _state;
      }

      return withWinState({
        ..._state,
        answeredCount: _state.answeredCount + 1,
        currentCard: null,
      });
    }
    case "rotatePlayer":
      return { ..._state, currentPlayer: nextPlayer(_state.currentPlayer) };
    case "continue":
      return withWinState({ ..._state, status: "ready", stopped: false });
    case "stop":
      return { ..._state, status: "stopped", stopped: true };
    case "reset":
      return { ...initialEmptyState };
    case "hydrate": {
      return withWinState({ ...initialEmptyState, ...action.payload });
    }
    default:
      return _state;
  }
};
export const gameReducer = reducer;

type ProviderProps = {
  children: React.ReactNode;
};

const parseStoredState = (raw: string | null): GameState | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (_error) {
    return null;
  }
};

export const deserializeState = parseStoredState;

export const GameProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialEmptyState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = parseStoredState(window.sessionStorage.getItem(STORAGE_KEY));
    if (stored) {
      dispatch({ type: "hydrate", payload: stored });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (state.status === "idle") {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameStore = (): GameContextValue => {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error("useGameStore must be used within a GameProvider");
  }

  return value;
};
