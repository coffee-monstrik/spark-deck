import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseDeck } from "../lib/decks/schema";

const decksDir = path.join(process.cwd(), "public", "decks");

describe("deck validation", () => {
  it("loads and validates all deck assets", async () => {
    const files = await readdir(decksDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    expect(jsonFiles.length).toBeGreaterThan(0);

    for (const file of jsonFiles) {
      const raw = await readFile(path.join(decksDir, file), "utf8");
      const deck = parseDeck(JSON.parse(raw));

      expect(deck.id.length).toBeGreaterThan(0);
      expect(deck.name.length).toBeGreaterThan(0);

      const categorySet = new Set(
        deck.categories.map((value) => value.toLowerCase()),
      );
      expect(categorySet.size).toBe(deck.categories.length);

      const cardIds = new Set(deck.cards.map((card) => card.id));
      expect(cardIds.size).toBe(deck.cards.length);

      deck.cards.forEach((card) => {
        expect(categorySet.has(card.category.toLowerCase())).toBe(true);
        expect(card.text.length).toBeGreaterThan(0);
      });
    }
  });

  it("rejects decks with duplicate categories", () => {
    const duplicateCategoryDeck = {
      id: "dup",
      name: "Duplicate Categories",
      description: "Test deck with duplicate categories",
      categories: ["One", "one"],
      cards: [
        { id: "one-1", category: "One", text: "First card" },
        { id: "one-2", category: "one", text: "Second card" },
      ],
    };

    expect(() => parseDeck(duplicateCategoryDeck)).toThrow(/unique/i);
  });

  it("rejects cards that reference unknown categories", () => {
    const deckWithUnknownCategory = {
      id: "unknown-category",
      name: "Unknown Category",
      description: "Test deck with an invalid card category",
      categories: ["Valid"],
      cards: [{ id: "x-1", category: "Missing", text: "Invalid card" }],
    };

    expect(() => parseDeck(deckWithUnknownCategory)).toThrow(/must match a category/i);
  });
});
