import type { PhotoSessionIdeaCard } from "@/lib/api/contract";
import { PopularIdeasCarousel } from "./PopularIdeasCarousel";

export const PopularIdeasSection = ({
  ideas,
}: {
  ideas: PhotoSessionIdeaCard[];
}): React.JSX.Element => {
  return (
    <section className="relative isolate w-full overflow-hidden rounded-[24px] bg-page-surface px-4 pb-0 pt-16 md:rounded-[60px] md:px-16 md:pb-0 md:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-[341px] h-[200px] w-[200px] -translate-x-1/2 rounded-2xl bg-gradient-idea-section-glow opacity-60 blur-[100px] md:h-[480px] md:w-[480px]" />
      <div className="pointer-events-none absolute left-0 top-0 h-[839px] w-full bg-gradient-idea-section-overlay opacity-20 md:h-[950px]" />
      <div className="relative z-10 mx-auto flex max-w-[343px] flex-col items-center gap-4 md:max-w-[1792px] md:gap-[60px]">
        <div className="flex max-w-[1200px] flex-col items-center gap-4 md:gap-9">
          <div className="flex flex-row flex-wrap items-start justify-center gap-x-2">
            <span className="text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">Популярные</span>
            <div className="h-9 w-9 md:h-[60px] md:w-[60px]">
              <svg viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28.75 1.875C28.75 0.839466 27.9105 0 26.875 0C25.8395 0 25 0.839466 25 1.875V9.375C25 10.4105 25.8395 11.25 26.875 11.25C27.9105 11.25 28.75 10.4105 28.75 9.375V1.875Z" fill="url(#popular_grad_0)" />
                <path fillRule="evenodd" clipRule="evenodd" d="M1.875 50H6.875V36.875C6.875 25.8293 15.8293 16.875 26.875 16.875C37.9207 16.875 46.875 25.8293 46.875 36.875V50H51.875C52.9105 50 53.75 50.8395 53.75 51.875C53.75 52.9105 52.9105 53.75 51.875 53.75H1.875C0.839466 53.75 0 52.9105 0 51.875C0 50.8395 0.839466 50 1.875 50ZM28.75 43.8733C29.8709 43.2249 30.625 42.013 30.625 40.625C30.625 38.5539 28.9461 36.875 26.875 36.875C24.8039 36.875 23.125 38.5539 23.125 40.625C23.125 42.013 23.8791 43.2249 25 43.8733V50H28.75V43.8733ZM30.8633 24.9215C31.2519 23.9616 32.345 23.4984 33.3048 23.887C36.2823 25.0922 38.6572 27.4672 39.8624 30.4446C40.251 31.4045 39.7878 32.4976 38.8279 32.8861C37.8681 33.2747 36.775 32.8115 36.3864 31.8516C35.5622 29.8156 33.9339 28.1872 31.8978 27.363C30.9379 26.9745 30.4748 25.8813 30.8633 24.9215Z" fill="url(#popular_grad_1)" />
                <path d="M50.7008 10.5492C51.4331 11.2814 51.4331 12.4686 50.7008 13.2008L46.9508 16.9508C46.2186 17.6831 45.0314 17.6831 44.2992 16.9508C43.5669 16.2186 43.5669 15.0314 44.2992 14.2992L48.0492 10.5492C48.7814 9.81694 49.9686 9.81694 50.7008 10.5492Z" fill="url(#popular_grad_2)" />
                <path d="M5.70083 10.5492C4.96859 9.81694 3.78141 9.81694 3.04917 10.5492C2.31694 11.2814 2.31694 12.4686 3.04917 13.2008L6.79917 16.9508C7.53141 17.6831 8.71859 17.6831 9.45083 16.9508C10.1831 16.2186 10.1831 15.0314 9.45083 14.2992L5.70083 10.5492Z" fill="url(#popular_grad_3)" />
                <defs>
                  <radialGradient id="popular_grad_0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(76.014)"><stop stopColor="#30F9F2" /><stop offset="1" stopColor="#843CFF" /></radialGradient>
                  <radialGradient id="popular_grad_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(76.014)"><stop stopColor="#30F9F2" /><stop offset="1" stopColor="#843CFF" /></radialGradient>
                  <radialGradient id="popular_grad_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(76.014)"><stop stopColor="#30F9F2" /><stop offset="1" stopColor="#843CFF" /></radialGradient>
                  <radialGradient id="popular_grad_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(45) scale(76.014)"><stop stopColor="#30F9F2" /><stop offset="1" stopColor="#843CFF" /></radialGradient>
                </defs>
              </svg>
            </div>
            <span className="bg-gradient-idea-title bg-clip-text text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-transparent md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">идеи</span>
          </div>
          <span className="text-center text-[32px] font-medium leading-9 tracking-[-0.02em] text-white/80 md:text-[64px] md:leading-[64px] md:tracking-[-0.04em]">для вашей ИИ фотосессии</span>
          <p className="max-w-[800px] text-center text-base font-normal leading-6 text-white/80 md:text-xl md:font-medium md:leading-7">Выбирайте из сотен готовых образов или создайте свой за минуту</p>
        </div>
        <PopularIdeasCarousel ideas={ideas} />
      </div>
    </section>
  );
};
