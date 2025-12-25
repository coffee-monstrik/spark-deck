"use client";

import { FormEvent, useMemo, useState } from "react";

import { Deck } from "@/lib/decks/schema";
import { useGameStore } from "@/lib/game/store";
import { canStartGame } from "@/lib/game/state";

import styles from "./landing.module.css";

type Props = {
  decks: Deck[];
};

export const Landing = ({ decks }: Props) => {
  const { dispatch } = useGameStore();
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

    setError("");
  };

  return (
    <div className={`${styles.page}`}>
      <section className={styles.hero}>
        <p className={styles.tagline}>Spark Deck</p>
        <h1 className={styles.title}>💌 Welcome to Spark Deck!</h1>
        <p className={styles.subtitle}>
          This is engaging questions game to spark meaningful conversations. Start a friendly
          competition while getting to know each other.
          Name yourself, choose the deck and let the game begin!
        </p>
        <p className={styles.rules}>
          You will pick category for each
          other to answer a random questions from it.
          First to draw 4 categories with no question can claim the win but will you stop there?
        </p>
      </section>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputsRow}>
          <label className={styles.input}>
            <span>Player 1</span>
            <input
              value={playerOne}
              onChange={(event) => setPlayerOne(event.target.value)}
              placeholder="Me"
              autoComplete="off"
            />
          </label>
          <label className={styles.input}>
            <span>Player 2</span>
            <input
              value={playerTwo}
              onChange={(event) => setPlayerTwo(event.target.value)}
              placeholder="You"
              autoComplete="off"
            />
          </label>
        </div>

        <div className={styles.decksSection}>
          <div className={styles.decksHeader}>
            <h2>Choose a deck</h2>
            <p>Select a mood to theme your questions and categories.</p>
          </div>

          <div className={styles.deckGrid}>
            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;
              const accent = deck.theme.accent ?? deck.theme.primary;

              return (
                <button
                  key={deck.id}
                  type="button"
                  className={`${styles.deckCard} ${isSelected ? styles.deckCardSelected : ""}`}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setError("");
                  }}
                  style={{
                    borderColor: isSelected ? accent : deck.theme.disabled,
                    background: isSelected ? undefined : "#fffdf9",
                  }}
                >
                  <div className={styles.deckHeader}>
                    <div className={styles.deckTitle}>
                      <span className={styles.deckSwatch} style={{ backgroundColor: accent }} />
                      <div>
                        <p className={styles.deckName}>{deck.name}</p>
                        <p className={styles.deckId}>{deck.id}</p>
                      </div>
                    </div>
                  </div>
                  <p className={styles.deckDescription}>{deck.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primary}
            disabled={!canStartGame(selectedDeck)}
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};
