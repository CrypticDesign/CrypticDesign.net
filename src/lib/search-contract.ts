export const SEARCH_RESULT_CATEGORIES = ["release", "world", "article", "service"] as const;

export type SearchResultCategory = (typeof SEARCH_RESULT_CATEGORIES)[number];
export type SearchResultAvailability = "available" | "preview";
export type SearchIndexMode = "ready" | "unavailable" | "deferred";
export type SearchResolutionState = "empty" | "results" | "not-found" | "unavailable" | "deferred";

export interface PublicSearchRecord {
  id: string;
  category: SearchResultCategory;
  title: string;
  summary: string;
  href: string;
  keywords: readonly string[];
  availability: SearchResultAvailability;
  access: "public";
}

export interface SearchResolution {
  state: SearchResolutionState;
  query: string;
  results: readonly PublicSearchRecord[];
  message: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreRecord(record: PublicSearchRecord, terms: readonly string[], normalizedQuery: string): number {
  const title = normalize(record.title);
  const summary = normalize(record.summary);
  const category = normalize(record.category);
  const keywords = normalize(record.keywords.join(" "));
  const searchable = `${title} ${summary} ${category} ${keywords}`;

  if (!terms.every((term) => searchable.includes(term))) return 0;

  let score = title === normalizedQuery ? 30 : title.startsWith(normalizedQuery) ? 18 : title.includes(normalizedQuery) ? 12 : 0;
  for (const term of terms) {
    if (title.startsWith(term)) score += 8;
    else if (title.includes(term)) score += 5;
    if (keywords.includes(term)) score += 3;
    if (category.includes(term)) score += 2;
    if (summary.includes(term)) score += 1;
  }
  return score;
}

export function searchPublicRecords(query: string, records: readonly PublicSearchRecord[]): PublicSearchRecord[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(" ").filter(Boolean);

  return records
    .map((record) => ({ record, score: scoreRecord(record, terms, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .map(({ record }) => record);
}

export function resolvePublicSearch(
  query: string,
  records: readonly PublicSearchRecord[],
  mode: SearchIndexMode = "ready",
): SearchResolution {
  const normalizedQuery = query.trim().replace(/\s+/g, " ");

  if (mode === "unavailable") {
    return {
      state: "unavailable",
      query: normalizedQuery,
      results: [],
      message: "The local public index is temporarily unavailable. No remote or private search was attempted.",
    };
  }

  if (mode === "deferred") {
    return {
      state: "deferred",
      query: normalizedQuery,
      results: [],
      message: "Search for this scope is deferred until an approved service can enforce rights and visibility.",
    };
  }

  if (!normalizedQuery) {
    return {
      state: "empty",
      query: "",
      results: [],
      message: "Enter a term to search the approved local public index.",
    };
  }

  const results = searchPublicRecords(normalizedQuery, records);
  if (results.length === 0) {
    return {
      state: "not-found",
      query: normalizedQuery,
      results,
      message: `No public local results were found for “${normalizedQuery}”.`,
    };
  }

  return {
    state: "results",
    query: normalizedQuery,
    results,
    message: `${results.length} public ${results.length === 1 ? "result" : "results"} found for “${normalizedQuery}”.`,
  };
}
