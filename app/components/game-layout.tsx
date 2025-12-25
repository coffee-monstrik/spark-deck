"use client";

import { CSSProperties, useMemo } from "react";

import { useGameStore } from "@/lib/game/store";
import { StopControl } from "./stop-control";

type Props = {
  children: React.ReactNode;
  showStop?: boolean;
};

export const GameLayout = ({ children, showStop = false }: Props) => {
  const { state } = useGameStore();

  const themeVars = useMemo(
    () =>
      ({
        "--deck-primary": state.deck.theme.primary || "#0b7285",
        "--deck-secondary": state.deck.theme.secondary || "#3bc9db",
        "--deck-disabled": state.deck.theme.disabled || "#ced4da",
        "--deck-surface": state.deck.theme.surface || "#f8f9fa",
        "--deck-text": state.deck.theme.text || "#0f172a",
        "--deck-font": state.deck.theme.fontFamily || "var(--font-geist-sans)",
      }) as CSSProperties,
    [state.deck.theme],
  );

  return (
    <div className="game-shell" style={themeVars}>
      <main className="game-surface">
        {showStop && (
          <div className="game-stop-rail">
            <StopControl />
          </div>
        )}
        {children}
      </main>
      <footer className="game-footer">
        <p>
          Spark Deck by Alyona · Theme: {state.deck.name || "choose a deck"}
        </p>
      </footer>
    </div>
  );
};
