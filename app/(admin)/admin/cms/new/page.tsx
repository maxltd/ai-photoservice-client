import { CreateCmsPageForm } from "@/components/admin/cms/CreateCmsPageForm";

interface CmsNewPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function CmsNewPage({ searchParams }: CmsNewPageProps) {
  const { type } = await searchParams;
  const isFaq = type === "faq";

  return (
    <div className="max-w-xl p-6">
      <CreateCmsPageForm isFaq={isFaq} />
    </div>
  );
}
