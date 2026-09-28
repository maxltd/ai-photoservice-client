import type { HTMLAttributes } from "react";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

interface RichHtmlContentProps extends HTMLAttributes<HTMLDivElement> {
  html: string;
}

export function RichHtmlContent({ html, className, ...props }: RichHtmlContentProps) {
  const safeHtml = sanitizeHtml(html);

  return (
    <div
      {...props}
      className={cn(
        "rich-html-content text-sm leading-5 text-foreground md:text-base md:leading-6 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-4xl [&_h1]:font-medium [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-2xl [&_h3]:font-medium [&_h3]:leading-tight [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-xl [&_h4]:font-medium [&_h5]:mb-2 [&_h5]:mt-3 [&_h5]:text-lg [&_h5]:font-medium [&_h6]:mb-2 [&_h6]:mt-3 [&_h6]:text-base [&_h6]:font-medium [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary", 
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
