"use client";

import { CSSProperties, useEffect } from "react";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";
import { CategoryStack, isCategoryDepleted } from "@/lib/game/state";
import styles from "./categories.module.css";

export default function CategoriesPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    if (state.winState === "drawn-exhausted" || state.winState === "deck-finished") {
      return;
    }
    dispatch({ type: "reshuffleCategories" });
  // We want a new draw on first mount and after each answered card.
  }, [dispatch, state.answeredCount, state.winState]);

  useEffect(() => {
    if (state.winState === "drawn-exhausted") {
      router.replace("/win");
    }
  }, [router, state.winState]);

  const handleCategoryClick = (stack: CategoryStack) => {
    if (isCategoryDepleted(stack) || state.winState === "drawn-exhausted") {
      return;
    }

    dispatch({
      type: "selectCategory",
      payload: { category: stack.name },
    });
    dispatch({
      type: "logAction",
      payload: `${state.players[state.currentPlayer].name}: category ${stack.name}`,
    });
    dispatch({ type: "rotatePlayer" });

    router.push("/card");
  };

  return (
    <GameGuard>
      <GameLayout>

        <section className={styles.prompt}>
          <div>
            <h2 className={styles.promptTitle}>{state.players[state.currentPlayer].name}: Choose a category</h2>
          </div>
        </section>

        <div className={styles.grid}>
          {state.drawnCategories.map((stack) => {
            const depleted = isCategoryDepleted(stack);
            const cardsLeft = stack.cards.length;
            const label =
              cardsLeft === 0
                ? "Empty"
                : `${cardsLeft} card${cardsLeft === 1 ? "" : "s"} left`;

            return (
              <button
                key={stack.name}
                type="button"
                className={`${styles.tile} ${depleted ? styles.tileDisabled : ""}`}
                onClick={() => handleCategoryClick(stack)}
                disabled={depleted}
                aria-disabled={depleted}
                style={
                  {
                    "--tile-color": depleted ? "var(--deck-disabled, #ced4da)" : stack.color,
                    "--tile-ink": depleted ? "var(--deck-text, #0f172a)" : "#ffffff",
                  } as CSSProperties
                }
              >
                <div className={styles.tileHeading}>
                  <p className={styles.tileName}>{stack.name}</p>
                </div>
                <p className={styles.tileMeta}>{label}</p>
              </button>
            );
          })}
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
