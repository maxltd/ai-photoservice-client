import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata("cookie-policy");
}
export default function CookiePolicyPage() {
  return <LegalPage slug="cookie-policy" />;
}
