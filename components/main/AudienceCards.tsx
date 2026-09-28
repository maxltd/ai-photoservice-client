'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { usePublicAuth } from '@/components/auth/public-auth-provider';

const AUDIENCE_DATA = [
  { id: 1, image: '/images/landing/audience/1.webp', title: 'Блогеров и SMM‑специалистов', subtitle: 'Креативы, баннеры, обложки', gradient: 'linear-gradient(180deg, rgba(16, 16, 16, 0) 40%, rgba(16, 16, 16, 0.85) 100%)' },
  { id: 2, image: '/images/landing/audience/2.webp', title: 'Фотографов', subtitle: 'Быстрая ретушь и творческие эксперименты', gradient: 'linear-gradient(180deg, rgba(16, 16, 16, 0) 40%, rgba(16, 16, 16, 0.85) 100%)' },
  { id: 3, image: '/images/landing/audience/3.webp', title: 'Маркетологов и дизайнеров', subtitle: 'Креативы, баннеры, обложки', gradient: 'linear-gradient(180deg, rgba(16, 16, 16, 0) 40%, rgba(16, 16, 16, 0.85) 100%)' },
  { id: 4, image: '/images/landing/audience/4.webp', title: 'Всех, кто хочет красивые фото', subtitle: 'Семейные альбомы, аватарки, подарки', gradient: 'linear-gradient(180deg, rgba(16, 16, 16, 0) 40%, rgba(16, 16, 16, 0.85) 100%)' },
] as const;

function CTAButton({ className = '' }: { className?: string }): React.JSX.Element {
  const publicAuth = usePublicAuth();
  const handleCreateClick = (): void => {
    publicAuth?.navigateToProtected('/app/create');
  };

  return <button className={`flex flex-row justify-center items-center h-16 px-5 py-5 gap-2.5 rounded-[64px] ${className}`} style={{ background: 'radial-gradient(60.25% 87.25% at 50% 100%, rgba(81, 197, 255, 0.5) 0%, rgba(81, 197, 255, 0) 100%), #1F93E6', backgroundBlendMode: 'color-dodge, normal' }} onClick={handleCreateClick}><Sparkles className="w-6 h-6 text-white flex-shrink-0" /><span className="text-[18px] font-bold text-white leading-6">Создать нейрофото</span></button>;
}

export function AudienceCards(): React.JSX.Element {
  return (
    <>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex flex-row items-center justify-start md:justify-center gap-4 px-4 md:px-0 w-max md:w-full mx-auto" style={{ maxWidth: '1792px' }}>
          {AUDIENCE_DATA.map((item) => (
            <div key={item.id} className="flex-shrink-0 md:flex-1" style={{ width: '280px' }}>
              <div className="md:hidden relative overflow-hidden rounded-[16px] cursor-pointer group" style={{ width: '280px', height: '321px' }}>
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="280px" />
                <div className="absolute inset-0" style={{ background: item.gradient }} />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4 z-10"><h3 className="font-medium text-white/80" style={{ fontSize: '16px', lineHeight: '24px' }}>{item.title}</h3><p className="text-white/80 font-normal" style={{ fontSize: '14px', lineHeight: '20px' }}>{item.subtitle}</p></div>
              </div>
              <div className="hidden md:block relative overflow-hidden rounded-[36px] cursor-pointer group" style={{ width: '100%', height: '500px' }}>
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="436px" />
                <div className="absolute inset-0" style={{ background: item.gradient }} />
                <div className="absolute bottom-0 left-0 right-0 p-9 flex flex-col gap-4 z-10">
                  <div className="flex flex-col gap-2"><h3 className="font-medium text-white/80" style={{ fontSize: '24px', lineHeight: '30px', letterSpacing: '-0.02em' }}>{item.title}</h3><p className="text-white/80 font-medium" style={{ fontSize: '20px', lineHeight: '28px' }}>{item.subtitle}</p></div>
                  <CTAButton className="flex flex-row justify-center items-center gap-2.5 rounded-[64px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CTAButton className="hidden md:flex w-[278px] transition-all hover:scale-105 active:scale-95" />
    </>
  );
}
