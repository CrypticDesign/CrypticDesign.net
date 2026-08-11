import Image from "next/image";
import type { ArticleBlock } from "@/lib/articles";

// CRY-344: renders imported article blocks with our own typography —
// no runtime markdown parser and no HTML injection.
type EditorialImage = { src: string; alt: string };

export default function ArticleBody({ blocks, images = [] }: { blocks: ArticleBlock[]; images?: EditorialImage[] }) {
  const imageSlots = new Map<number, EditorialImage[]>();
  images.forEach((image, index) => {
    const slot = Math.min(blocks.length - 1, Math.max(0, Math.floor(((index + 1) * blocks.length) / (images.length + 1))));
    imageSlots.set(slot, [...(imageSlots.get(slot) ?? []), image]);
  });

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        let content;
        switch (block.type) {
          case "h2":
            content = (
              <h2
                key={i}
                className="mt-4 text-2xl font-semibold text-white sm:text-[28px]"
              >
                {block.text}
              </h2>
            );
            break;
          case "h3":
            content = (
              <h3 key={i} className="mt-2 text-xl font-semibold text-white">
                {block.text}
              </h3>
            );
            break;
          case "h4":
            content = (
              <h4
                key={i}
                className="mt-1 text-[15px] font-semibold uppercase tracking-[.06em] text-accent-cyan"
              >
                {block.text}
              </h4>
            );
            break;
          case "quote":
            content = (
              <blockquote
                key={i}
                className="border-l-2 border-accent-cyan pl-5 text-[17px] italic leading-relaxed text-neutral-300"
              >
                {block.text}
              </blockquote>
            );
            break;
          case "list":
            content = (
              <ul
                key={i}
                className="flex list-disc flex-col gap-2 pl-6 text-[15px] leading-relaxed text-neutral-400"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
            break;
          case "orderedList":
            content = (
              <ol
                key={i}
                className="flex list-decimal flex-col gap-2 pl-6 text-[15px] leading-relaxed text-neutral-400"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
            break;
          case "divider":
            content = (
              <hr key={i} className="my-3 border-0 border-t border-[#173049]" />
            );
            break;
          default:
            content = (
              <p key={i} className="text-[15px] leading-[1.75] text-neutral-400">
                {block.text}
              </p>
            );
            break;
        }
        const inlineImages = imageSlots.get(i) ?? [];
        return <div className="contents" key={i}>{content}{inlineImages.map((image) => <figure key={image.src} className="my-5 overflow-hidden bg-[#07111b]"><div className="relative aspect-[16/9] w-full"><Image src={image.src} alt={image.alt} fill sizes="(max-width:900px) 100vw, 720px" className="object-cover" /></div></figure>)}</div>;
      })}
    </div>
  );
}
