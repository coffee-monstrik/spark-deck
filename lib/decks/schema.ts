export type DeckCard = {
  id: string;
  category: string;
  text: string;
};

export type Deck = {
  id: string;
  name: string;
  description: string;
  approximateTimeMinutes: number;
  categories: string[];
  cards: DeckCard[];
};

type ValidationIssue = {
  field: string;
  message: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const validateCategories = (
  input: unknown,
  issues: ValidationIssue[],
): string[] => {
  if (!Array.isArray(input)) {
    issues.push({ field: "categories", message: "must be an array" });
    return [];
  }

  const seen = new Set<string>();
  const categories: string[] = [];

  input.forEach((value, index) => {
    if (!isNonEmptyString(value)) {
      issues.push({
        field: `categories[${index}]`,
        message: "must be a non-empty string",
      });
      return;
    }

    const trimmed = value.trim();
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      issues.push({
        field: `categories[${index}]`,
        message: "must be unique (case-insensitive)",
      });
      return;
    }

    seen.add(key);
    categories.push(trimmed);
  });

  if (categories.length === 0) {
    issues.push({
      field: "categories",
      message: "must include at least one category",
    });
  }

  return categories;
};

const validateCards = (
  input: unknown,
  categories: string[],
  issues: ValidationIssue[],
): DeckCard[] => {
  if (!Array.isArray(input)) {
    issues.push({ field: "cards", message: "must be an array" });
    return [];
  }

  const categoryLookup = new Set(categories.map((value) => value.toLowerCase()));
  const idLookup = new Set<string>();
  const cards: DeckCard[] = [];

  input.forEach((value, index) => {
    if (!isRecord(value)) {
      issues.push({
        field: `cards[${index}]`,
        message: "must be an object",
      });
      return;
    }

    const { id, category, text } = value;
    if (!isNonEmptyString(id)) {
      issues.push({
        field: `cards[${index}].id`,
        message: "must be a non-empty string",
      });
    } else {
      const trimmedId = id.trim();
      if (idLookup.has(trimmedId)) {
        issues.push({
          field: `cards[${index}].id`,
          message: "must be unique",
        });
      } else {
        idLookup.add(trimmedId);
      }
    }

    if (!isNonEmptyString(category)) {
      issues.push({
        field: `cards[${index}].category`,
        message: "must be a non-empty string",
      });
    } else {
      const normalizedCategory = category.trim();
      if (!categoryLookup.has(normalizedCategory.toLowerCase())) {
        issues.push({
          field: `cards[${index}].category`,
          message: `must match a category: ${normalizedCategory}`,
        });
      }
    }

    if (!isNonEmptyString(text)) {
      issues.push({
        field: `cards[${index}].text`,
        message: "must be a non-empty string",
      });
    }

    if (
      isNonEmptyString(id) &&
      isNonEmptyString(category) &&
      isNonEmptyString(text)
    ) {
      cards.push({
        id: id.trim(),
        category: category.trim(),
        text: text.trim(),
      });
    }
  });

  if (cards.length === 0) {
    issues.push({
      field: "cards",
      message: "must include at least one card",
    });
  }

  return cards;
};

export const parseDeck = (payload: unknown): Deck => {
  if (!isRecord(payload)) {
    throw new Error("Invalid deck: expected an object at top-level");
  }

  const issues: ValidationIssue[] = [];

  const id = payload.id;
  const name = payload.name;
  const description = payload.description;
  const approximateTimeMinutes = payload.approximateTimeMinutes;

  if (!isNonEmptyString(id)) {
    issues.push({ field: "id", message: "must be a non-empty string" });
  }

  if (!isNonEmptyString(name)) {
    issues.push({ field: "name", message: "must be a non-empty string" });
  }

  if (!isNonEmptyString(description)) {
    issues.push({
      field: "description",
      message: "must be a non-empty string",
    });
  }

  if (!isPositiveNumber(approximateTimeMinutes)) {
    issues.push({
      field: "approximateTimeMinutes",
      message: "must be a positive number",
    });
  }

  const categories = validateCategories(payload.categories, issues);
  const cards = validateCards(payload.cards, categories, issues);

  if (issues.length > 0) {
    const details = issues
      .map((issue) => `${issue.field}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid deck: ${details}`);
  }

  return {
    id: (id as string).trim(),
    name: (name as string).trim(),
    description: (description as string).trim(),
    approximateTimeMinutes: approximateTimeMinutes as number,
    categories,
    cards,
  };
};
