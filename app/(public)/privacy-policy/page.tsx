import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("privacy-policy");
}
export default function PrivacyPolicyPage() {
  return <LegalPage slug="privacy-policy" />;
}
