

import Link from 'next/link';
import { LogoNavbarIcon } from './icons';

// Social icons as inline SVGs (VK, Telegram, YouTube, Pinterest)
const VKIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.75 1.5H8.25C4.5 1.5 1.5 4.5 1.5 8.25V9.75C1.5 13.5 4.5 16.5 8.25 16.5H9.75C13.5 16.5 16.5 13.5 16.5 9.75V8.25C16.5 4.5 13.5 1.5 9.75 1.5Z" stroke="white" strokeOpacity="0.6" strokeWidth="1.5"/>
    <path d="M5 8.5C5 8.5 5.1 11.5 8.2 11.5H8.7V10.1C8.7 10.1 8.7 9.6 9.1 9.6C9.5 9.6 10.6 11.5 11.4 11.5H13L11.5 9.2C11.5 9.2 11.2 8.7 11.5 8.5C11.8 8.3 13 8 13 6.5H11.5C11.5 6.5 11.5 7.5 10.3 7.5C9.1 7.5 9.1 6.5 9.1 6.5V5H7.5C7.5 5 5.5 5.1 5.5 7.5C5.5 7.5 5.5 7.5 5 8.5Z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM12.525 6.45L11.25 12.45C11.16 12.87 10.905 12.975 10.545 12.765L8.295 11.1L7.215 12.135C7.095 12.255 6.99 12.36 6.765 12.36L6.93 10.08L10.965 6.435C11.145 6.27 10.92 6.18 10.68 6.345L5.7 9.465L3.48 8.775C2.955 8.625 2.955 8.265 3.6 8.01L11.895 4.74C12.33 4.59 12.72 4.845 12.525 6.45Z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.08 5.565C15.885 4.86 15.345 4.305 14.655 4.11C13.395 3.75 9 3.75 9 3.75C9 3.75 4.605 3.75 3.345 4.11C2.655 4.305 2.115 4.86 1.92 5.565C1.5 6.825 1.5 9 1.5 9C1.5 9 1.5 11.175 1.92 12.435C2.115 13.14 2.655 13.695 3.345 13.89C4.605 14.25 9 14.25 9 14.25C9 14.25 13.395 14.25 14.655 13.89C15.345 13.695 15.885 13.14 16.08 12.435C16.5 11.175 16.5 9 16.5 9C16.5 9 16.5 6.825 16.08 5.565ZM7.5 11.25V6.75L11.25 9L7.5 11.25Z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 12.21 3.465 14.955 6.27 16.11C6.195 15.48 6.135 14.505 6.3 13.815C6.45 13.185 7.245 9.87 7.245 9.87C7.245 9.87 7.005 9.39 7.005 8.67C7.005 7.545 7.65 6.705 8.46 6.705C9.15 6.705 9.48 7.23 9.48 7.86C9.48 8.565 9.03 9.615 8.79 10.59C8.595 11.4 9.195 12.06 9.99 12.06C11.43 12.06 12.54 10.53 12.54 8.325C12.54 6.36 11.145 5.01 9.12 5.01C6.795 5.01 5.43 6.75 5.43 8.55C5.43 9.255 5.7 10.005 6.03 10.41C6.09 10.485 6.105 10.545 6.09 10.62C6.03 10.86 5.895 11.4 5.865 11.52C5.835 11.685 5.745 11.715 5.58 11.64C4.575 11.175 3.945 9.69 3.945 8.52C3.945 5.955 5.82 3.585 9.315 3.585C12.12 3.585 14.295 5.58 14.295 8.295C14.295 11.13 12.555 13.41 10.11 13.41C9.285 13.41 8.52 12.99 8.25 12.495L7.71 14.52C7.515 15.255 7.02 16.17 6.69 16.725C7.44 16.905 8.22 17.01 9 17.01C13.14 17.01 16.5 13.65 16.5 9.51C16.5 5.37 13.14 1.5 9 1.5Z" fill="white" fillOpacity="0.6"/>
  </svg>
);

const SOCIAL_LINKS = [
  { icon: VKIcon, label: 'VK', href: '#' },
  { icon: TelegramIcon, label: 'Telegram', href: '#' },
  { icon: YoutubeIcon, label: 'YouTube', href: '#' },
  { icon: PinterestIcon, label: 'Pinterest', href: '#' },
];

export type FooterActiveSection =
  | 'ai-tools'
  | 'create'
  | 'styles'
  | 'ideas'
  | 'blog'
  | 'prices';

type LinkItem = {
  text: string;
  href?: string;
  activeSection?: FooterActiveSection;
};

const FOOTER_LINKS: Array<{ title: string; links: LinkItem[] }> = [
  {
    title: 'Редактирование',
    links: [
      { text: 'Удаление и замена фона', href: '/ai-tools', activeSection: 'ai-tools' },
      { text: 'Улучшение качества изображения', href: '/ai-tools', activeSection: 'ai-tools' },
      { text: 'Добавление текста и стикеров', href: '/ai-tools', activeSection: 'ai-tools' },
      { text: 'Ретушь портретов', href: '/ai-tools', activeSection: 'ai-tools' },
      { text: 'Цветокоррекция и фильтры', href: '/ai-tools', activeSection: 'ai-tools' },
      { text: 'Создать по своему промпту', href: '/app/create', activeSection: 'create' },
    ],
  },
  {
    title: 'Изображение',
    links: [
      { text: 'Стили фотосессий', href: '/styles', activeSection: 'styles' },
      { text: 'Идеи фотосессий', href: '/ideas', activeSection: 'ideas' },
    ],
  },
  {
    title: 'Информация',
    links: [
      { text: 'Блог', href: '/blog', activeSection: 'blog' },
      { text: 'Цены', href: '/prices', activeSection: 'prices' },
    ],
  },
];

export const FooterSection = ({
  activeSection,
}: {
  activeSection?: FooterActiveSection;
}) => {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.06]">
      {/* Main footer content */}
      <div className="px-4 md:px-16 pt-16 md:pt-36 pb-6 md:pb-11">
        <div className="max-w-[1792px] mx-auto">

          {/* Top row: logo+desc+socials | nav columns */}
          <div className="flex flex-col md:flex-row md:items-start gap-16 md:gap-16">

            {/* Left: Logo + description + socials */}
            <div className="flex flex-col gap-6 md:w-[733px] shrink-0">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-[36px] h-[36px] md:w-[49px] md:h-[49px] flex items-center justify-center shrink-0">
                  <LogoNavbarIcon />
                </div>
                <span
                  className="text-[28px] md:text-[40px] font-semibold tracking-tight text-transparent bg-clip-text"
                  style={{
                    background: 'radial-gradient(100% 100% at 0% 0%, #30F9F2 0%, #843CFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Нейрофото
                </span>
              </Link>

              {/* Description */}
              <p className="text-[14px] leading-[20px] font-normal text-white/30 md:max-w-[733px]">
                Нейрофото уделяет особое внимание защите данных пользователей. Все загруженные изображения обрабатываются автоматически и не используются вне сервиса. Мы применяем современные подходы к безопасности и хранению данных, чтобы обеспечить стабильную и безопасную работу.
              </p>

              {/* Social icons */}
              <div className="flex flex-row items-center gap-2">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-2xl bg-black border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Nav columns */}
            <div className="flex flex-col md:flex-row gap-11 md:gap-11 flex-1">
              {FOOTER_LINKS.map((col) => (
                <div key={col.title} className="flex flex-col gap-4 flex-1">
                  {/* Column title - mobile: 16/500, desktop: 24/500 */}
                  <p className="text-[16px] md:text-[24px] font-medium leading-[24px] md:leading-[30px] tracking-[-0.02em] text-white/80">
                    {col.title}
                  </p>
                  {/* Column links */}
                  <ul className="flex flex-col gap-4">
                    {col.links.map((link) => {
                      const isActive = link.activeSection === activeSection;
                      const linkClassName = `text-[16px] md:text-[20px] font-normal md:font-medium leading-[24px] md:leading-[28px] transition-colors ${
                        isActive ? 'text-[#1F93E6]' : 'text-white/30'
                      }`;

                      return (
                        <li key={link.text}>
                          {link.href ? (
                            <a
                              href={link.href}
                              className={`${linkClassName} hover:text-white/60`}
                            >
                              {link.text}
                            </a>
                          ) : (
                            <span className={linkClassName}>{link.text}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] mt-10 md:mt-16 mb-6" />

          {/* Bottom row */}
          {/* Mobile: column layout */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0">

            {/* Left: legal links */}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-9 md:gap-y-3">
              <a href="/rules" className="text-[14px] leading-[20px] font-normal text-white/30 underline hover:text-white/50 transition-colors">
                Правила использования сервиса
              </a>
              <a href="/privacy-policy" className="text-[14px] leading-[20px] font-normal text-white/30 underline hover:text-white/50 transition-colors">
                Политика конфиденциальности
              </a>
              <a href="/personal-data-policy" className="text-[14px] leading-[20px] font-normal text-white/30 underline hover:text-white/50 transition-colors">
                Политика обработки персональных данных
              </a>
              <a href="/cookie-policy" className="text-[14px] leading-[20px] font-normal text-white/30 underline hover:text-white/50 transition-colors">
                Политика использования Cookie
              </a>
            </div>

            {/* Right: copyright + entity */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-9">
              <span className="text-[14px] leading-[20px] font-normal text-white/30">
                © 2026 Все права защищены, Нейрофото® | ИНН 773377651703
              </span>
              <span className="text-[14px] leading-[20px] font-normal text-white/30">
                ИП Шибаров Дмитрий Михайлович
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};