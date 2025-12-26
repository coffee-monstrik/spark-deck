"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Deck } from "@/lib/decks/schema";
import { useGameStore } from "@/lib/game/store";
import { canStartGame } from "@/lib/game/state";
import styles from "./landing.module.css";

type Props = {
  decks: Deck[];
};

export const Landing = ({ decks }: Props) => {
  const { dispatch } = useGameStore();
  const router = useRouter();
  const [playerOne, setPlayerOne] = useState("Me");
  const [playerTwo, setPlayerTwo] = useState("You");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId),
    [decks, selectedDeckId],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!canStartGame(selectedDeck)) {
      setError("Choose a deck to start the game.");
      return;
    }

    dispatch({
      type: "start",
      payload: {
        deck: selectedDeck,
        playerOneName: playerOne,
        playerTwoName: playerTwo,
      },
    });

    router.push("/categories");
    setError("");
  };

  return (
    <div className={styles.landingPage}>
      <section className={styles.landingHero}>
        <p className={styles.landingTagline}>Spark Deck</p>
        <h1 className={styles.landingTitle}>💌 Welcome to Spark Deck!</h1>
        <p className={styles.landingSubtitle}>
          This is engaging "game" to spark meaningful conversations. Start a friendly
          competition while getting to know each other.
          Name yourself, choose the deck and let the game begin!
        </p>
        <p className={styles.landingRules}>
          You will pick category for each
          other to answer a random questions from it.
          First to draw 4 categories with no question can claim the win but will you stop there?
        </p>
      </section>

      <form className={styles.landingForm} onSubmit={handleSubmit}>
        <div className={styles.landingInputs}>
          <label className={styles.landingInput}>
            <input
              value={playerOne}
              onChange={(event) => setPlayerOne(event.target.value)}
              placeholder="Me"
              autoComplete="off"
            />
          </label>
          <label className={styles.landingInput}>
            <input
              value={playerTwo}
              onChange={(event) => setPlayerTwo(event.target.value)}
              placeholder="You"
              autoComplete="off"
            />
          </label>
        </div>

        <div className={styles.landingDecks}>
          <div className={styles.landingDecksHeader}>
            <h2>Choose a deck</h2>
            <p>Select a mood to theme your questions and categories.</p>
          </div>

          <div className={styles.landingDeckGrid}>
            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;
              const accent = deck.theme.accent ?? deck.theme.primary;

              return (
                <button
                  key={deck.id}
                  type="button"
                  className={`${styles.landingDeckCard} ${isSelected ? styles.landingDeckCardSelected : ""}`}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setError("");
                  }}
                  style={{
                    borderColor: isSelected ? accent : deck.theme.disabled,
                    background: isSelected ? undefined : "#fffdf9",
                  }}
                >
                  <div className={styles.landingDeckHeader}>
                    <div className={styles.landingDeckTitle}>
                      <span
                        className={styles.landingDeckSwatch}
                        style={{ backgroundColor: accent }}
                      />
                      <div>
                        <p className={styles.landingDeckName}>{deck.name}</p>
                      </div>
                    </div>
                  </div>
                  <p className={styles.landingDeckDescription}>{deck.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className={styles.landingError}>{error}</p>}

        <div className={styles.landingActions}>
          <button
            type="submit"
            className={styles.landingPrimary}
            disabled={!canStartGame(selectedDeck)}
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};
