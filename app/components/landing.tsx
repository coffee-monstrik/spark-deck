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
  const [showTimer, setShowTimer] = useState(false);
  const [showCardsLeft, setShowCardsLeft] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        settings: {
          showTimer,
          showCardsLeft,
        },
      },
    });

    router.push("/categories");
    setError("");
  };

  return (
    <div className="app-page">
      <section className="hero">
        <p className="eyebrow">Spark Deck</p>
        <h1 className="page-title"> Welcome to Spark Deck!</h1>
        <p className="copy">
          This is engaging "game" to spark meaningful conversations. Start a friendly
          competition while getting to know each other.
          Name yourself, choose the deck and let the game begin!
        </p>
        <p className="copy copy-small">
          You will pick category for each
          other to answer a random questions from it.
          First to draw 4 categories with no question can claim the win but will you stop there?
        </p>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field">
            <input
              value={playerOne}
              onChange={(event) => setPlayerOne(event.target.value)}
              placeholder="Me"
              autoComplete="off"
            />
          </label>
          <label className="field">
            <input
              value={playerTwo}
              onChange={(event) => setPlayerTwo(event.target.value)}
              placeholder="You"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="stack">
          <div className="stack">
            <h2 className="section-title">Choose a deck</h2>
          </div>

          <div className="deck-grid">
            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;

              return (
                <button
                  key={deck.id}
                  type="button"
                  className={`select-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setError("");
                  }}
                  aria-pressed={isSelected}
                >
                  <span className="swatch" aria-hidden="true" />
                  <div>
                    <h3>{deck.name}</h3>
                    <p>{deck.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="stack">
          <button
            type="button"
            className="settings-toggle"
            onClick={() => setSettingsOpen((value) => !value)}
            aria-expanded={settingsOpen}
          >
            <span>Settings</span>
            <span aria-hidden="true">{settingsOpen ? "−" : "+"}</span>
          </button>
          {settingsOpen && (
            <div className="settings-grid">
              <label className="toggle-row">
                <span>Show timer</span>
                <input
                  type="checkbox"
                  checked={showTimer}
                  onChange={(event) => setShowTimer(event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>Show cards left in category</span>
                <input
                  type="checkbox"
                  checked={showCardsLeft}
                  onChange={(event) => setShowCardsLeft(event.target.checked)}
                />
              </label>
            </div>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="button-row">
          <button
            type="submit"
            className="primary-link"
            disabled={!canStartGame(selectedDeck)}
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};
