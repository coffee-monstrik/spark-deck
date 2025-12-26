"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function CardPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const [hasDrawn, setHasDrawn] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const selectedStack = useMemo(
    () =>
      state.drawnCategories.find(
        (stack) =>
          stack.name.toLowerCase() === (state.selectedCategory ?? "").toLowerCase(),
      ),
    [state.drawnCategories, state.selectedCategory],
  );

  useEffect(() => {
    if (!state.selectedCategory) {
      router.replace("/categories");
      return;
    }

    if (!hasDrawn) {
      dispatch({ type: "drawCard" });
      setHasDrawn(true);
    }
  }, [dispatch, hasDrawn, router, state.selectedCategory]);

  useEffect(() => {
    if (hasDrawn && !state.currentCard) {
      router.replace("/categories");
    }
  }, [hasDrawn, router, state.currentCard]);

  useEffect(() => {
    if (!state.currentCard || !state.answerTimer.startedAt) {
      return;
    }

    if (state.answerTimer.pausedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [state.answerTimer.pausedAt, state.answerTimer.startedAt, state.currentCard]);

  const getElapsedMs = () => {
    if (!state.answerTimer.startedAt) return 0;
    const effectiveNow = state.answerTimer.pausedAt ?? now;
    const elapsed = effectiveNow - state.answerTimer.startedAt - state.answerTimer.pausedTotalMs;
    return Math.max(0, elapsed);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleAnswer = () => {
    if (!state.currentCard) return;

    const playerName = state.players[state.currentPlayer].name;
    const durationMs = getElapsedMs();

    dispatch({
      type: "recordAnswerDuration",
      payload: { playerId: state.currentPlayer, durationMs },
    });
    dispatch({
      type: "logAction",
      payload: `${playerName}: ${state.currentCard.text}`,
    });
    dispatch({ type: "markAnswered" });
    router.replace("/categories");
  };

  const cardsRemaining = selectedStack?.cards.length ?? 0;
  const categoryLabel = state.selectedCategory ?? "Category";
  const currentPlayerName = state.players[state.currentPlayer].name;
  const elapsedLabel = formatDuration(getElapsedMs());

  return (
    <GameGuard>
      <GameLayout>
        <section className="section">
          <h1 className="page-title">{categoryLabel}</h1>
        </section>

        <article className="panel">
          <div className="question-box">
            <p>{state.currentCard?.text ?? "No card available."}</p>
            <p className="copy copy-small">Time on this question: {elapsedLabel}</p>
          </div>

          <div className="meta-row">
            <p className="copy">
              Answering: <strong>{currentPlayerName}</strong>
            </p>
            <p className="copy">
              Cards left in this category: <strong>{cardsRemaining}</strong>
            </p>
          </div>

          <div className="center-row">
            <button
              type="button"
              className="primary-link"
              onClick={handleAnswer}
              disabled={!state.currentCard}
            >
              Your Turn
            </button>
          </div>
        </article>

        <div className="bottomBar">
          <StopControl variant="button" />
          <div className="answered-chip">
            Answered: <strong>{state.answeredCount}</strong>
          </div>
        </div>
      </GameLayout>
    </GameGuard>
  );
}
