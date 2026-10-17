import { permanentRedirect } from "next/navigation";

export default function LegacyCinemaPage() {
  permanentRedirect("/entertainment/video");
}
