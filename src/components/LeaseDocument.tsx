import type { ReactNode } from "react";

// Shows lease text (a small markdown subset: "# " and "## " headings, "- " lists,
// **bold**, one paragraph per line) as React elements, so nothing in the text can
// inject HTML. Laid out for reading on screen and for printing.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

export function LeaseDocument({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="ml-5 list-disc space-y-1">
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (!line.trim()) continue;
    const key = `b-${blocks.length}`;
    if (line.startsWith("# ")) blocks.push(<h1 key={key} className="text-center text-xl font-bold">{inline(line.slice(2))}</h1>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={key} className="pt-3 text-base font-bold">{inline(line.slice(3))}</h2>);
    else blocks.push(<p key={key}>{inline(line)}</p>);
  }
  flushList();

  return <div className="lease-document space-y-2 font-serif text-[15px] leading-relaxed">{blocks}</div>;
}
