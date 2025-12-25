import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import { Deck, parseDeck } from "./schema";

const decksDir = path.join(process.cwd(), "public", "decks");

const readDeckFile = async (fileName: string): Promise<Deck | null> => {
  try {
    const raw = await fs.readFile(path.join(decksDir, fileName), "utf8");
    return parseDeck(JSON.parse(raw));
  } catch (error) {
    console.error(`Failed to read deck ${fileName}:`, error);
    return null;
  }
};

export const loadDecks = cache(async (): Promise<Deck[]> => {
  const files = await fs.readdir(decksDir);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  const decks = await Promise.all(jsonFiles.map(readDeckFile));
  return decks
    .filter((deck): deck is Deck => deck !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
});

export const loadDeckById = cache(async (id: string): Promise<Deck | null> => {
  const decks = await loadDecks();
  return decks.find((deck) => deck.id === id) ?? null;
});
