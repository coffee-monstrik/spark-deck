"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";

import {
  CategoryStack,
  CATEGORY_PALETTE,
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
  | {
      type: "recordAnswerDuration";
      payload: { playerId: GameState["currentPlayer"]; durationMs: number };
    }
  | { type: "markAnswered" }
  | { type: "rotatePlayer" }
  | { type: "reshuffleCategories" }
  | { type: "continue" }
  | { type: "setLastRoute"; payload: string }
  | { type: "resume" }
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const adjustColor = (hex: string, delta: number): string => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const num = parseInt(value, 16);
  const r = clamp((num >> 16) + delta, 0, 255);
  const g = clamp(((num >> 8) & 0x00ff) + delta, 0, 255);
  const b = clamp((num & 0x0000ff) + delta, 0, 255);

  const toHex = (component: number) => component.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const withWinState = (state: GameState): GameState => ({
  ...state,
  winState: evaluateWinState(state),
});

const shuffleStacks = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const uniqueColors = (input: string[]): string[] => Array.from(new Set(input.filter(Boolean)));

const applyDistinctColors = (
  stacks: CategoryStack[],
  palette: string[],
  fallback: string,
): CategoryStack[] => {
  if (stacks.length === 0) return stacks;

  const basePalette = uniqueColors(palette);
  const needs = stacks.length - basePalette.length;
  const extendedPalette =
    needs > 0
      ? [
          ...basePalette,
          ...Array.from({ length: needs }, (_value, index) =>
            adjustColor(fallback || "#0b7285", (index + 1) * 10),
          ),
        ]
      : basePalette;

  const colorChoices = shuffleStacks(extendedPalette).slice(0, stacks.length);

  return stacks.map((stack, index) => ({
    ...stack,
    color: colorChoices[index] ?? fallback ?? "#0b7285",
  }));
};

const reshuffleCategories = (state: GameState): GameState => {
  const pool = shuffleStacks([...state.drawnCategories, ...state.remainingCategories]);
  const drawnCategories = applyDistinctColors(
    pool.slice(0, 4),
    CATEGORY_PALETTE,
    CATEGORY_PALETTE[0],
  );
  const remainingCategories = pool.slice(drawnCategories.length);

  return withWinState({
    ...state,
    drawnCategories,
    remainingCategories,
    selectedCategory: null,
  });
};

const repopulateAfterExhaustion = (state: GameState): GameState => {
  const available = [...state.drawnCategories, ...state.remainingCategories].filter(
    (stack) => stack.cards.length > 0,
  );

  const pool = shuffleStacks(available);
  const drawnCategories = applyDistinctColors(
    pool.slice(0, 4),
    CATEGORY_PALETTE,
    CATEGORY_PALETTE[0],
  );
  const remainingCategories = pool.slice(drawnCategories.length);

  return withWinState({
    ...state,
    drawnCategories,
    remainingCategories,
    selectedCategory: null,
    currentCard: null,
  });
};

const drawCardFromCategory = (state: GameState): GameState => {
  if (state.currentCard) {
    return state;
  }
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
    return {
      ...state,
      currentCard: null,
      answerTimer: {
        startedAt: null,
        pausedAt: null,
        pausedTotalMs: 0,
      },
    };
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
    answerTimer: {
      startedAt: Date.now(),
      pausedAt: null,
      pausedTotalMs: 0,
    },
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
        answerTimer: {
          startedAt: null,
          pausedAt: null,
          pausedTotalMs: 0,
        },
      };
    case "drawCard":
      return withWinState(drawCardFromCategory(_state));
    case "logAction":
      return { ..._state, log: [..._state.log, action.payload] };
    case "recordAnswerDuration":
      return {
        ..._state,
        answerDurations: {
          ..._state.answerDurations,
          [action.payload.playerId]: [
            ..._state.answerDurations[action.payload.playerId],
            action.payload.durationMs,
          ],
        },
      };
    case "markAnswered": {
      if (!_state.currentCard) {
        return _state;
      }

      return withWinState({
        ..._state,
        answeredCount: _state.answeredCount + 1,
        currentCard: null,
        answerTimer: {
          startedAt: null,
          pausedAt: null,
          pausedTotalMs: 0,
        },
      });
    }
    case "rotatePlayer":
      return { ..._state, currentPlayer: nextPlayer(_state.currentPlayer) };
    case "reshuffleCategories":
      return reshuffleCategories(_state);
    case "continue":
      if (_state.winState === "drawn-exhausted" || evaluateWinState(_state) === "drawn-exhausted") {
        return repopulateAfterExhaustion({
          ..._state,
          status: "ready",
          stopped: false,
        });
      }
      return withWinState({ ..._state, status: "ready", stopped: false });
    case "setLastRoute":
      return { ..._state, lastRoute: action.payload };
    case "resume": {
      if (_state.answerTimer.startedAt && _state.answerTimer.pausedAt) {
        const pauseDelta = Date.now() - _state.answerTimer.pausedAt;
        return withWinState({
          ..._state,
          status: "ready",
          stopped: false,
          answerTimer: {
            ..._state.answerTimer,
            pausedAt: null,
            pausedTotalMs: _state.answerTimer.pausedTotalMs + pauseDelta,
          },
        });
      }

      return withWinState({ ..._state, status: "ready", stopped: false });
    }
    case "stop":
      if (_state.answerTimer.startedAt && !_state.answerTimer.pausedAt) {
        return {
          ..._state,
          status: "stopped",
          stopped: true,
          answerTimer: {
            ..._state.answerTimer,
            pausedAt: Date.now(),
          },
        };
      }
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
  children: ReactNode;
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
