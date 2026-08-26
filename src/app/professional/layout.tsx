import type { ReactNode } from "react";
import ProfessionalNavigation from "@/components/ProfessionalNavigation";

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  return <div className="professional-experience" data-section-accent="violet"><ProfessionalNavigation />{children}</div>;
}
