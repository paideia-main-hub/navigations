/**
 * Presents competition overview copy with clear visual sections.
 * Does not rewrite CMS prose — only splits and styles existing paragraphs.
 * Competency codes (C09, etc.) are hidden in the public display.
 */

type OverviewBlock =
  | { type: "paragraph"; text: string }
  | { type: "labeled"; label: string; body: string }
  | { type: "competencies"; label: string; names: string[] };

function parseOverviewBlocks(raw: string): OverviewBlock[] {
  return raw
    .trim()
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const competenciesChunk = chunk.match(/^Competencies developed\s*[—–:-]\s*([\s\S]+)$/i);
      if (competenciesChunk) {
        const names = competencyNamesFromBody(competenciesChunk[1]);
        if (names.length > 0) {
          return { type: "competencies" as const, label: "Competencies developed", names };
        }
      }

      const labeled = chunk.match(/^([^:\n]{2,48})\s*:\s+([\s\S]+)$/);
      if (labeled && !/^Competencies developed/i.test(labeled[1])) {
        return { type: "labeled" as const, label: labeled[1].trim(), body: labeled[2].trim() };
      }
      const dashLabeled = chunk.match(/^([^—–\n]{2,48})\s*[—–]\s+([\s\S]+)$/);
      if (dashLabeled && !dashLabeled[1].includes(".") && !/^Competencies developed/i.test(dashLabeled[1])) {
        return { type: "labeled" as const, label: dashLabeled[1].trim(), body: dashLabeled[2].trim() };
      }
      return { type: "paragraph" as const, text: chunk };
    });
}

/** Pull competency display names, dropping codes like C09. */
function competencyNamesFromBody(body: string): string[] {
  const coded = [...body.matchAll(/\bC\d+\s+([^.,;]+)/g)].map((match) => match[1].trim()).filter(Boolean);
  if (coded.length > 0) return coded;

  // Fallback if codes were already stripped in CMS text.
  return body
    .replace(/\b(?:Core|Supporting)\s*:\s*/gi, "")
    .split(/[.,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Split semicolon lists (e.g. "What students gain") without changing the phrases. */
function listItemsFromBody(body: string): string[] | null {
  if (!body.includes(";")) return null;
  const items = body
    .split(";")
    .map((part) => part.trim().replace(/^and\s+/i, ""))
    .filter(Boolean);
  return items.length >= 2 ? items : null;
}

export function CompetitionOverviewSections({
  overview,
  domainLabel,
}: {
  overview: string | null | undefined;
  domainLabel: string;
}) {
  const text = overview?.trim();
  if (!text) {
    return <p className="text-base leading-relaxed text-muted">Overview coming soon.</p>;
  }

  const blocks = parseOverviewBlocks(text);

  return (
    <div className="max-w-2xl space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className="text-base leading-relaxed text-foreground">
              {block.text}
            </p>
          );
        }

        if (block.type === "competencies") {
          return (
            <section key={index} className="rounded-xl border border-accent/30 bg-surface px-5 py-4">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
                {block.label}
              </h3>
              <ul className="mt-3 space-y-2">
                {block.names.map((name) => (
                  <li key={name} className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        const items = listItemsFromBody(block.body);

        return (
          <section key={index} className="rounded-xl border border-accent/30 bg-surface px-5 py-4">
            <h3 className="text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
              {block.label}
            </h3>
            {items ? (
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-foreground">{block.body}</p>
            )}
          </section>
        );
      })}

      <p className="border-t border-border pt-4 text-sm text-muted">
        Domain: <span className="font-medium text-foreground">{domainLabel || "—"}</span>
      </p>
    </div>
  );
}
