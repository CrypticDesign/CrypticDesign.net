// CRY-344 item 5: legacy store catalog, presented as a preview only.
// Pricing and checkout are intentionally NOT modelled here — commerce is a
// deferred backend (CRY-320: no frontend preview may imply a live capability).

export type StoreItem = {
  slug: string;
  name: string;
  collection: "lifa-art" | "merchandise";
  format: string;
  image: string;
  alt: string;
};

export const storeItems: StoreItem[] = [
  {
    slug: "cryptic-seer-on-canvas",
    name: "A Cryptic Seer",
    collection: "lifa-art",
    format: "Canvas print",
    image: "/images/store/cryptic-seer-on-canvas.jpg",
    alt: "Lifa — A Cryptic Seer canvas print artwork",
  },
  {
    slug: "lifa-birth-of-a-star-on-canvas",
    name: "Birth of a Star — Stage 01",
    collection: "lifa-art",
    format: "Canvas print",
    image: "/images/store/lifa-birth-of-a-star-on-canvas.png",
    alt: "Lifa — Birth of a Star Stage 01 canvas print artwork",
  },
  {
    slug: "lifa-birth-of-a-star-stage-02-on-canvas",
    name: "Birth of a Star — Stage 02",
    collection: "lifa-art",
    format: "Canvas print",
    image: "/images/store/lifa-birth-of-a-star-stage-02-on-canvas.png",
    alt: "Lifa — Birth of a Star Stage 02 canvas print artwork",
  },
  {
    slug: "lifa-supernova-on-canvas",
    name: "A Supernova",
    collection: "lifa-art",
    format: "Canvas print",
    image: "/images/store/lifa-supernova-on-canvas.png",
    alt: "Lifa — A Supernova canvas print artwork",
  },
  {
    slug: "lifa-birth-of-a-solar-system-stage-01",
    name: "Birth of a Solar System — Stage 01",
    collection: "lifa-art",
    format: "Canvas print",
    image: "/images/store/lifa-birth-of-a-solar-system-stage-01.png",
    alt: "Lifa — Birth of a Solar System Stage 01 canvas print artwork",
  },
  {
    slug: "flat-bill-cap",
    name: "Flat Bill Cap",
    collection: "merchandise",
    format: "Headwear",
    image: "/images/store/flat-bill-cap.png",
    alt: "Cryptic Design flat bill cap",
  },
  {
    slug: "five-panel-cap",
    name: "Five Panel Cap",
    collection: "merchandise",
    format: "Headwear",
    image: "/images/store/five-panel-cap.png",
    alt: "Cryptic Design five panel cap",
  },
  {
    slug: "cryptic-design-distressed-dad-hat",
    name: "Distressed Dad Hat",
    collection: "merchandise",
    format: "Headwear",
    image: "/images/store/cryptic-design-distressed-dad-hat.jpg",
    alt: "Cryptic Design distressed dad hat",
  },
  {
    slug: "short-sleeve-unisex-t-shirt",
    name: "Short-Sleeve Unisex T-Shirt",
    collection: "merchandise",
    format: "Apparel",
    image: "/images/store/short-sleeve-unisex-t-shirt.png",
    alt: "Cryptic Design short-sleeve unisex t-shirt",
  },
  {
    slug: "cryptic-design-bubble-free-stickers",
    name: "Logo Stickers",
    collection: "merchandise",
    format: "Bubble-free stickers",
    image: "/images/store/cryptic-design-bubble-free-stickers.png",
    alt: "Cryptic Design logo bubble-free stickers",
  },
  {
    slug: "cryptic-design-logo-with-name-bubble-free-stickers",
    name: "Logo with Name Stickers",
    collection: "merchandise",
    format: "Bubble-free stickers",
    image: "/images/store/cryptic-design-logo-with-name-bubble-free-stickers.png",
    alt: "Cryptic Design logo with name bubble-free stickers",
  },
];

export const collections = [
  {
    id: "lifa-art" as const,
    title: "Lifa — Cosmic Series",
    blurb:
      "Formation, stellar birth, and supernova studies from the Lifa universe, printed on canvas.",
    accent: "#00e5ff",
  },
  {
    id: "merchandise" as const,
    title: "Studio Merchandise",
    blurb: "Headwear, apparel, and stickers carrying the Cryptic Design mark.",
    accent: "#ffd400",
  },
];

export function itemsIn(collection: StoreItem["collection"]): StoreItem[] {
  return storeItems.filter((i) => i.collection === collection);
}
