"use client";

import { useEffect } from 'react';

export function HeroPreload(): null {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/images/landing/hero/background.webp';
    link.type = 'image/webp';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
}
