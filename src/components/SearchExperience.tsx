"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  resolvePublicSearch,
  type PublicSearchRecord,
  type SearchIndexMode,
} from "@/lib/search-contract";

const CATEGORY_LABELS = {
  release: "Release",
  world: "World",
  article: "Article",
  service: "Service",
} as const;

export default function SearchExperience({
  records,
  mode = "ready",
}: {
  records: readonly PublicSearchRecord[];
  mode?: SearchIndexMode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parameterQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(parameterQuery);
  const deferredQuery = useDeferredValue(query);
  const resolution = useMemo(
    () => resolvePublicSearch(deferredQuery, records, mode),
    [deferredQuery, mode, records],
  );

  useEffect(() => {
    setQuery(parameterQuery);
  }, [parameterQuery]);

  function updateQuery(value: string) {
    setQuery(value);
    const next = new URLSearchParams(searchParams.toString());
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    const suffix = next.toString();
    router.replace(suffix ? `/search?${suffix}` : "/search", { scroll: false });
  }

  return (
    <section className="grid gap-6" aria-labelledby="search-tool-title">
      <div className="panel border-t-2 border-t-[var(--section-accent)] p-5 sm:p-7">
        <div className="flex flex-col gap-2">
          <span className="kicker">Local public index</span>
          <h2 id="search-tool-title" className="text-2xl font-semibold text-white">Find approved public work</h2>
          <p id="search-scope-note" className="max-w-3xl text-[var(--muted)]">
            This searches a local index of public releases, worlds, articles, and services. It does not query accounts,
            private content, membership, roles, entitlements, history, or remote search services.
          </p>
        </div>

        <form role="search" className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
          <label className="flex min-w-0 flex-1 flex-col gap-2" htmlFor="site-search-query">
            <span className="text-sm font-semibold text-white">Search public content</span>
            <input
              id="site-search-query"
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Try Singularis, interaction design, or audio"
              autoComplete="off"
              aria-describedby="search-scope-note"
              className="min-h-12 w-full rounded-control border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-white outline-none placeholder:text-[var(--muted)] focus-visible:border-[var(--section-accent)] focus-visible:ring-2 focus-visible:ring-[var(--section-accent)]/35"
            />
          </label>
          {query ? (
            <button type="button" className="button secondary self-end" onClick={() => updateQuery("")}>
              Clear
            </button>
          ) : null}
        </form>
      </div>

      <div className="grid gap-4" data-search-state={resolution.state}>
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-[var(--muted)]">
          {resolution.message}
        </p>

        {resolution.state === "empty" ? (
          <div className="panel grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <div><span className="kicker">Included</span><p className="mt-2 text-white">Public releases, worlds, studio articles, and professional services.</p></div>
            <div><span className="kicker">Deferred</span><p className="mt-2 text-[var(--muted)]">Remote indexing, private results, personalization, saved history, and entitlement-aware retrieval.</p></div>
          </div>
        ) : null}

        {resolution.state === "results" ? (
          <ul className="grid gap-3" aria-label="Public search results">
            {resolution.results.map((result) => (
              <li key={result.id}>
                <Link href={result.href} className="panel group block border-l-2 border-l-[var(--section-accent)] p-5 transition hover:border-[var(--section-accent)] hover:bg-[var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--section-accent)]">
                  <span className="kicker">{CATEGORY_LABELS[result.category]} / {result.availability === "preview" ? "Public preview" : "Available"}</span>
                  <h3 className="mt-2 text-xl font-semibold text-white group-hover:text-[var(--section-accent)]">{result.title}</h3>
                  <p className="mt-2 max-w-4xl leading-relaxed text-[var(--muted)]">{result.summary}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-white">Open public destination <span aria-hidden="true">&nbsp;→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {resolution.state === "not-found" ? (
          <div className="panel p-5 sm:p-6">
            <span className="kicker">No local match</span>
            <h3 className="mt-2 text-xl font-semibold text-white">Nothing public in the current index matches that query.</h3>
            <p className="mt-3 text-[var(--muted)]">Try a title, world, article topic, or professional capability. A missing result does not imply that private or future content exists.</p>
          </div>
        ) : null}

        {resolution.state === "unavailable" ? (
          <div className="panel border-l-2 border-l-amber-300 p-5 sm:p-6" role="alert">
            <span className="kicker">Search unavailable</span>
            <h3 className="mt-2 text-xl font-semibold text-white">The public index could not be loaded.</h3>
            <p className="mt-3 text-[var(--muted)]">No fallback request was sent to an account, entitlement, analytics, or third-party search service.</p>
          </div>
        ) : null}

        {resolution.state === "deferred" ? (
          <div className="panel border-l-2 border-l-violet-300 p-5 sm:p-6">
            <span className="kicker">Search scope deferred</span>
            <h3 className="mt-2 text-xl font-semibold text-white">This search scope is not active.</h3>
            <p className="mt-3 text-[var(--muted)]">It will remain unavailable until an approved service can enforce content rights, visibility, and access boundaries.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
