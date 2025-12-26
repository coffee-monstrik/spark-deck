"use client";

import { useGameStore } from "@/lib/game/store";
import { StopControl } from "./stop-control";

type Props = {
  children: React.ReactNode;
  showStop?: boolean;
};

export const GameLayout = ({ children, showStop = false }: Props) => {
  const { state } = useGameStore();

  return (
    <div className="game-shell">
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
