import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { HomepageTestimonialEditor } from "@/components/admin/homepage/HomepageTestimonialEditor";
import { API_ROUTES, type AdminHomepageTestimonialResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function EditHomepageTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIALS}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load homepage testimonials");
  const payload = (await response.json()) as { data: AdminHomepageTestimonialResponse[] };
  const item = payload.data.find((testimonial) => testimonial.id === id);
  if (!item) notFound();
  return <HomepageTestimonialEditor initial={item} />;
}
