import { permanentRedirect } from "next/navigation";

export default function LegacyExplorePage() {
  permanentRedirect("/entertainment/arcade");
}
