'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePublicAuth } from '@/components/auth/public-auth-provider';

type HeroCtaButtonBaseProps = {
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
};

type HeroCtaButtonAsLinkProps = HeroCtaButtonBaseProps & {
  href: string;
  onClick?: never;
  type?: never;
};

type HeroCtaButtonAsButtonProps = HeroCtaButtonBaseProps & {
  href?: undefined;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

export type HeroCtaButtonProps = HeroCtaButtonAsLinkProps | HeroCtaButtonAsButtonProps;

const baseClassName =
  'flex flex-row justify-center items-center h-[64px] px-5 py-[20px] gap-[10px] rounded-[64px] transition-all hover:scale-105 active:scale-95 shrink-0';

const primaryStyle = {
  background:
    'radial-gradient(60.25% 87.25% at 50% 100%, rgba(81, 197, 255, 0.5) 0%, rgba(81, 197, 255, 0) 100%), #1F93E6',
  backgroundBlendMode: 'color-dodge, normal' as const,
};

const secondaryStyle = {
  background:
    'radial-gradient(55.38% 100% at 50% 100%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(12px)',
};

const HeroCtaIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.50834 4.95205C8.91033 3.89777 10.3528 3.89777 10.7548 4.95205L11.8297 7.77135C11.9525 8.09323 12.1988 8.34802 12.51 8.47497L15.2356 9.58688C16.2548 10.0027 16.2548 11.4948 15.2356 11.9106L12.51 13.0225C12.1988 13.1494 11.9525 13.4042 11.8297 13.7261L10.7548 16.5454C10.3528 17.5997 8.91033 17.5997 8.50834 16.5454L7.43338 13.7261C7.31066 13.4042 7.06433 13.1494 6.75315 13.0225L4.02757 11.9106C3.00832 11.4948 3.00832 10.0027 4.02756 9.58688L6.75315 8.47497C7.06433 8.34802 7.31066 8.09323 7.43338 7.77135L8.50834 4.95205Z" fill="white" />
    <path d="M2.40805 0.672734C2.75006 -0.224245 3.97731 -0.224245 4.31932 0.672734L4.65277 1.54729C4.75719 1.82114 4.96676 2.03792 5.23151 2.14592L6.077 2.49084C6.94416 2.84461 6.94416 4.11405 6.077 4.46782L5.23151 4.81274C4.96676 4.92074 4.75719 5.13752 4.65277 5.41137L4.31932 6.28593C3.97731 7.1829 2.75006 7.1829 2.40805 6.28593L2.0746 5.41137C1.97018 5.13752 1.76061 4.92074 1.49586 4.81274L0.650374 4.46782C-0.216791 4.11405 -0.216791 2.84461 0.650374 2.49084L1.49586 2.14592C1.76061 2.03792 1.97018 1.82114 2.0746 1.54729L2.40805 0.672734Z" fill="white" />
    <path d="M3.07795 14.4117C3.27318 13.8997 3.97374 13.8997 4.16897 14.4117L4.35932 14.911C4.41892 15.0673 4.53855 15.191 4.68968 15.2527L5.17232 15.4496C5.66733 15.6515 5.66733 16.3762 5.17232 16.5781L4.68968 16.775C4.53855 16.8367 4.41892 16.9604 4.35932 17.1167L4.16897 17.616C3.97374 18.128 3.27318 18.128 3.07795 17.616L2.8876 17.1167C2.82799 16.9604 2.70836 16.8367 2.55723 16.775L2.0746 16.5781C1.57959 16.3762 1.57959 15.6515 2.0746 15.4496L2.55723 15.2527C2.70836 15.191 2.82799 15.0673 2.8876 14.911L3.07795 14.4117Z" fill="white" />
  </svg>
);

function normalizeHref(href: string): string {
  if (href.startsWith('/') || href.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(href)) {
    return href;
  }

  return `/${href}`;
}

export const HeroCtaButton = ({
  label,
  className,
  variant = "primary",
  ...props
}: HeroCtaButtonProps) => {
  const publicAuth = usePublicAuth();
  const content = (
    <>
      <div className="w-6 h-6 relative shrink-0">
        <HeroCtaIcon />
      </div>
      <span className="text-[18px] leading-6 font-bold text-white whitespace-nowrap">{label}</span>
    </>
  );

  if ('href' in props && props.href) {
    const href = normalizeHref(props.href);
    const isProtectedRoute = href.startsWith('/app/');

    if (isProtectedRoute && publicAuth) {
      return (
        <button
          type="button"
          onClick={() => publicAuth.navigateToProtected('/app/create')}
          className={cn(baseClassName, className)}
          style={variant === "primary" ? primaryStyle : secondaryStyle}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        href={href}
        className={cn(baseClassName, className)}
        style={variant === "primary" ? primaryStyle : secondaryStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      className={cn(baseClassName, className)}
      style={variant === "primary" ? primaryStyle : secondaryStyle}
    >
      {content}
    </button>
  );
};
