import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("personal-data-policy");
}
export default function PersonalDataPolicyPage() {
  return <LegalPage slug="personal-data-policy" />;
}
