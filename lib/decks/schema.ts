export type DeckTheme = {
  primary: string;
  secondary: string;
  disabled: string;
  surface: string;
  text: string;
  categoriesColors: string[];
  accent?: string;
  fontFamily?: string;
};

export type DeckCard = {
  id: string;
  category: string;
  text: string;
};

export type Deck = {
  id: string;
  name: string;
  description: string;
  theme: DeckTheme;
  categories: string[];
  cards: DeckCard[];
};

type ValidationIssue = {
  field: string;
  message: string;
};

export const DEFAULT_THEME: DeckTheme = {
  primary: "#0B7285",
  secondary: "#3BC9DB",
  disabled: "#CED4DA",
  surface: "#F8F9FA",
  text: "#0F172A",
  categoriesColors: ["#0B7285", "#3BC9DB", "#FFD43B", "#845EF7"],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validateTheme = (input: unknown, issues: ValidationIssue[]): DeckTheme => {
  if (input === undefined) {
    return { ...DEFAULT_THEME };
  }

  if (!isRecord(input)) {
    issues.push({ field: "theme", message: "must be an object" });
    return { ...DEFAULT_THEME };
  }

  const requiredKeys: (keyof DeckTheme)[] = [
    "primary",
    "secondary",
    "disabled",
    "surface",
    "text",
  ];

  const theme: DeckTheme = {
    primary: "",
    secondary: "",
    surface: "",
    text: "",
  };

  for (const key of requiredKeys) {
    const value = input[key];
    if (!isNonEmptyString(value)) {
      issues.push({
        field: `theme.${key}`,
        message: "must be a non-empty string",
      });
      continue;
    }
    theme[key] = value.trim();
  }

  const categoriesColors = input.categoriesColors;
  if (!Array.isArray(categoriesColors) || categoriesColors.length !== 4) {
    issues.push({
      field: "theme.categoriesColors",
      message: "must be an array of 4 colors",
    });
    theme.categoriesColors = [...DEFAULT_THEME.categoriesColors];
  } else {
    const processed: string[] = [];
    categoriesColors.forEach((value, index) => {
      if (!isNonEmptyString(value)) {
        issues.push({
          field: `theme.categoriesColors[${index}]`,
          message: "must be a non-empty string",
        });
      } else {
        processed.push(value.trim());
      }
    });

    if (processed.length === 4) {
      theme.categoriesColors = processed;
    } else {
      theme.categoriesColors = [...DEFAULT_THEME.categoriesColors];
    }
  }

  if (input.accent !== undefined) {
    if (isNonEmptyString(input.accent)) {
      theme.accent = input.accent.trim();
    } else {
      issues.push({
        field: "theme.accent",
        message: "must be a non-empty string when provided",
      });
    }
  }

  if (input.fontFamily !== undefined) {
    if (isNonEmptyString(input.fontFamily)) {
      theme.fontFamily = input.fontFamily.trim();
    } else {
      issues.push({
        field: "theme.fontFamily",
        message: "must be a non-empty string when provided",
      });
    }
  }

  return theme;
};

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

  const theme = validateTheme(payload.theme, issues);
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
    theme,
    categories,
    cards,
  };
};
