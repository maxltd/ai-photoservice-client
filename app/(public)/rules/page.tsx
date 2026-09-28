import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("rules");
}
export default function RulesPage() {
  return <LegalPage slug="rules" />;
}
