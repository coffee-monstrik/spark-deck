"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function WinPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();

  useEffect(() => {
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
          <h1 className="page-title">🎉 You’ve completed all 4 categories! 🎉</h1>
        </section>

        <div className="center-row win-actions">
          <Link className="primary-link" href="/categories" onClick={handleContinue}>
            Continue anyway
          </Link>
        </div>

        <div className={'bottomBar'}>
          <StopControl variant="button" />
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </div>
      </GameLayout>
    </GameGuard>
  );
}
