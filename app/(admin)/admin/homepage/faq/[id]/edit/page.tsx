import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HomepageFaqEditor } from "@/components/admin/homepage-faq/HomepageFaqEditor";
import { API_ROUTES, type HomepageFaqResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function EditHomepageFaqPage({ params }: { params: Promise<{ id: string }> }): Promise<React.JSX.Element> {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_HOMEPAGE_FAQ}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load homepage FAQ");
  const payload = (await response.json()) as { data: HomepageFaqResponse[] };
  const item = payload.data.find((faq) => faq.id === id);
  if (!item) notFound();
  return <HomepageFaqEditor initial={item} />;
}
