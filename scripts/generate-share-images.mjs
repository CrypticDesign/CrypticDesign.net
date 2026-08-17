// CRY-260: generate per-route 1200x630 Open Graph share images from each
// route's own hero art (Robert's choice: bespoke hero-based, not templated).
// Center cover-crop to the 1.91:1 social standard. Output: public/share/.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/images";
const OUT = "public/share";
await mkdir(OUT, { recursive: true });

// route key -> source hero. Routes with a dedicated hero use their own;
// utility routes (search/account/privacy/terms/store) borrow the closest
// on-brand section hero since they have no hero of their own.
const MAP = {
  "home": "my-home-hero.png",
  "entertainment": "entertainment-hero.png",
  "professional": "professional-hero.png",
  "search": "entertainment-hero.png",
  "account-create": "my-home-hero.png",
  "case-studies": "case-studies/humankind-hero.jpg",
  "articles": "human-machine.png",
  "visual-studies": "entertainment-feature.png",
  "store": "entertainment-feature.png",
  "products": "singularis.png",
  "singularis": "singularis.png",
  "audio": "signal-systems.png",
  "privacy": "professional-hero.png",
  "terms": "professional-hero.png",
};

for (const [key, rel] of Object.entries(MAP)) {
  const input = path.join(SRC, rel);
  const output = path.join(OUT, `${key}.png`);
  try {
    await sharp(input)
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .png({ quality: 90 })
      .toFile(output);
    console.log(`OK  ${key}  <- ${rel}`);
  } catch (e) {
    console.log(`FAIL ${key}  ${e.message.slice(0, 80)}`);
  }
}
console.log("Done.");
