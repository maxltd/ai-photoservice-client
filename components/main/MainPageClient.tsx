"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

import { MainPageContextProvider } from "./MainPageContext";
import { Navbar } from "./Navbar";



import { AIEditorSection } from "./AIEditor";




import { BenefitsSection } from "./Benefits";

import { LoginModal } from "@/components/auth/login-modal";

interface MainPageClientProps {
  stats: ReactNode;
  footer: ReactNode;
  promoBanner: ReactNode;
  faq: ReactNode;
  finalCta: ReactNode;
  howItWorks: ReactNode;
  hero: ReactNode;
  authOpen: boolean;
  realism: ReactNode;
  popularIdeas: ReactNode;
  testimonials: ReactNode;
  audience: ReactNode;
  experience: ReactNode;
  styles: ReactNode;
}

type SectionRef = HTMLDivElement | null;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(
  container: HTMLElement,
  targetY: number,
  duration = 900,
): Promise<void> {
  return new Promise((resolve) => {
    const startY = container.scrollTop;
    const diff = targetY - startY;
    if (Math.abs(diff) < 2) {
      resolve();
      return;
    }

    let startTime: number | null = null;

    function step(timestamp: number): void {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.scrollTop = startY + diff * easeInOutCubic(progress);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    window.requestAnimationFrame(step);
  });
}

export default function MainPageClient({
  stats,
  footer,
  promoBanner,
  faq,
  finalCta,
  howItWorks,
  hero,
  authOpen,
  realism,
  popularIdeas,
  testimonials,
  audience,
  experience,
  styles,
}: MainPageClientProps): React.JSX.Element {
  const [isLoginOpen, setIsLoginOpen] = useState(authOpen);
  const [activeSection, setActiveSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const sectionsRef = useRef<SectionRef[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const benefitsLockedRef = useRef(false);

  const setSectionRef = useCallback(
    (index: number) => (element: SectionRef): void => {
      if (element) sectionsRef.current[index] = element;
    },
    [],
  );

  const goToSection = useCallback(
    async (index: number): Promise<void> => {
      if (isTransitioning) return;
      if (index < 0 || index >= sectionsRef.current.length) return;
      const container = containerRef.current;
      const targetSection = sectionsRef.current[index];
      if (!container || !targetSection) return;

      setIsTransitioning(true);
      setActiveSection(index);
      await smoothScrollTo(container, targetSection.offsetTop);
      setIsTransitioning(false);
    },
    [isTransitioning],
  );

  useEffect(() => {
    if (window.location.hash !== '#reviews') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      void goToSection(8);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [goToSection]);


  return (
    <MainPageContextProvider
      value={{
        goToSection: (index) => void goToSection(index),
        closeBanner: () => setIsBannerVisible(false),
        openLogin: () => setIsLoginOpen(true),
      }}
    >
      <div className="relative bg-[--color-background] text-white">
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
        }
      `}</style>

      {isBannerVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
          {promoBanner}
        </div>
      )}

      <Navbar
        onNavigate={goToSection}
        activeSection={activeSection}
        isBannerVisible={isBannerVisible}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: "auto" }}
      >
        <div ref={setSectionRef(0)}>{hero}</div>
        <div ref={setSectionRef(1)}>{howItWorks}</div>
        <div ref={setSectionRef(2)}>{popularIdeas}</div>
        <div ref={setSectionRef(3)}>{stats}</div>
        <div ref={setSectionRef(4)}>{styles}</div>
        <div ref={setSectionRef(5)}><AIEditorSection /></div>
        <div ref={setSectionRef(6)}>{realism}</div>
        <div ref={setSectionRef(7)}>
          <BenefitsSection onNavigate={goToSection} benefitsLockedRef={benefitsLockedRef} />
        </div>
        <div ref={setSectionRef(8)}>{testimonials}</div>
        <div ref={setSectionRef(9)}>{audience}</div>
        <div ref={setSectionRef(10)}>{faq}</div>
        <div ref={setSectionRef(11)}>{experience}</div>
        <div ref={setSectionRef(12)}>{finalCta}</div>
        <div ref={setSectionRef(13)}>{footer}</div>
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </MainPageContextProvider>
  );
}
