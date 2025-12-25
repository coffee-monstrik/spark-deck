"use client";

import { createContext, useContext, useMemo, useReducer } from "react";

import {
  GameState,
  StartConfig,
  createInitialGameState,
  initialEmptyState,
} from "./state";

type GameAction = { type: "start"; payload: StartConfig };

type GameContextValue = {
  state: GameState;
  dispatch: (action: GameAction) => void;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

const reducer = (_state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "start":
      return createInitialGameState(action.payload);
    default:
      return _state;
  }
};

type ProviderProps = {
  children: React.ReactNode;
};

export const GameProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialEmptyState);

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
