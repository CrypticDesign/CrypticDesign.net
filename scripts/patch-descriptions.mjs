// CRY-260 one-time patch: rewrite static-route meta descriptions to 140-160
// chars, on-brand. Verifies length before writing; replaces the first
// `description: "..."` value in each file regardless of formatting.
import { readFile, writeFile } from "node:fs/promises";

const D = {
  "src/app/page.tsx":
    "Your personal Cryptic Design space: character, saved library, activity, interests, and progress across releases, franchises, games, music, and original worlds.",
  "src/app/entertainment/page.tsx":
    "The complete audience front door to Cryptic Design — releases, franchises, games, cinema, Cryptic Signal audio, visual studies, and the ideas connecting them.",
  "src/app/professional/page.tsx":
    "Cryptic Design LLC: senior UX, product, and creative-technology consulting — research, interaction design, interface systems, and case studies for complex work.",
  "src/app/search/page.tsx":
    "Search Cryptic Design releases, products, franchises, articles, and creative work across the entertainment platform and professional studio, all in one place.",
  "src/app/account/create/page.tsx":
    "Create a CrypticDesign.net account to build your persistent character, save a library, follow releases, and carry your activity and progress as you go.",
  "src/app/professional/case-studies/page.tsx":
    "Selected Cryptic Design work — console game UX, VR training, enterprise health systems, and mobile strategy — told as problem, approach, craft, and outcome.",
  "src/app/professional/articles/page.tsx":
    "Writing and research from the Cryptic Design studio: holistic UX practice, game design analysis, creative technology, and notes from building original systems.",
  "src/app/entertainment/visual-studies/page.tsx":
    "Rights-safe visual studies, experiments, and process work from Cryptic Design — an Entertainment-owned space for imagery, research, and creative technology.",
  "src/app/entertainment/store/page.tsx":
    "Prints and studio goods from Cryptic Design — Lifa cosmic-series canvas art and studio merchandise. A preview of the rebuilt store; ordering returns at launch.",
  "src/app/products/page.tsx":
    "Cryptic Design product and franchise homes — Singularis, Lifa, and Cryptic Signal — where releases, interactive worlds, and long-form universes come together.",
  "src/app/audio/page.tsx":
    "Cryptic Signal — the public music and sonic-media division of Cryptic Design. Scores, soundscapes, and audio releases, beginning with Signal & Systems.",
  "src/app/privacy/page.tsx":
    "How Cryptic Design collects, uses, and protects your personal data across the website, inquiry forms, analytics, and marketing — and the choices you control.",
  "src/app/terms/page.tsx":
    "Terms of use and intellectual-property notice for CrypticDesign.net — how the site may be used, ownership of content, and disclosures for preview features.",
};

let failed = false;
for (const [file, desc] of Object.entries(D)) {
  if (desc.length < 140 || desc.length > 160) {
    console.log(`LENGTH ${desc.length} OUT OF BAND: ${file}`);
    failed = true;
  }
}
if (failed) { console.log("\nAborting — fix lengths first."); process.exit(1); }

for (const [file, desc] of Object.entries(D)) {
  const src = await readFile(file, "utf8");
  const re = /description:\s*"(?:[^"\\]|\\.)*"/;
  if (!re.test(src)) { console.log(`NO description field in ${file}`); continue; }
  const out = src.replace(re, `description: ${JSON.stringify(desc)}`);
  await writeFile(file, out, "utf8");
  console.log(`OK  ${file}  (${desc.length} chars)`);
}
console.log("\nDone.");
