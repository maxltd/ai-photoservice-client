import type { AiToolPageCard } from "@/lib/api/contract";
import { AiToolCard } from "./AiToolCard";

export function AiToolsGroup({ tools }: { tools: AiToolPageCard[] }) {
  return (
    <ul
      className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4"
      aria-label="AI-инструменты"
    >
      {tools.map((tool) => (
        <AiToolCard key={tool.id} tool={tool} />
      ))}
    </ul>
  );
}
