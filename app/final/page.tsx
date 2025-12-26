"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";
import { totalDeckSize } from "@/lib/game/state";

export default function FinalPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const deckTotal = totalDeckSize(state);

  useEffect(() => {
    if (state.winState === "drawn-exhausted") {
      router.replace("/win");
      return;
    }
    if (state.winState !== "deck-finished") {
      router.replace("/categories");
    }
  }, [router, state.winState]);

  const handleRestart = () => {
    dispatch({ type: "reset" });
    router.replace("/");
  };

  return (
    <GameGuard allowWhenFinished>
      <GameLayout>
        <section className="win-hero">
          <p className="eyebrow">Game complete</p>
          <h1 className="page-title">You answered every question!</h1>
        </section>

        <section className="win-summary final">
          <div className="stat-card">
            <p className="stat-label">Deck completed</p>
            <p className="stat-value">{state.deck.name}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Questions Answered</p>
            <p className="stat-value">{state.answeredCount}</p>
          </div>
        </section>

        <div className="center-row action-row">
          <StopControl variant="button" label="Go to summary" />
          <button type="button" className="secondary-link" onClick={handleRestart}>
            Start a new game
          </button>
        </div>
      
      </GameLayout>
    </GameGuard>
  );
}
