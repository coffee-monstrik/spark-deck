"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function WinPage() {
  const { state } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (state.winState !== "drawn-exhausted") {
      router.replace("/categories");
    }
  }, [router, state.winState]);

  return (
    <GameGuard>
      <GameLayout showStop>
        <section className="game-header">
          <div>
            <p className="eyebrow">Milestone</p>
            <h1 className="page-title">All drawn categories are empty</h1>
          </div>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </section>

        <section className="game-placeholder">
          <h2>Winning condition placeholder</h2>
          <p>
            You have exhausted the four drawn categories. Continue anyway to reshuffle remaining
            categories or stop here to view the summary.
          </p>
          <div className="placeholder-actions">
            <Link className="primary-link" href="/categories">
              Continue anyway
            </Link>
            <StopControl variant="button" label="Stop here" />
          </div>
        </section>
      </GameLayout>
    </GameGuard>
  );
}
