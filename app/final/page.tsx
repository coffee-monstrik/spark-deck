"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function FinalPage() {
  const { state } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (state.winState !== "deck-finished") {
      router.replace("/categories");
    }
  }, [router, state.winState]);

  return (
    <GameGuard allowWhenFinished>
      <GameLayout showStop>
        <section className="game-header">
          <div>
            <p className="eyebrow">Game complete</p>
            <h1 className="page-title">You answered every question!</h1>
          </div>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </section>

        <section className="game-placeholder">
          <h2>Final screen scaffold</h2>
          <p>
            All deck cards are finished. We will surface stats and transcript options here in later steps.
          </p>
          <div className="placeholder-actions">
            <Link className="secondary-link" href="/stop">
              View summary
            </Link>
          </div>
        </section>

        <div className="game-inline-stop">
          <StopControl variant="button" label="Restart from landing" />
        </div>
      </GameLayout>
    </GameGuard>
  );
}
