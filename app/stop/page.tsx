"use client";

import { useEffect } from "react";
import Link from "next/link";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function StopPage() {
  const { state, dispatch } = useGameStore();

  useEffect(() => {
    if (state.status !== "stopped") {
      dispatch({ type: "stop" });
    }
  }, [dispatch, state.status]);

  return (
    <GameGuard allowStopped allowWhenFinished>
      <GameLayout>
        <section className="game-header">
          <div>
            <p className="eyebrow">Game paused</p>
            <h1 className="page-title">Stop &amp; summary</h1>
          </div>
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </section>

        <section className="game-placeholder">
          <h2>Transcript and stats coming soon.</h2>
          <p>
            We will surface player stats and an email transcript link here. For now you can jump back
            into categories or restart from landing.
          </p>
          <div className="placeholder-actions">
            <Link className="primary-link" href="/categories">
              Continue playing
            </Link>
            <StopControl variant="button" label="Stay stopped" />
          </div>
        </section>
      </GameLayout>
    </GameGuard>
  );
}
