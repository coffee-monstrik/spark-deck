"use client";

import { useGameStore } from "@/lib/game/store";

export const Footer = () => {
  const { state } = useGameStore();

  return (
    <footer className="game-footer">
      <p>Spark Deck - enagaging questions to connect · by coffee-monstrik</p>
    </footer>
  );
};
