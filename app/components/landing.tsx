"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Deck } from "@/lib/decks/schema";
import { useGameStore } from "@/lib/game/store";
import { canStartGame } from "@/lib/game/state";

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
    <div className="landing-page">
      <section className="landing-hero">
        <p className="landing-tagline">Spark Deck</p>
        <h1 className="landing-title">💌 Welcome to Spark Deck!</h1>
        <p className="landing-subtitle">
          This is engaging "game" to spark meaningful conversations. Start a friendly
          competition while getting to know each other.
          Name yourself, choose the deck and let the game begin!
        </p>
        <p className="landing-rules">
          You will pick category for each
          other to answer a random questions from it.
          First to draw 4 categories with no question can claim the win but will you stop there?
        </p>
      </section>

      <form className="landing-form" onSubmit={handleSubmit}>
        <div className="landing-inputs">
          <label className="landing-input">
            <input
              value={playerOne}
              onChange={(event) => setPlayerOne(event.target.value)}
              placeholder="Me"
              autoComplete="off"
            />
          </label>
          <label className="landing-input">
            <input
              value={playerTwo}
              onChange={(event) => setPlayerTwo(event.target.value)}
              placeholder="You"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="landing-decks">
          <div className="landing-decks-header">
            <h2>Choose a deck</h2>
            <p>Select a mood to theme your questions and categories.</p>
          </div>

          <div className="landing-deck-grid">
            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;
              const accent = deck.theme.accent ?? deck.theme.primary;

              return (
                <button
                  key={deck.id}
                  type="button"
                  className={`landing-deck-card ${isSelected ? "landing-deck-card--selected" : ""}`}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setError("");
                  }}
                  style={{
                    borderColor: isSelected ? accent : deck.theme.disabled,
                    background: isSelected ? undefined : "#fffdf9",
                  }}
                >
                  <div className="landing-deck-header">
                    <div className="landing-deck-title">
                      <span
                        className="landing-deck-swatch"
                        style={{ backgroundColor: accent }}
                      />
                      <div>
                        <p className="landing-deck-name">{deck.name}</p>
                        <p className="landing-deck-id">{deck.id}</p>
                      </div>
                    </div>
                  </div>
                  <p className="landing-deck-description">{deck.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="landing-error">{error}</p>}

        <div className="landing-actions">
          <button
            type="submit"
            className="landing-primary"
            disabled={!canStartGame(selectedDeck)}
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};
