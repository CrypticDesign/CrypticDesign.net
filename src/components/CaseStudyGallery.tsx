"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// CRY-344: clickable case-study gallery with lightbox preview.
export type GalleryShot = { src: string; alt: string; caption: string };

type Props = {
  shots: GalleryShot[];
  accent: "magenta" | "cyan" | "gold" | "green";
  accentHex: string;
  studyTitle: string;
};

export default function CaseStudyGallery({
  shots,
  accent,
  accentHex,
  studyTitle,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + shots.length) % shots.length,
      ),
    [shots.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        // Simple focus trap: keep focus inside the dialog.
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

  useEffect(() => {
    if (openIndex === null) lastFocused.current?.focus();
  }, [openIndex]);

  const active = openIndex === null ? null : shots[openIndex];

  return (
    <>
      <div className="media-grid four">
        {shots.map((shot, i) => (
          <figure key={shot.src} className={`media-card accent-${accent} m-0`}>
            <button
              type="button"
              className="group block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
              aria-label={`Enlarge image: ${shot.caption} — ${studyTitle}`}
              onClick={(e) => {
                lastFocused.current = e.currentTarget;
                setOpenIndex(i);
              }}
            >
              <span className="media-card__image block">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width:640px) 100vw, (max-width:900px) 50vw, 25vw"
                />
              </span>
              <span className="media-card__body flex items-center justify-between gap-2">
                <span className="kicker" style={{ color: accentHex }}>
                  {shot.caption}
                </span>
                <span
                  aria-hidden="true"
                  className="text-[13px] opacity-60 transition-opacity group-hover:opacity-100"
                  style={{ color: accentHex }}
                >
                  ⤢
                </span>
              </span>
            </button>
          </figure>
        ))}
      </div>

      {active && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.caption} — ${studyTitle}`}
          className="fixed inset-0 z-[200] flex flex-col bg-[rgba(2,6,12,.94)] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <p className="m-0 text-[11px] uppercase tracking-[.1em] text-neutral-400">
              <span style={{ color: accentHex }}>{studyTitle}</span>
              <span className="mx-2 opacity-40">/</span>
              {active.caption}
              <span className="ml-3 opacity-60">
                {(openIndex ?? 0) + 1} of {shots.length}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close image preview"
              className="min-h-[44px] min-w-[44px] border border-[#173049] bg-transparent text-lg text-white hover:border-white"
            >
              ✕
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-8">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 z-10 min-h-[52px] min-w-[44px] border border-[#173049] bg-[rgba(3,8,15,.75)] text-xl text-white hover:border-white sm:left-6"
            >
              ‹
            </button>
            <div className="relative h-full w-full max-w-[1200px]">
              <Image
                key={active.src}
                src={active.src}
                alt={active.alt}
                fill
                sizes="100vw"
                className="!object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 z-10 min-h-[52px] min-w-[44px] border border-[#173049] bg-[rgba(3,8,15,.75)] text-xl text-white hover:border-white sm:right-6"
            >
              ›
            </button>
          </div>

          <p className="mx-auto mb-5 max-w-3xl px-5 text-center text-[12px] leading-relaxed text-neutral-400 sm:px-8">
            {active.alt}
          </p>
        </div>
      )}
    </>
  );
}
