import type { ArticleBlock } from "@/lib/articles";

// CRY-344: renders imported article blocks with our own typography —
// no runtime markdown parser and no HTML injection.
export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="mt-4 text-2xl font-semibold text-white sm:text-[28px]"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-2 text-xl font-semibold text-white">
                {block.text}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={i}
                className="mt-1 text-[15px] font-semibold uppercase tracking-[.06em] text-accent-cyan"
              >
                {block.text}
              </h4>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-accent-cyan pl-5 text-[17px] italic leading-relaxed text-neutral-300"
              >
                {block.text}
              </blockquote>
            );
          case "list":
            return (
              <ul
                key={i}
                className="flex list-disc flex-col gap-2 pl-6 text-[15px] leading-relaxed text-neutral-400"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "orderedList":
            return (
              <ol
                key={i}
                className="flex list-decimal flex-col gap-2 pl-6 text-[15px] leading-relaxed text-neutral-400"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "divider":
            return (
              <hr key={i} className="my-3 border-0 border-t border-[#173049]" />
            );
          default:
            return (
              <p key={i} className="text-[15px] leading-[1.75] text-neutral-400">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
