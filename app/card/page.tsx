"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";
import styles from "./card.module.css";

export default function CardPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const [hasDrawn, setHasDrawn] = useState(false);

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

  const handleAnswer = () => {
    if (!state.currentCard) return;

    const playerName = state.players[state.currentPlayer].name;

    dispatch({
      type: "logAction",
      payload: `${playerName}: ${state.currentCard.text}`,
    });
    dispatch({ type: "markAnswered" });
    dispatch({ type: "rotatePlayer" });
    router.replace("/categories");
  };

  const cardsRemaining = selectedStack?.cards.length ?? 0;
  const categoryColor = selectedStack?.color || "var(--deck-primary, #0b7285)";
  const categoryLabel = state.selectedCategory ?? "Category";
  const currentPlayerName = state.players[state.currentPlayer].name;

  return (
    <GameGuard>
      <GameLayout>
        <section className={styles.header}>
          <div>
            <h1 className="page-title">{categoryLabel}</h1>
          </div>
        </section>

        <article className={styles.cardPanel}>

          <div className={styles.questionBox}>
            <p className={styles.questionText}>{state.currentCard?.text ?? "No card available."}</p>
          </div>

          <div className={styles.metaRow}>
            <p className={styles.metaText}>
              Answering: <strong>{currentPlayerName}</strong>
            </p>
            <p className={styles.metaText}>
              Cards left in this category: <strong>{cardsRemaining}</strong>
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAnswer}
              disabled={!state.currentCard}
            >
              Your Turn
            </button>
          </div>
        </article>

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
