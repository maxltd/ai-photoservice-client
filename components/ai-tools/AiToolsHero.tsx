export function AiToolsHero({
  h1,
  description,
}: {
  h1: string;
  description: string;
}) {
  return (
    <div>
      <nav
        className="flex items-center gap-4 text-xs leading-[18px] text-foreground/80"
        aria-label="Хлебные крошки"
      >
        <span>Главная</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
        <span>Инструменты</span>
      </nav>
      <div className="mt-6 flex flex-col gap-6 md:mt-9 md:gap-9">
        <h1 className="text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-foreground/80 md:text-[72px] md:leading-[72px] md:tracking-[-0.04em]">
          {h1}
        </h1>
        <p className="max-w-[1071px] text-sm font-normal leading-5 text-foreground/70 md:text-xl md:font-medium md:leading-7 md:text-foreground/80">
          {description}
        </p>
      </div>
    </div>
  );
}
