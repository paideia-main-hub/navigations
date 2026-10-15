/**
 * Formats practice/resource pack copy for readability without rewriting CMS text.
 */

import type { ReactNode } from "react";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AccentPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-accent-soft px-4 py-3">
      <p className="text-xs font-bold tracking-[0.14em] text-accent-strong uppercase">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitQuestions(text: string): { intro: string | null; questions: string[] } {
  const questions = text.match(/[^?]+\?/g)?.map((q) => q.trim()) ?? [];
  if (questions.length < 2) return { intro: null, questions: [] };
  const firstQ = text.indexOf(questions[0]);
  const intro = firstQ > 0 ? text.slice(0, firstQ).trim().replace(/:\s*$/, "") : null;
  return { intro: intro || null, questions };
}

function splitLabeledDashes(text: string): { label: string; body: string }[] | null {
  const matches = [...text.matchAll(/(?:^|[.!?]\s+|:\s*)([A-Z][^—–\n]{1,48}?)\s*[—–]\s*/g)];
  if (matches.length < 2) return null;

  const parts: { label: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const body = text.slice(start, end).trim().replace(/\.\s*$/, "");
    if (label && body) parts.push({ label, body });
  }
  return parts.length >= 2 ? parts : null;
}

function splitNumbered(text: string): string[] | null {
  const items = text
    .split(/(?=\d+\.\s)/)
    .map((part) => part.trim())
    .filter((part) => /^\d+\.\s/.test(part));
  return items.length >= 2 ? items : null;
}

function splitBulletDots(text: string): string[] | null {
  if (!text.includes(" • ")) return null;
  return text
    .split(" • ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitWeeks(text: string): string[] | null {
  const items = text
    .split(/(?=Week\s+\d+\s*[—–-]\s*)/i)
    .map((part) => part.trim())
    .filter((part) => /^Week\s+\d+/i.test(part));
  return items.length >= 2 ? items : null;
}

function renderParagraph(paragraph: string, key: string): ReactNode {
  const numbered = splitNumbered(paragraph);
  if (numbered) {
    return <BulletList key={key} items={numbered} />;
  }

  const weeks = splitWeeks(paragraph);
  if (weeks) return <BulletList key={key} items={weeks} />;

  const dots = splitBulletDots(paragraph);
  if (dots) {
    // Category prefixes like "Environment: …" stay inside each item.
    return <BulletList key={key} items={dots} />;
  }

  const questions = splitQuestions(paragraph);
  if (questions.questions.length >= 2) {
    return (
      <div key={key} className="space-y-3">
        {questions.intro ? <p className="text-sm leading-relaxed text-foreground">{questions.intro}:</p> : null}
        <BulletList items={questions.questions} />
      </div>
    );
  }

  const forAgainst = paragraph.match(/^(FOR|AGAINST)\s*[—–-]\s*([\s\S]+)$/i);
  if (forAgainst) {
    return (
      <AccentPanel key={key} label={forAgainst[1]}>
        <p className="text-sm leading-relaxed text-foreground">{forAgainst[2].trim()}</p>
      </AccentPanel>
    );
  }

  const callout = paragraph.match(/^(Learning point|Useful language):\s*([\s\S]+)$/i);
  if (callout) {
    return (
      <AccentPanel key={key} label={callout[1]}>
        <p className="text-sm leading-relaxed text-foreground">{callout[2].trim()}</p>
      </AccentPanel>
    );
  }

  const labeled = splitLabeledDashes(paragraph);
  if (labeled) {
    const prefixEnd = paragraph.search(/[A-Z][^—–\n]{1,48}?\s*[—–]\s*/);
    const prefix = prefixEnd > 0 ? paragraph.slice(0, prefixEnd).trim().replace(/:\s*$/, "") : null;
    const closing = (() => {
      const last = labeled[labeled.length - 1];
      const lastIndex = paragraph.lastIndexOf(last.body);
      const after = paragraph.slice(lastIndex + last.body.length).trim().replace(/^\.\s*/, "");
      return after && !labeled.some((l) => after.startsWith(l.label)) ? after : null;
    })();

    return (
      <div key={key} className="space-y-3">
        {prefix ? <p className="text-sm leading-relaxed text-foreground">{prefix}:</p> : null}
        <div className="space-y-2">
          {labeled.map((item) => (
            <div key={`${item.label}-${item.body}`} className="rounded-lg border border-accent/30 bg-background px-4 py-3">
              <p className="text-xs font-bold tracking-[0.12em] text-accent-strong uppercase">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{item.body}</p>
            </div>
          ))}
        </div>
        {closing ? <BulletList items={splitSentences(closing)} /> : null}
      </div>
    );
  }

  return <BulletList key={key} items={splitSentences(paragraph)} />;
}

export function CompetitionResourceBody({ content }: { content: string }) {
  const paragraphs = content
    .trim()
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return <div className="mt-3 space-y-4">{paragraphs.map((paragraph, index) => renderParagraph(paragraph, `${index}-${paragraph.slice(0, 24)}`))}</div>;
}
