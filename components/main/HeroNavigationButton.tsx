"use client";

import { HeroCtaButton } from '@/components/ui/HeroCtaButton';
export function HeroNavigationButton({ className }: { className: string }): React.JSX.Element {
  return (
    <HeroCtaButton
      href="/app/create"
      label="Создать нейрофото"
      className={className}
    />
  );
}
