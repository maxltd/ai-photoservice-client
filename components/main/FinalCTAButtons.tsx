"use client";

import { usePublicAuth } from '@/components/auth/public-auth-provider';
import { HeroSectionButtonIcon } from './icons';

export function FinalCTAButtons({ variant }: { variant: 'mobile' | 'desktop' }): React.JSX.Element {
  const publicAuth = usePublicAuth();
  const handleCreateClick = (): void => {
    publicAuth?.navigateToProtected('/app/create');
  };

  return (
    <>
      <button
        onClick={handleCreateClick}
        className={variant === 'mobile' ? 'flex flex-row justify-center items-center w-full h-[64px] px-5 gap-[10px] rounded-[64px] transition-all hover:scale-105 active:scale-95' : 'hidden'}
        style={{
          background: 'radial-gradient(60.25% 87.25% at 50% 100%, rgba(81, 197, 255, 0.5) 0%, rgba(81, 197, 255, 0) 100%), #1F93E6',
          backgroundBlendMode: 'color-dodge, normal',
        }}
      >
        <div className="w-6 h-6 relative shrink-0"><HeroSectionButtonIcon /></div>
        <span className="text-[18px] leading-6 font-bold text-white whitespace-nowrap">Создать нейрофото</span>
      </button>

      <button
        onClick={handleCreateClick}
        className={variant === 'desktop' ? 'flex flex-row justify-center items-center w-[278px] h-[64px] px-5 gap-[10px] rounded-[64px] transition-all hover:scale-105 active:scale-95' : 'hidden'}
        style={{
          background: 'radial-gradient(60.25% 87.25% at 50% 100%, rgba(81, 197, 255, 0.5) 0%, rgba(81, 197, 255, 0) 100%), #1F93E6',
          backgroundBlendMode: 'color-dodge, normal',
        }}
      >
        <div className="w-6 h-6 relative shrink-0"><HeroSectionButtonIcon /></div>
        <span className="text-[18px] leading-6 font-bold text-white whitespace-nowrap">Создать нейрофото</span>
      </button>
    </>
  );
}
