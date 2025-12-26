"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";
import { remainingCardCount, totalDeckSize } from "@/lib/game/state";

export default function WinPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const deckTotal = totalDeckSize(state);
  const remainingCards = remainingCardCount(state);

  useEffect(() => {
    if (state.winState === "deck-finished") {
      router.replace("/final");
      return;
    }
    if (state.winState !== "drawn-exhausted") {
      router.replace("/categories");
    }
  }, [router, state.winState]);

  const handleContinue = () => {
    dispatch({ type: "continue" });
    router.replace("/categories");
  };

  return (
    <GameGuard>
      <GameLayout>
        <section className="win-hero">
          <p className="eyebrow">Milestone</p>
          <h1 className="page-title">You’ve cleared the drawn categories</h1>
          <p className="win-subtitle">
            Great streak! You can pull in fresh categories or wrap up now.
          </p>
        </section>

        <div className="win-summary">
          <div className="stat-card">
            <p className="stat-label">Answered</p>
            <p className="stat-value">
              {state.answeredCount} <span className="stat-muted">/ {deckTotal}</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Cards remaining</p>
            <p className="stat-value">{remainingCards}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Categories left in deck</p>
            <p className="stat-value">{state.remainingCategories.length}</p>
          </div>
        </div>

        <div className="center-row win-actions">
          <Link className="primary-link" href="/categories" onClick={handleContinue}>
            Continue anyway
          </Link>
          <StopControl variant="button" label="Stop here" />
        </div>

        <div className={'bottomBar'}>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </div>
      </GameLayout>
    </GameGuard>
  );
}
