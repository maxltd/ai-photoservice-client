
import { ScrollAcceleratedScatter } from './ScrollAcceleratedScatter';
import { MobileImagesStrip } from './MobileImagesStrip';
import { SocialProof } from './SocialProof';
import { HeroNavigationButton } from './HeroNavigationButton';
import { HeroPreload } from './HeroPreload';

export const HeroSection = (): React.JSX.Element => {
  return (
    <section
      className="hero-background snap-section relative w-full min-h-screen bg-[#0a0a0a] bg-no-repeat overflow-hidden flex flex-col items-center justify-center px-4 md:px-16 pt-28 md:pt-0 pb-6 md:pb-0"
      style={{
        backgroundImage: "url('/images/landing/hero/background.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <style>{`
        .hero-background {
          background-size: 170% auto;
          background-position: 50% 50%;
        }

        @media (min-width: 768px) {
          .hero-background {
            background-size: cover;
            background-position: center;
          }
        }

        .hero-brand-title {
          width: 439px;
          height: 72px;
        }

        @media (max-width: 767px) {
          .hero-brand-title {
            width: 243px;
            height: 40px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-brand-gradient-animation {
            display: none;
          }
        }
      `}</style>
      <HeroPreload />

      <div className="absolute inset-0 z-0 pointer-events-none bg-black/40" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="hidden md:block absolute inset-0 z-0 pointer-events-none">
        <ScrollAcceleratedScatter />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 pt-8 md:pt-0 pb-8">
        <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
          <div className="order-1 w-full">
            <MobileImagesStrip />
          </div>

          <SocialProof
            className="order-5 md:order-1 mx-auto"
            text="Более 10 000+ пользователей уже создали свои нейрофото"
            rating="4.8"
          />

          <div className="order-2 md:order-3 flex flex-col items-center w-full gap-0">
            <h2 className="flex h-auto w-full items-center justify-center" aria-label="Нейрофото">
              <svg
                className="hero-brand-title"
                viewBox="0 0 439 72"
                role="img"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="hero-brand-gradient" x1="-439" y1="36" x2="439" y2="36" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
                    <stop stopColor="#30F9F2" />
                    <stop offset="0.5" stopColor="#843CFF" />
                    <stop offset="1" stopColor="#30F9F2" />
                    <animateTransform
                      className="hero-brand-gradient-animation"
                      attributeName="gradientTransform"
                      type="translate"
                      from="-439 0"
                      to="439 0"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                  <mask id="hero-brand-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="439" height="72">
                    <rect width="439" height="72" fill="black" />
                    <path
                      fill="white"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M30 2.5C42.9636 2.5 49.4444 2.50104 53.4717 6.52832C57.499 10.5556 57.5 17.0364 57.5 30C57.5 42.9636 57.499 49.4444 53.4717 53.4717C49.4444 57.499 42.9636 57.5 30 57.5C17.4421 57.5 10.9662 57.5005 6.91235 53.8396L6.52832 53.4717C2.50104 49.4444 2.5 42.9636 2.5 30C2.5 17.4421 2.49955 10.9662 6.1604 6.91235L6.52832 6.52832C10.5556 2.50104 17.0364 2.5 30 2.5ZM30 35.5C25.4437 35.5 21.75 39.1936 21.75 43.75C21.75 48.3064 25.4437 52 30 52C34.5564 52 38.25 48.3064 38.25 43.75C38.25 39.1936 34.5564 35.5 30 35.5ZM30 8C23.363 8 18.9384 8.01123 15.6458 8.45386C12.5113 8.87527 11.2384 9.59558 10.417 10.417C9.59558 11.2384 8.87527 12.5113 8.45386 15.6458C8.01123 18.9384 8 23.363 8 30C8 36.637 8.01123 41.0616 8.45386 44.3542C8.87527 47.4887 9.59558 48.7616 10.417 49.583C11.2384 50.4044 12.5113 51.1247 15.6458 51.5461C16.6152 51.6765 17.6831 51.7646 18.8765 51.8308C17.2256 49.5622 16.25 46.7704 16.25 43.75C16.25 36.1561 22.4061 30 30 30C37.5939 30 43.75 36.1561 43.75 43.75C43.75 46.771 42.7723 49.562 41.1208 51.8308C42.3153 51.7645 43.384 51.6766 44.3542 51.5461C47.4887 51.1247 48.7616 50.4047 49.583 49.583C50.4044 48.7616 51.1247 47.4887 51.5461 44.3542C51.9888 41.0616 52 36.637 52 30C52 23.363 51.9888 18.9384 51.5461 15.6458C51.1247 12.5113 50.4044 11.2384 49.583 10.417C48.7616 9.59558 47.4887 8.87527 44.3542 8.45386C41.0616 8.01123 36.637 8 30 8Z"
                    />
                    <text x="64" y="57" fill="white" fontFamily="var(--font-onest), sans-serif" fontSize="72" fontWeight="500" letterSpacing="-2.88">Нейрофото</text>
                  </mask>
                </defs>
                <rect width="439" height="72" fill="url(#hero-brand-gradient)" mask="url(#hero-brand-mask)" />
              </svg>
              <span className="sr-only">Нейрофото</span>
            </h2>
            <h1 className="w-full text-[40px] md:text-[72px] leading-[44px] md:leading-[72px] font-medium text-center tracking-[-0.02em] md:tracking-[-0.04em] text-white/80">
              Твои фото. По‑новому.
            </h1>
          </div>

          <p className="order-3 md:order-4 w-full max-w-[260px] md:max-w-[884px] text-[12px] md:text-[20px] leading-[18px] md:leading-[28px] font-normal md:font-medium text-center text-white/80">
            Генерируйте реалистичные фотосессии с собой, удаляйте фон, улучшайте качество и ретушируйте портреты за минуты. Бесплатно онлайн.
          </p>

          <HeroNavigationButton className="order-4 md:order-5 w-[343px] md:w-[278px]" />
        </div>
      </div>
    </section>
  );
};
