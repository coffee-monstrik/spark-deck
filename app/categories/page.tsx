"use client";

import Link from "next/link";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function CategoriesPage() {
  const { state } = useGameStore();

  return (
    <GameGuard>
      <GameLayout showStop>
        <section className="game-header">
          <div>
            <p className="eyebrow">Current player</p>
            <h1 className="page-title">{state.players[state.currentPlayer].name}</h1>
          </div>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </section>

        <section className="game-placeholder">
          <h2>Categories grid coming up next.</h2>
          <p>
            We will list four drawn categories here so players can choose the next prompt.
            You can proceed to the card view to continue scaffolding the flow.
          </p>
          <Link className="primary-link" href="/card">
            Go to Card view
          </Link>
        </section>

        <div className="game-inline-stop">
          <StopControl variant="button" />
        </div>
      </GameLayout>
    </GameGuard>
  );
}
