"use client";

import Link from "next/link";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function CardPage() {
  const { state } = useGameStore();

  return (
    <GameGuard>
      <GameLayout showStop>
        <section className="game-header">
          <div>
            <p className="eyebrow">Turn</p>
            <h1 className="page-title">{state.players[state.currentPlayer].name}</h1>
          </div>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </section>

        <section className="game-placeholder">
          <h2>Card view scaffold</h2>
          <p>
            The selected category and drawn card will appear here. For now we keep a simple placeholder
            while wiring up routing and guards.
          </p>
          <div className="placeholder-actions">
            <Link className="secondary-link" href="/categories">
              Back to categories
            </Link>
          </div>
        </section>

        <div className="game-inline-stop">
          <StopControl variant="button" />
        </div>
      </GameLayout>
    </GameGuard>
  );
}
