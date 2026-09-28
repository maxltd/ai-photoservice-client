'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  API_ROUTES,
  type PhotoSessionIdeaCard,
  type PhotoSessionIdeaMenuCategory,
  type PhotoSessionStyleCard,
  type PhotoSessionStyleMenuCategory,
  type PublicIdeasListResponse,
  type PublicStylesListResponse,
} from '@/lib/api/contract';
import { apiGet } from '@/lib/api/client';
import { useSession } from '@/lib/auth-client';
import { NAV_LINKS } from './constants';
import { LogoNavbarIcon } from './icons';

interface NavbarProps {
  onNavigate: (index: number) => void;
  activeSection: number;
  isBannerVisible: boolean;
  onLoginClick: () => void;
}

type MenuPanel = 'ideas' | 'styles' | null;
type MobilePanel = 'main' | 'ideas' | 'ideaItems' | 'styles' | 'styleItems';
type MenuItem = Pick<PhotoSessionIdeaCard, 'id' | 'title' | 'href' | 'categoryId'>;
type StyleMenuItem = Pick<PhotoSessionStyleCard, 'id' | 'title' | 'href' | 'categoryId'>;

const ALL_IDEAS_CATEGORY_ID = 'all-ideas';
const ALL_STYLES_CATEGORY_ID = 'all-styles';

function MenuList({
  items,
  onSelect,
}: {
  items: MenuItem[];
  onSelect?: () => void;
}): React.JSX.Element {
  if (items.length === 0) {
    return <p className="py-2 text-sm text-foreground-muted">Пункты меню пока не добавлены</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onSelect}
          className="rounded-md px-1 py-2 text-left text-sm font-medium leading-6 text-foreground/80 transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary md:text-base md:leading-6"
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}

function SocialMenu(): React.JSX.Element {
  const items = [
    { label: 'VK', mark: 'VK' },
    { label: 'Telegram', mark: '➤' },
    { label: 'YouTube', mark: '▶' },
    { label: 'Pinterest', mark: 'P' },
  ];

  return (
    <div className="flex items-center gap-2 px-4 pb-4 md:hidden" aria-label="Социальные сети">
      {items.map((item) => (
        <a
          key={item.label}
          href="#"
          aria-label={item.label}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-[10px] font-semibold text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {item.mark}
        </a>
      ))}
    </div>
  );
}

export const Navbar = ({
  onNavigate,
  activeSection,
  isBannerVisible,
  onLoginClick,
}: NavbarProps): React.JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [desktopPanel, setDesktopPanel] = useState<MenuPanel>(null);
  const [desktopPanelVisible, setDesktopPanelVisible] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('main');
  const navbarRef = useRef<HTMLElement>(null);
  const mobileCloseTimeoutRef = useRef<number | null>(null);
  const desktopCloseTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [ideas, setIdeas] = useState<MenuItem[]>([]);
  const [ideaCategories, setIdeaCategories] = useState<PhotoSessionIdeaMenuCategory[]>([]);
  const [styles, setStyles] = useState<StyleMenuItem[]>([]);
  const [styleCategories, setStyleCategories] = useState<PhotoSessionStyleMenuCategory[]>([]);
  const [selectedIdeaCategoryId, setSelectedIdeaCategoryId] = useState(ALL_IDEAS_CATEGORY_ID);
  const [selectedStyleCategoryId, setSelectedStyleCategoryId] = useState(ALL_STYLES_CATEGORY_ID);
  const [isLoading, setIsLoading] = useState(false);

  const clearAnimationTimers = useCallback((): void => {
    if (mobileCloseTimeoutRef.current !== null) {
      window.clearTimeout(mobileCloseTimeoutRef.current);
      mobileCloseTimeoutRef.current = null;
    }

    if (desktopCloseTimeoutRef.current !== null) {
      window.clearTimeout(desktopCloseTimeoutRef.current);
      desktopCloseTimeoutRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const closeDesktopPanel = useCallback((): void => {
    if (!desktopPanel) {
      return;
    }

    setDesktopPanelVisible(false);
    if (desktopCloseTimeoutRef.current !== null) {
      window.clearTimeout(desktopCloseTimeoutRef.current);
    }
    desktopCloseTimeoutRef.current = window.setTimeout(() => {
      setDesktopPanel(null);
      desktopCloseTimeoutRef.current = null;
    }, 300);
  }, [desktopPanel]);

  const openMobileMenu = useCallback((): void => {
    clearAnimationTimers();
    setMobileMenuOpen(true);
    setMobileMenuVisible(false);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setMobileMenuVisible(true);
      animationFrameRef.current = null;
    });
  }, [clearAnimationTimers]);

  const closeMobileMenu = useCallback((): void => {
    setMobileMenuVisible(false);
    if (mobileCloseTimeoutRef.current !== null) {
      window.clearTimeout(mobileCloseTimeoutRef.current);
    }
    mobileCloseTimeoutRef.current = window.setTimeout(() => {
      setMobileMenuOpen(false);
      mobileCloseTimeoutRef.current = null;
    }, 300);
  }, []);

  const closeMenus = useCallback((): void => {
    closeDesktopPanel();
    closeMobileMenu();
    setMobilePanel('main');
  }, [closeDesktopPanel, closeMobileMenu]);

  useEffect(() => {
    if (!desktopPanel && (!mobileMenuOpen || mobilePanel === 'main')) {
      return;
    }

    const controller = new AbortController();

    const loadMenuItems = async (): Promise<void> => {
      try {
        const [ideasResponse, stylesResponse] = await Promise.all([
          apiGet<PublicIdeasListResponse>(API_ROUTES.PHOTO_SESSION_IDEAS, { showInMenu: true, pageSize: 100 }, { signal: controller.signal }),
          apiGet<PublicStylesListResponse>(API_ROUTES.PHOTO_SESSION_STYLES, { showInMenu: true, pageSize: 100 }, { signal: controller.signal }),
        ]);

        setIdeas(ideasResponse.data);
        setIdeaCategories(ideasResponse.categories);
        setStyles(stylesResponse.data);
        setStyleCategories(stylesResponse.categories);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setIdeas([]);
          setIdeaCategories([]);
          setStyles([]);
          setStyleCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadMenuItems();
    return () => controller.abort();
  }, [desktopPanel, mobileMenuOpen, mobilePanel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMenus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMenus]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      if (desktopPanel && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        closeDesktopPanel();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [desktopPanel, closeDesktopPanel]);

  useEffect(() => {
    return () => clearAnimationTimers();
  }, [clearAnimationTimers]);

  const handleAppEntry = (): void => {
    if (session.isPending) {
      return;
    }

    if (session.data?.user) {
      router.push('/app/create');
      return;
    }

    onLoginClick();
  };

  const navigateToSection = (index: number): void => {
    closeMenus();
    if (pathname === '/') {
      onNavigate(index);
      return;
    }

    router.push('/');
  };

  const handleSimpleNavigation = (label: string): void => {
    if (label === 'Отзывы') {
      closeMenus();
      if (pathname === '/') {
        onNavigate(8);
      } else {
        router.push('/#reviews');
      }
      return;
    }

    if (label === 'FAQ') {
      closeMenus();
      router.push('/faq');
      return;
    }

    if (label === 'Блог') {
      closeMenus();
      router.push('/blog');
      return;
    }

    if (label === 'Инструменты') {
      closeMenus();
      router.push('/ai-tools');
      return;
    }

    if (label === 'NanoBanana') {
      closeMenus();
      router.push('/nano-banana');
      return;
    }

    if (label === 'Идеи фотосессий') {
      navigateToSection(2);
    }
  };

  const toggleDesktopPanel = (panel: Exclude<MenuPanel, null>): void => {
    setIsLoading(true);
    if (desktopPanel === panel) {
      closeDesktopPanel();
      return;
    }

    clearAnimationTimers();
    setDesktopPanel(panel);
    setDesktopPanelVisible(false);
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setDesktopPanelVisible(true);
      animationFrameRef.current = null;
    });
  };

  const filteredIdeas = selectedIdeaCategoryId === ALL_IDEAS_CATEGORY_ID
    ? ideas
    : ideas.filter((idea) => idea.categoryId === selectedIdeaCategoryId);

  const filteredStyles = selectedStyleCategoryId === ALL_STYLES_CATEGORY_ID
    ? styles
    : styles.filter((style) => style.categoryId === selectedStyleCategoryId);

  const renderDesktopPanel = (): React.JSX.Element | null => {
    if (!desktopPanel) {
      return null;
    }

    if (desktopPanel === 'styles') {
      return (
        <div className={`absolute left-0 right-0 top-full z-50 mt-3 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-[24px] border border-border bg-background/95 p-6 backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out md:p-9 ${desktopPanelVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
          <h2 className="sr-only">Стили фотосессий</h2>
          {isLoading ? (
            <p className="text-sm text-foreground-muted">Загрузка...</p>
          ) : (
            <div className="flex gap-6">
              <div className="w-60 shrink-0 rounded-xl bg-surface p-2">
                <button
                  type="button"
                  onClick={() => setSelectedStyleCategoryId(ALL_STYLES_CATEGORY_ID)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedStyleCategoryId === ALL_STYLES_CATEGORY_ID ? 'bg-foreground/15 text-foreground' : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'}`}
                >
                  <span>Все стили</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
                {styleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedStyleCategoryId(category.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedStyleCategoryId === category.id ? 'bg-foreground/15 text-foreground' : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'}`}
                  >
                    <span>{category.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="mb-5 text-lg font-medium text-foreground md:text-xl">
                  {selectedStyleCategoryId === ALL_STYLES_CATEGORY_ID
                    ? 'Все стили'
                    : styleCategories.find((category) => category.id === selectedStyleCategoryId)?.name ?? 'Стили фотосессий'}
                </h2>
                <MenuList items={filteredStyles} onSelect={closeDesktopPanel} />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`absolute left-0 right-0 top-full z-50 mt-3 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-[24px] border border-border bg-background/95 p-6 backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out md:p-9 ${desktopPanelVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
        <h2 className="sr-only">Идеи фотосессий</h2>
        {isLoading ? (
          <p className="text-sm text-foreground-muted">Загрузка...</p>
        ) : (
          <div className="flex gap-6">
            <div className="w-60 shrink-0 rounded-xl bg-surface p-2">
              <button
                type="button"
                onClick={() => setSelectedIdeaCategoryId(ALL_IDEAS_CATEGORY_ID)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedIdeaCategoryId === ALL_IDEAS_CATEGORY_ID ? 'bg-foreground/15 text-foreground' : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'}`}
              >
                <span>Все идеи</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              {ideaCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedIdeaCategoryId(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${selectedIdeaCategoryId === category.id ? 'bg-foreground/15 text-foreground' : 'text-foreground/80 hover:bg-foreground/10 hover:text-foreground'}`}
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-5 text-lg font-medium text-foreground md:text-xl">
                {selectedIdeaCategoryId === ALL_IDEAS_CATEGORY_ID
                  ? 'Все идеи'
                  : ideaCategories.find((category) => category.id === selectedIdeaCategoryId)?.name ?? 'Идеи фотосессий'}
              </h2>
              <MenuList items={filteredIdeas} onSelect={closeDesktopPanel} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMobilePanel = (): React.JSX.Element => {
    if (mobilePanel === 'main') {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isNested = link.label === 'Идеи фотосессий' || link.label === 'Стили фотосессий';

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    if (link.label === 'Идеи фотосессий') {
                      setIsLoading(true);
                      setMobilePanel('ideas');
                    } else if (link.label === 'Стили фотосессий') {
                      setIsLoading(true);
                      setMobilePanel('styles');
                    } else {
                      handleSimpleNavigation(link.label);
                    }
                  }}
                  className="flex min-h-11 items-center justify-between rounded-md py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <span>{link.label}</span>
                  {isNested ? <ChevronRight className="h-4 w-4 text-foreground-muted" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (mobilePanel === 'ideas') {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <button
            type="button"
            onClick={() => setMobilePanel('main')}
            className="mb-4 flex min-h-11 items-center gap-2 border-b border-border pb-4 text-left text-lg font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Идеи фотосессий</span>
          </button>
          {isLoading ? (
            <p className="text-sm text-foreground-muted">Загрузка...</p>
          ) : (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedIdeaCategoryId(ALL_IDEAS_CATEGORY_ID);
                  setMobilePanel('ideaItems');
                }}
                className="flex min-h-11 items-center justify-between rounded-md py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <span>Все идеи</span>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </button>
              {ideaCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdeaCategoryId(category.id);
                    setMobilePanel('ideaItems');
                  }}
                  className="flex min-h-11 items-center justify-between rounded-md py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4 text-foreground-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (mobilePanel === 'ideaItems') {
      const selectedCategoryName = selectedIdeaCategoryId === ALL_IDEAS_CATEGORY_ID
        ? 'Все идеи'
        : ideaCategories.find((category) => category.id === selectedIdeaCategoryId)?.name ?? 'Идеи фотосессий';

      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <button
            type="button"
            onClick={() => setMobilePanel('ideas')}
            className="mb-4 flex min-h-11 items-center gap-2 border-b border-border pb-4 text-left text-lg font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{selectedCategoryName}</span>
          </button>
          <MenuList items={filteredIdeas} onSelect={closeMenus} />
        </div>
      );
    }

    if (mobilePanel === 'styles') {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <button
            type="button"
            onClick={() => setMobilePanel('main')}
            className="mb-4 flex min-h-11 items-center gap-2 border-b border-border pb-4 text-left text-lg font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Стили фотосессий</span>
          </button>
          {isLoading ? (
            <p className="text-sm text-foreground-muted">Загрузка...</p>
          ) : (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedStyleCategoryId(ALL_STYLES_CATEGORY_ID);
                  setMobilePanel('styleItems');
                }}
                className="flex min-h-11 items-center justify-between rounded-md py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <span>Все стили</span>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </button>
              {styleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedStyleCategoryId(category.id);
                    setMobilePanel('styleItems');
                  }}
                  className="flex min-h-11 items-center justify-between rounded-md py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4 text-foreground-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (mobilePanel === 'styleItems') {
      const selectedCategoryName = selectedStyleCategoryId === ALL_STYLES_CATEGORY_ID
        ? 'Все стили'
        : styleCategories.find((category) => category.id === selectedStyleCategoryId)?.name ?? 'Стили фотосессий';

      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <button
            type="button"
            onClick={() => setMobilePanel('styles')}
            className="mb-4 flex min-h-11 items-center gap-2 border-b border-border pb-4 text-left text-lg font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{selectedCategoryName}</span>
          </button>
          <MenuList items={filteredStyles} onSelect={closeMenus} />
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        <button
          type="button"
          onClick={() => setMobilePanel('main')}
          className="mb-4 flex min-h-11 items-center gap-2 border-b border-border pb-4 text-left text-lg font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Идеи фотосессий</span>
        </button>
        {isLoading ? <p className="text-sm text-foreground-muted">Загрузка...</p> : <MenuList items={ideas} onSelect={closeMenus} />}
      </div>
    );
  };

  return (
    <nav
      ref={navbarRef}
      className={`fixed inset-x-0 top-0 z-40 px-2 transition-transform duration-300 md:px-16 ${isBannerVisible ? 'translate-y-10 sm:translate-y-13' : ''}`}
      aria-label="Основная навигация"
    >
      <div className="relative mx-auto max-w-448">
        <div className="h-14 rounded-b-2xl border-b border-white/10 bg-white/8 px-3 backdrop-blur-xl md:h-19 md:rounded-[24px] md:border md:px-4">
          <div className="relative flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  closeDesktopPanel();
                  openMobileMenu();
                  setMobilePanel('main');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-foreground md:hidden"
                aria-label="Открыть меню"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  if (pathname === '/') {
                    onNavigate(0);
                  } else {
                    router.push('/');
                  }
                }}
                className="hidden items-center gap-2 text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary md:flex"
                aria-label="На главную"
              >
                <span className="flex h-7 w-7 items-center justify-center"><LogoNavbarIcon gradientId="navbar-desktop-logo-gradient" /></span>
                <span className="text-lg font-medium tracking-tight">Нейрофото</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  if (pathname === '/') {
                    onNavigate(0);
                  } else {
                    router.push('/');
                  }
                }}
                className="flex h-8 w-8 items-center justify-center md:hidden"
                aria-label="На главную"
              >
                <LogoNavbarIcon gradientId="navbar-mobile-closed-logo-gradient" />
              </button>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => {
                const panel = link.label === 'Идеи фотосессий' ? 'ideas' : link.label === 'Стили фотосессий' ? 'styles' : null;
                const isActive = link.index === activeSection;

                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => (panel ? toggleDesktopPanel(panel) : handleSimpleNavigation(link.label))}
                    aria-expanded={panel ? desktopPanel === panel : undefined}
                    className={`whitespace-nowrap text-sm font-medium leading-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary md:text-base ${isActive ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'}`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAppEntry}
                className="rounded-full bg-foreground/10 px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary md:px-4 md:py-3 md:text-sm"
              >
                В приложение
              </button>
            </div>


          </div>
        </div>
        {renderDesktopPanel()}
      </div>

      {mobileMenuOpen ? (
        <div className={`fixed inset-0 z-50 flex min-h-screen flex-col bg-background text-foreground transition-[opacity,transform] duration-300 ease-out md:hidden ${mobileMenuVisible ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'}`}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={closeMobileMenu} className="flex h-9 w-9 items-center justify-center rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" aria-label="Закрыть меню">
                <X className="h-4 w-4" />
              </button>
              <span className="flex h-8 w-8 items-center justify-center"><LogoNavbarIcon gradientId="navbar-mobile-open-logo-gradient" /></span>
            </div>
            <button type="button" onClick={() => { closeMenus(); handleAppEntry(); }} className="rounded-full bg-foreground/10 px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              В приложение
            </button>
          </div>
          {renderMobilePanel()}
          {mobilePanel === 'main' ? <SocialMenu /> : null}
        </div>
      ) : null}
    </nav>
  );
};
