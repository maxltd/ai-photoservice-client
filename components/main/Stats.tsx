

// Данные статистики (дублируем для бесконечной бегущей строки)
const STATS = [
  {
    value: '+50 000',
    label: 'Довольных пользователей',
    gradient: 'radial-gradient(100% 100% at 0% 0%, #F6F930 0%, #FF3C3C 100%)',
  },
  {
    value: '40 млн',
    label: 'Созданных ИИ-фотографий',
    gradient: 'radial-gradient(184.81% 312.33% at 0% 0%, #DE7CFF 0%, rgba(115, 44, 215, 0.8) 100%), radial-gradient(100% 100% at 0% 0%, #30F9F2 0%, #843CFF 100%)',
  },
  {
    value: '286',
    label: 'Готовых шаблонов для генерации фотосета',
    isPlain: true, // white-30
  },
];


// Один блок статистики
const StatItem = ({ stat }: { stat: typeof STATS[0] }) => (
  <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 pt-6 md:pt-12 border-t border-white/[0.08] min-w-[164px] md:min-w-[582px]">
    {/* Число */}
    {stat.isPlain ? (
      <span
        className="font-medium text-[40px] leading-[44px] tracking-[-0.02em] md:text-[144px] md:leading-[144px] md:tracking-[-0.04em] text-center"
        style={{ color: 'rgba(255, 255, 255, 0.3)' }}
      >
        {stat.value}
      </span>
    ) : (
      <span
        className="font-medium text-[40px] leading-[44px] tracking-[-0.02em] md:text-[144px] md:leading-[144px] md:tracking-[-0.04em] text-center bg-clip-text"
        style={{
          background: stat.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {stat.value}
      </span>
    )}

    {/* Подпись */}
    <span className="max-w-[164px] text-center text-[14px] font-normal leading-[20px] text-white/80 md:max-w-[427px] md:text-[20px] md:font-medium md:leading-[28px]">
      {stat.label}
    </span>
  </div>
);

export const StatsSection = ({ spacing = "content" }: { spacing?: "content" | "homepage" }) => {
  // Тройное дублирование для плавной бесконечной строки
  const repeated = [...STATS, ...STATS, ...STATS];

  return (
    <section className={`snap-section flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden px-4 md:gap-12 md:px-16 gap-12 ${spacing === "homepage" ? "py-16 md:py-[96px]" : "pb-0 pt-16 md:pb-0 md:pt-36"}`}>

      {/* Заголовок */}
      <div className="flex flex-row items-center gap-1 flex-shrink-0 whitespace-nowrap">
        {/* Логотип (inline SVG — такой же как в Hero) */}
        <div className="w-[36px] h-[36px] md:w-[60px] md:h-[60px] flex-shrink-0">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fillRule="evenodd" clipRule="evenodd" d="M30 2.5C42.9636 2.5 49.4444 2.50104 53.4717 6.52832C57.499 10.5556 57.5 17.0364 57.5 30C57.5 42.9636 57.499 49.4444 53.4717 53.4717C49.4444 57.499 42.9636 57.5 30 57.5C17.4421 57.5 10.9662 57.5005 6.91235 53.8396L6.52832 53.4717C2.50104 49.4444 2.5 42.9636 2.5 30C2.5 17.4421 2.49955 10.9662 6.1604 6.91235L6.52832 6.52832C10.5556 2.50104 17.0364 2.5 30 2.5ZM30 35.5C25.4437 35.5 21.75 39.1936 21.75 43.75C21.75 48.3064 25.4437 52 30 52C34.5564 52 38.25 48.3064 38.25 43.75C38.25 39.1936 34.5564 35.5 30 35.5ZM30 8C23.363 8 18.9384 8.01123 15.6458 8.45386C12.5113 8.87527 11.2384 9.59558 10.417 10.417C9.59558 11.2384 8.87527 12.5113 8.45386 15.6458C8.01123 18.9384 8 23.363 8 30C8 36.637 8.01123 41.0616 8.45386 44.3542C8.87527 47.4887 9.59558 48.7616 10.417 49.583C11.2384 50.4044 12.5113 51.1247 15.6458 51.5461C16.6152 51.6765 17.6831 51.7646 18.8765 51.8308C17.2256 49.5622 16.25 46.7704 16.25 43.75C16.25 36.1561 22.4061 30 30 30C37.5939 30 43.75 36.1561 43.75 43.75C43.75 46.771 42.7723 49.562 41.1208 51.8308C42.3153 51.7645 43.384 51.6766 44.3542 51.5461C47.4887 51.1247 48.7616 50.4044 49.583 49.583C50.4044 48.7616 51.1247 47.4887 51.5461 44.3542C51.9888 41.0616 52 36.637 52 30C52 23.363 51.9888 18.9384 51.5461 15.6458C51.1247 12.5113 50.4044 11.2384 49.583 10.417C48.7616 9.59558 47.4887 8.87527 44.3542 8.45386C41.0616 8.01123 36.637 8 30 8Z" fill="url(#stats_logo_grad)"/>
            <defs>
              <radialGradient id="stats_logo_grad" cx="0" cy="0" r="1" gradientTransform="matrix(57.5 57.5 -57.5 57.5 0 0)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#30F9F2"/>
                <stop offset="1" stopColor="#843CFF"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <span
          className="flex-shrink-0 whitespace-nowrap font-medium text-[40px] leading-[44px] tracking-[-0.02em] md:text-[72px] md:leading-[72px] md:tracking-[-0.04em] text-transparent bg-clip-text"
          style={{
            background: 'radial-gradient(100% 100% at 0% 0%, #30F9F2 0%, #843CFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Нейрофото
        </span>

        <span
          className="flex-shrink-0 whitespace-nowrap font-medium text-[40px] leading-[44px] tracking-[-0.02em] md:text-[72px] md:leading-[72px] md:tracking-[-0.04em] text-white/80"
        >
          &nbsp;— это
        </span>
      </div>

      {/* Бегущая строка со статистикой */}
      <div className="w-full overflow-hidden relative">
        {/* Градиентные маски по краям */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        {/* Бегущая строка */}
        <div className="animate-marquee flex flex-row items-start gap-0 w-max">
          {repeated.map((stat, i) => (
            <div key={i} className="flex flex-row items-start gap-6">
              <StatItem stat={stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};