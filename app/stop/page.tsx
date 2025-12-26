"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { GameGuard } from "../components/game-guard";
import { GameLayout } from "../components/game-layout";
import { StopControl } from "../components/stop-control";
import { useGameStore } from "@/lib/game/store";

export default function StopPage() {
  const { state, dispatch } = useGameStore();
  const router = useRouter();
  const hasAutoStopped = useRef(false);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (hasAutoStopped.current) {
      return;
    }
    if (state.status !== "stopped") {
      dispatch({ type: "stop" });
    }
    hasAutoStopped.current = true;
  }, [dispatch, state.status]);

  const playerStats = useMemo(() => {
    const players = [state.players.player1, state.players.player2];
    return players.map((player) => {
      const prefix = `${player.name}:`;
      const categoryPrefix = `${player.name}: category `;
      const entries = state.log.filter((entry) => entry.startsWith(prefix));
      const categoriesChosen = entries.filter((entry) => entry.startsWith(categoryPrefix)).length;
      const questionsAnswered = Math.max(0, entries.length - categoriesChosen);
      const categoryNames = entries
        .filter((entry) => entry.startsWith(categoryPrefix))
        .map((entry) => entry.slice(categoryPrefix.length).trim())
        .filter(Boolean);
      const categoryCounts = categoryNames.reduce<Record<string, number>>((acc, name) => {
        acc[name] = (acc[name] ?? 0) + 1;
        return acc;
      }, {});
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 3)
        .map(([name]) => name);
      const durations = state.answerDurations[player.id] ?? [];
      const longestAnswerMs = durations.length > 0 ? Math.max(...durations) : 0;

      return {
        id: player.id,
        name: player.name,
        turnsTaken: entries.length,
        categoriesChosen,
        questionsAnswered,
        topCategories,
        longestAnswerMs,
      };
    });
  }, [state.answerDurations, state.log, state.players]);

  const transcriptEntries = useMemo(() => {
    const entries = [...state.log];
    if (state.currentCard) {
      const playerName = state.players[state.currentPlayer].name;
      entries.push(`Pending for ${playerName}: ${state.currentCard.text}`);
    }
    return entries;
  }, [state.currentCard, state.currentPlayer, state.log, state.players]);

  const handleContinue = () => {
    dispatch({ type: "resume" });
    router.replace(state.lastRoute ?? "/categories");
  };

  return (
    <GameGuard allowStopped allowWhenFinished>
      <GameLayout>
        <section className="game-header">
          <div>
            <p className="eyebrow">Game paused</p>
            <h1 className="page-title">Stop &amp; Summary</h1>
          </div>
        </section>

        <div className="center-row action-row">
          <Link className="secondary-link" href={state.lastRoute ?? "/categories"} onClick={handleContinue}>
            Continue playing
          </Link>
          <Link
            className="primary-link"
            href="/"
            onClick={() => dispatch({ type: "reset" })}
          >
            Start a new game
          </Link>
        </div>

        <section>
          <h2 className="page-title">Player stats</h2>
          <div className="stats-grid">
            {playerStats.map((player) => (
              <div key={player.id} className="stat-card">
                <h3 className="section-title">{player.name}</h3>
                <ul className="stat-list">
                  <li>Questions answered: {player.questionsAnswered}</li>
                  <li>
                    Longest answer:{" "}
                    {player.longestAnswerMs > 0
                      ? formatDuration(player.longestAnswerMs)
                      : "—"}
                  </li>
                  <li>
                    Top categories:{" "}
                    {player.topCategories.length > 0 ? player.topCategories.join(", ") : "—"}
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div>
            <h3 className="section-title">Transcript</h3>
          </div>

          {transcriptEntries.length === 0 ? (
            <p className="copy copy-small">No actions logged yet.</p>
          ) : (
            <ol className="log-list">
              {transcriptEntries.map((entry, index) => (
                <li key={`${entry}-${index}`}>{entry}</li>
              ))}
            </ol>
          )}

          <button type="button" className="secondary-link" disabled>
            Email transcript (coming soon)
          </button>
        </section>


      </GameLayout>
    </GameGuard>
  );
}
