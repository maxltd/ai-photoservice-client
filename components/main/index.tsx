import { StatsSection } from "./Stats";
import { FooterSection } from "./Footer";
import { PromoBanner } from "./PromoBanner";
import { FAQSection } from "./FAQ";
import { FinalCTASection } from "./FinalCTA";
import { HowItWorksSection } from "./HowItWorks";
import { HeroSection } from "./Hero";
import { RealismSection } from "./Realism";
import { PopularIdeasSection } from "./PopularIdeas";
import { TestimonialsSection } from "./Testimonials";
import { AudienceSection } from "./Audience";
import { ExperienceSection } from "./Experience";
import MainPageClient from "./MainPageClient";
import { StylesGridSection } from "./StylesGrid";
import {
  API_ROUTES,
  type HomepageFaqResponse,
  type HomepageTestimonialResponse,
  type PublicBlogListResponse,
  type PublicIdeasListResponse,
  type PublicStylesListResponse,
} from "@/lib/api/contract";

export default async function MainPage({ authOpen }: { authOpen: boolean }): Promise<React.JSX.Element> {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("API_URL is not set");
  const ideasUrl = new URL(`${apiUrl}${API_ROUTES.PHOTO_SESSION_IDEAS}`);
  ideasUrl.searchParams.set("page", "1");
  ideasUrl.searchParams.set("pageSize", "10");
  ideasUrl.searchParams.set("showInHomepage", "true");
  const blogUrl = new URL(`${apiUrl}${API_ROUTES.BLOG}`);
  blogUrl.searchParams.set("page", "1");
  blogUrl.searchParams.set("pageSize", "10");
  blogUrl.searchParams.set("showInHomepage", "true");
  const stylesUrl = new URL(`${apiUrl}${API_ROUTES.PHOTO_SESSION_STYLES}`);
  stylesUrl.searchParams.set("page", "1");
  stylesUrl.searchParams.set("pageSize", "15");
  stylesUrl.searchParams.set("showInHomepage", "true");

  const [testimonialsResponse, faqResponse, ideasResponse, blogResponse, stylesResponse] = await Promise.all([
    fetch(`${apiUrl}/api/v1/homepage/testimonials`, { cache: "no-store" }),
    fetch(`${apiUrl}/api/v1/homepage/faq`, { cache: "no-store" }),
    fetch(ideasUrl, { cache: "no-store" }),
    fetch(blogUrl, { cache: "no-store" }),
    fetch(stylesUrl, { cache: "no-store" }),
  ]);
  if (!testimonialsResponse.ok) throw new Error("Failed to load homepage testimonials");
  if (!faqResponse.ok) throw new Error("Failed to load homepage FAQ");
  if (!ideasResponse.ok) throw new Error("Failed to load homepage ideas");
  if (!blogResponse.ok) throw new Error("Failed to load homepage blog articles");
  if (!stylesResponse.ok) throw new Error("Failed to load homepage styles");
  const testimonialsPayload = (await testimonialsResponse.json()) as { data: HomepageTestimonialResponse[] };
  const faqPayload = (await faqResponse.json()) as { data: HomepageFaqResponse[] };
  const ideasPayload = (await ideasResponse.json()) as PublicIdeasListResponse;
  const blogPayload = (await blogResponse.json()) as PublicBlogListResponse;
  const stylesPayload = (await stylesResponse.json()) as PublicStylesListResponse;

  return (
    <MainPageClient
      stats={<StatsSection spacing="homepage" />}
      footer={<FooterSection />}
      promoBanner={<PromoBanner />}
      faq={<FAQSection items={faqPayload.data} />}
      finalCta={<FinalCTASection />}
      howItWorks={<HowItWorksSection />}
      hero={<HeroSection />}
      authOpen={authOpen}
      realism={<RealismSection spacing="homepage" />}
      popularIdeas={<PopularIdeasSection ideas={ideasPayload.data} />}
      styles={<StylesGridSection styles={stylesPayload.data} />}
      testimonials={<TestimonialsSection testimonials={testimonialsPayload.data} />}
      audience={<AudienceSection />}
      experience={<ExperienceSection articles={blogPayload.data} />}
    />
  );
}
