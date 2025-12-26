import { Deck, DeckCard } from "../decks/schema";

export type PlayerId = "player1" | "player2";

export type PlayerState = {
  id: PlayerId;
  name: string;
};

export type CategoryStack = {
  name: string;
  color: string;
  cards: DeckCard[];
};

export type GameStatus = "idle" | "ready" | "stopped";

export type WinState = "none" | "drawn-exhausted" | "deck-finished";

export type GameState = {
  status: GameStatus;
  deck: {
    id: string;
    name: string;
    description: string;
    theme: Deck["theme"];
  };
  players: Record<PlayerId, PlayerState>;
  currentPlayer: PlayerId;
  drawnCategories: CategoryStack[];
  remainingCategories: CategoryStack[];
  selectedCategory: string | null;
  currentCard: DeckCard | null;
  answeredCount: number;
  log: string[];
  winState: WinState;
  stopped: boolean;
};

export type StartConfig = {
  deck: Deck;
  playerOneName?: string;
  playerTwoName?: string;
};

const DEFAULT_PLAYER_ONE = "Me";
const DEFAULT_PLAYER_TWO = "You";

const shuffle = <T,>(input: T[]): T[] => {
  const result = [...input];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const safeName = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const uniqueColors = (input: string[]): string[] =>
  Array.from(new Set(input.filter(Boolean)));

const adjustColor = (hex: string, delta: number): string => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;

  const num = parseInt(value, 16);
  const r = clamp((num >> 16) + delta, 0, 255);
  const g = clamp(((num >> 8) & 0x00ff) + delta, 0, 255);
  const b = clamp((num & 0x0000ff) + delta, 0, 255);

  const toHex = (component: number) => component.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const assignCategoryColors = (
  stacks: CategoryStack[],
  palette: string[],
  fallback: string,
): CategoryStack[] => {
  if (stacks.length === 0) return stacks;

  const basePalette = uniqueColors(palette);
  const needs = stacks.length - basePalette.length;

  const extendedPalette =
    needs > 0
      ? [
          ...basePalette,
          ...Array.from({ length: needs }, (_value, index) =>
            adjustColor(fallback || "#0b7285", (index + 1) * 10),
          ),
        ]
      : basePalette;

  const colorChoices = shuffle(extendedPalette).slice(0, stacks.length);

  return stacks.map((stack, index) => ({
    ...stack,
    color: colorChoices[index] ?? stack.color ?? fallback ?? "#0b7285",
  }));
};

export const isCategoryDepleted = (stack: CategoryStack): boolean => stack.cards.length === 0;

export const drawnCategoriesExhausted = (stacks: CategoryStack[]): boolean =>
  stacks.length > 0 && stacks.every(isCategoryDepleted);

const buildCategoryStacks = (
  deck: Deck,
  shuffledCards: DeckCard[],
): CategoryStack[] => {
  return deck.categories.map((category, index) => {
    const color =
      deck.theme.categoriesColors[
        index % Math.max(1, deck.theme.categoriesColors.length)
      ];
    const cards = shuffledCards.filter(
      (card) => card.category.toLowerCase() === category.toLowerCase(),
    );

    return {
      name: category,
      color,
      cards,
    };
  });
};

export const canStartGame = (deck: Deck | null | undefined): deck is Deck => {
  return Boolean(deck);
};

export const createInitialGameState = (config: StartConfig): GameState => {
  const playerOne = safeName(config.playerOneName, DEFAULT_PLAYER_ONE);
  const playerTwo = safeName(config.playerTwoName, DEFAULT_PLAYER_TWO);

  const shuffledCards = shuffle(config.deck.cards);
  const categoryStacks = shuffle(buildCategoryStacks(config.deck, shuffledCards));

  const drawnCategories = assignCategoryColors(
    categoryStacks.slice(0, 4),
    config.deck.theme.categoriesColors,
    config.deck.theme.primary,
  );
  const remainingCategories = categoryStacks.slice(drawnCategories.length);

  return {
    status: "ready",
    deck: {
      id: config.deck.id,
      name: config.deck.name,
      description: config.deck.description,
      theme: config.deck.theme,
    },
    players: {
      player1: { id: "player1", name: playerOne },
      player2: { id: "player2", name: playerTwo },
    },
    currentPlayer: "player1",
    drawnCategories,
    remainingCategories,
    selectedCategory: null,
    currentCard: null,
    answeredCount: 0,
    log: [],
    winState: "none",
    stopped: false,
  };
};

export const initialEmptyState: GameState = {
  status: "idle",
  deck: {
    id: "",
    name: "",
    description: "",
    theme: {
      primary: "",
      secondary: "",
      disabled: "",
      surface: "",
      text: "",
      categoriesColors: [],
    },
  },
  players: {
    player1: { id: "player1", name: DEFAULT_PLAYER_ONE },
    player2: { id: "player2", name: DEFAULT_PLAYER_TWO },
  },
  currentPlayer: "player1",
  drawnCategories: [],
  remainingCategories: [],
  selectedCategory: null,
  currentCard: null,
  answeredCount: 0,
  log: [],
  winState: "none",
  stopped: false,
};

export const countCardsInStacks = (stacks: CategoryStack[]): number =>
  stacks.reduce((count, stack) => count + stack.cards.length, 0);

export const remainingCardCount = (state: GameState): number =>
  countCardsInStacks([...state.drawnCategories, ...state.remainingCategories]) +
  (state.currentCard ? 1 : 0);

export const totalDeckSize = (state: GameState): number =>
  state.answeredCount + remainingCardCount(state);

export const evaluateWinState = (state: GameState): WinState => {
  const cardsRemaining = remainingCardCount(state);
  if (cardsRemaining === 0) {
    return "deck-finished";
  }

  const drawnExhausted = drawnCategoriesExhausted(state.drawnCategories);
  const hasActiveCard = Boolean(state.currentCard);

  if (drawnExhausted && !hasActiveCard) {
    return "drawn-exhausted";
  }

  return "none";
};
