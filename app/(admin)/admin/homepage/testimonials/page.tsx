import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HomepageTestimonialsList } from "@/components/admin/homepage/HomepageTestimonialsList";
import { API_ROUTES, type AdminHomepageTestimonialResponse } from "@/lib/api/contract";

export const dynamic = "force-dynamic";

export default async function HomepageTestimonialsPage(): Promise<React.JSX.Element> {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiUrl}${API_ROUTES.ADMIN_HOMEPAGE_TESTIMONIALS}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/?auth=1");
  if (response.status === 403) redirect("/403");
  if (!response.ok) throw new Error("Failed to load homepage testimonials");
  const payload = (await response.json()) as { data: AdminHomepageTestimonialResponse[] };
  return <HomepageTestimonialsList initialData={payload.data} />;
}
