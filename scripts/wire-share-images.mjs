// CRY-260: point each launch route's og:image + twitter image at its
// route-specific share card. Injects openGraph/twitter image fields right
// after the existing `alternates: { canonical }` in each page's metadata.
import { readFile, writeFile } from "node:fs/promises";

// file -> [canonicalPath, shareKey]
const PAGES = {
  "src/app/page.tsx": ["/", "home"],
  "src/app/entertainment/page.tsx": ["/entertainment", "entertainment"],
  "src/app/professional/page.tsx": ["/professional", "professional"],
  "src/app/search/page.tsx": ["/search", "search"],
  "src/app/account/create/page.tsx": ["/account/create", "account-create"],
  "src/app/professional/case-studies/page.tsx": ["/professional/case-studies", "case-studies"],
  "src/app/professional/articles/page.tsx": ["/professional/articles", "articles"],
  "src/app/entertainment/visual-studies/page.tsx": ["/entertainment/visual-studies", "visual-studies"],
  "src/app/entertainment/store/page.tsx": ["/entertainment/store", "store"],
  "src/app/products/page.tsx": ["/products", "products"],
  "src/app/audio/page.tsx": ["/audio", "audio"],
  "src/app/privacy/page.tsx": ["/privacy", "privacy"],
  "src/app/terms/page.tsx": ["/terms", "terms"],
};

for (const [file, [canonical, key]] of Object.entries(PAGES)) {
  let src = await readFile(file, "utf8");
  if (src.includes(`/share/${key}.png`)) { console.log(`SKIP (already wired) ${file}`); continue; }
  const img = `/share/${key}.png`;
  const inject = `openGraph: { images: ["${img}"] }, twitter: { card: "summary_large_image", images: ["${img}"] }, `;
  // Match the canonical alternates block (inline or spaced) and append after it.
  const re = new RegExp(`(alternates:\\s*\\{\\s*canonical:\\s*"${canonical.replace(/\//g, "\\/")}"\\s*\\},?)`);
  if (!re.test(src)) { console.log(`NO anchor in ${file}`); continue; }
  src = src.replace(re, (m) => `${m.replace(/,?$/, ",")} ${inject}`);
  await writeFile(file, src, "utf8");
  console.log(`OK  ${file}  -> ${img}`);
}
console.log("Done.");
