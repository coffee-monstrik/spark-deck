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

  const drawnCategories = categoryStacks.slice(0, 4);
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

const totalCards = (stacks: CategoryStack[]): number =>
  stacks.reduce((count, stack) => count + stack.cards.length, 0);

export const evaluateWinState = (state: GameState): WinState => {
  const cardsRemaining = totalCards(state.drawnCategories) + totalCards(state.remainingCategories);
  if (cardsRemaining === 0) {
    return "deck-finished";
  }

  const hasDrawnCategories = state.drawnCategories.length > 0;
  const drawnExhausted =
    hasDrawnCategories && state.drawnCategories.every((stack) => stack.cards.length === 0);

  if (drawnExhausted) {
    return "drawn-exhausted";
  }

  return "none";
};
