"use client";

import { CSSProperties, useEffect } from "react";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";
import { CategoryStack, isCategoryDepleted } from "@/lib/game/state";

export default function CategoriesPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const showCardsLeft = state.settings?.showCardsLeft ?? true;

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

        <section className="section">
          <h2 className="section-title">Choosing category: {state.players[state.currentPlayer].name}</h2>
        </section>

        <div className="tile-grid">
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
                className={`tile ${depleted ? "is-disabled" : ""}`}
                onClick={() => handleCategoryClick(stack)}
                disabled={depleted}
                aria-disabled={depleted}
                style={
                  depleted
                    ? undefined
                    : ({
                        "--tile-color": stack.color,
                      } as CSSProperties)
                }
              >
                <h3>{stack.name}</h3>
                {showCardsLeft && <p>{label}</p>}
              </button>
            );
          })}
        </div>

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
