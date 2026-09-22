import type { Metadata } from "next";

type SocialMetadataInput = {
  title: string;
  description: string;
  url: string;
  image: string;
  type?: "website" | "article";
  publishedTime?: string;
};

const SITE_NAME = "Cryptic Design";

/**
 * Build a complete route-owned social metadata pair.
 *
 * Next.js replaces nested metadata objects at route boundaries, so every
 * public route supplies the complete Open Graph and X card contract instead
 * of depending on root-layout fields to survive a shallow merge.
 */
export function socialMetadata({
  title,
  description,
  url,
  image,
  type = "website",
  publishedTime,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const commonOpenGraph = {
    title,
    description,
    url,
    siteName: SITE_NAME,
    images: [image],
  };

  return {
    openGraph: type === "article"
      ? {
          ...commonOpenGraph,
          type: "article",
          publishedTime: publishedTime || undefined,
        }
      : {
          ...commonOpenGraph,
          type: "website",
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
