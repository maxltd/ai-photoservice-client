import Link from "next/link";
import type { AiToolPageCard } from "@/lib/api/contract";
import { AiToolCard } from "./AiToolCard";

export function AiToolsOtherTools({ tools }: { tools: AiToolPageCard[] }) {
  if (tools.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-[1792px] overflow-hidden px-4 pb-0 pt-16 md:px-16 md:pb-0 md:pt-36">
      <h2 className="text-center text-[32px] font-medium leading-9 text-white/80 md:text-[64px] md:leading-[64px]">
        Другие AI-инструменты
      </h2>
      <ul className="mx-auto mt-9 flex snap-x gap-3 overflow-x-auto pb-4 md:gap-12">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="w-[180px] shrink-0 snap-start md:w-[325px]"
          >
            <AiToolCard tool={tool} />
          </div>
        ))}
      </ul>
      <Link href="/ai-tools" className="mx-auto mt-8 block w-fit rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white">
        Все AI-инструменты
      </Link>
    </section>
  );
}
