"use client";

import { StopControl } from "./stop-control";
import { Footer } from "./footer";

type Props = {
  children: React.ReactNode;
  showStop?: boolean;
};

export const GameLayout = ({ children, showStop = false }: Props) => {
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
      <Footer />
    </div>
  );
};
