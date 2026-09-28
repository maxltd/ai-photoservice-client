"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/client";
import {
  API_ROUTES,
  PhotoSessionAudience,
  type CategoryResponse,
  type PhotoSessionListItemResponse,
  type PhotoSessionResponse,
} from "@/lib/api/contract";
import { cn } from "@/lib/utils";
import { SessionCard } from "@/components/sessions/SessionCard";
import { SessionGenerationForm } from "@/components/sessions/SessionGenerationForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SessionsCatalogClientProps {
  categories: CategoryResponse[];
  sessions: PhotoSessionListItemResponse[];
}

type AudienceTab = "ALL" | PhotoSessionAudience;

const AUDIENCE_TABS: Array<{ value: AudienceTab; label: string }> = [
  { value: "ALL", label: "Все" },
  { value: PhotoSessionAudience.FEMALE, label: "Женские" },
  { value: PhotoSessionAudience.MALE, label: "Мужские" },
  { value: PhotoSessionAudience.JOINT, label: "Совместные" },
  { value: PhotoSessionAudience.KIDS, label: "Детские" },
];

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 1023px)");

    const update = (): void => {
      setIsMobile(media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

function getAudience(
  session: PhotoSessionListItemResponse,
): PhotoSessionAudience | null {
  return session.audience ?? null;
}

function matchesAudience(
  session: PhotoSessionListItemResponse,
  activeAudience: AudienceTab,
): boolean {
  if (activeAudience === "ALL") {
    return true;
  }

  return getAudience(session) === activeAudience;
}

export function SessionsCatalogClient({
  categories,
  sessions,
}: SessionsCatalogClientProps) {
  const [activeAudience, setActiveAudience] = useState<AudienceTab>("ALL");
  const isMobile = useIsMobile();

  const [selectedSession, setSelectedSession] =
    useState<PhotoSessionResponse | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const previewStripRef = useRef<HTMLDivElement | null>(null);
  const previewDragStateRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const visibleSessions = useMemo(
    () => sessions.filter((session) => session.isVisible !== false),
    [sessions],
  );

  const filteredByAudience = useMemo(
    () =>
      visibleSessions.filter((session) =>
        matchesAudience(session, activeAudience),
      ),
    [activeAudience, visibleSessions],
  );

  const sections = useMemo(() => {
    const popularSection = {
      key: "popular",
      title: "Популярное тренды ⚡",
      sessions: filteredByAudience.filter((session) => session.popular),
      href: "/app/sessions/all",
    };

    const featuredSection = {
      key: "featured",
      title: "Для вас ❤️‍🔥",
      sessions: filteredByAudience.filter(
        (session) => session.featured && !session.popular,
      ),
      href: "/app/sessions/all",
    };

    const newestSection = {
      key: "newest",
      title: "Новинки 🆕",
      sessions: filteredByAudience.filter(
        (session) => !session.featured && !session.popular,
      ),
      href: "/app/sessions/all",
    };

    const categorySections = categories.map((category) => ({
      key: `category-${category.id}`,
      title: category.name,
      sessions: filteredByAudience.filter(
        (session) => session.categoryId === category.id,
      ),
      href: `/app/sessions/all?category=${category.slug}`,
    }));

    return [
      popularSection,
      featuredSection,
      newestSection,
      ...categorySections,
    ].filter((section) => section.sessions.length > 0);
  }, [categories, filteredByAudience]);

  const slotPreviewUrls = useMemo(() => {
    if (!selectedSession) {
      return [] as string[];
    }

    return [...selectedSession.slots]
      .sort((a, b) => a.order - b.order)
      .map((slot) => slot.previewUrl)
      .filter(
        (url): url is string => typeof url === "string" && url.length > 0,
      );
  }, [selectedSession]);

  async function handleSessionOpen(
    session: PhotoSessionListItemResponse,
  ): Promise<void> {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsPreviewOpen(true);
    setIsCreateOpen(false);
    setIsSessionLoading(true);
    setSessionLoadError(null);
    setSelectedSession(null);

    try {
      const payload = await apiGet<{ data: PhotoSessionResponse }>(
        API_ROUTES.PHOTO_SESSION_BY_SLUG(session.slug),
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      setSelectedSession(payload.data);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setSessionLoadError("Не удалось загрузить фотосессию");
      toast.error("Не удалось загрузить фотосессию");
    } finally {
      if (requestIdRef.current === requestId) {
        setIsSessionLoading(false);
      }
    }
  }

  function closeAllModals(): void {
    setIsPreviewOpen(false);
    setIsCreateOpen(false);
  }

  function openCreateModal(): void {
    setIsPreviewOpen(false);
    setIsCreateOpen(true);
  }

  function handlePreviewMouseDown(event: MouseEvent<HTMLDivElement>): void {
    const node = previewStripRef.current;

    if (!node) {
      return;
    }

    previewDragStateRef.current = {
      isDown: true,
      startX: event.pageX,
      startScrollLeft: node.scrollLeft,
    };
  }

  function handlePreviewMouseMove(event: MouseEvent<HTMLDivElement>): void {
    const node = previewStripRef.current;
    const drag = previewDragStateRef.current;

    if (!node || !drag.isDown) {
      return;
    }

    const walk = event.pageX - drag.startX;
    node.scrollLeft = drag.startScrollLeft - walk;
  }

  function handlePreviewMouseUp(): void {
    previewDragStateRef.current.isDown = false;
  }

  const previewContent = (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#141414_0%,#050505_100%)] text-white">
      <button
        type="button"
        onClick={closeAllModals}
        aria-label="Закрыть модальное окно фотосессии"
        className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white"
      >
        <X className="h-4 w-4" />
      </button>

      {isSessionLoading ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-[--color-foreground-muted]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка фотосессии
        </div>
      ) : null}

      {!isSessionLoading && sessionLoadError ? (
        <div className="p-4 text-sm text-[--color-foreground-muted]">
          {sessionLoadError}
        </div>
      ) : null}

      {!isSessionLoading && !sessionLoadError && selectedSession ? (
        <div className="px-3 pb-3 pt-4 md:px-8 md:pb-8 md:pt-7">
          <div className="mb-3 text-center md:mb-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/4 px-2 py-[3px] text-[11px] text-white/85">
              {selectedSession.slots.length} фото
            </span>
            <h2 className="mt-2 text-[28px] font-semibold leading-[112%] md:text-[24px]">
              {selectedSession.title}
            </h2>
            <p className="mt-2 text-sm text-white/75 md:text-[18px] md:leading-[112%]">
              {selectedSession.description}
            </p>
          </div>

          <div
            ref={previewStripRef}
            onMouseDown={handlePreviewMouseDown}
            onMouseMove={handlePreviewMouseMove}
            onMouseUp={handlePreviewMouseUp}
            onMouseLeave={handlePreviewMouseUp}
            className="scrollbar-hide flex cursor-grab gap-2 overflow-x-auto overflow-y-hidden pb-1 active:cursor-grabbing"
          >
            {slotPreviewUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-[12px]",
                  isMobile ? "h-[232px] w-[164px]" : "h-[453px] w-[320px]",
                )}
              >
                <Image
                  src={url}
                  alt={`${selectedSession.title} — фото ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes={isMobile ? "164px" : "320px"}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={openCreateModal}
              className="h-[52px] rounded-[16px] border-0 bg-[image:var(--gradient-create-cta)] px-8 text-[15px] font-semibold text-white"
            >
              Создать фотосессию
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <section className="w-full overflow-x-hidden pb-24 lg:pb-8">
        <div className="mx-auto w-full max-w-[1556px]">
          <div className="px-3 pt-2 md:px-7 md:pt-5">
            <div className="scrollbar-hide overflow-x-auto pb-1">
              <div className="inline-flex h-[37px] min-w-max rounded-full bg-[--color-background] p-[2px] md:h-[42px] md:p-1">
                {AUDIENCE_TABS.map((tab) => {
                  const active = activeAudience === tab.value;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveAudience(tab.value)}
                      className={cn(
                        "inline-flex h-[33px] items-center justify-center rounded-full px-3 text-[15px] font-semibold transition-colors md:h-[34px] md:px-[18px]",
                        active
                          ? "bg-white text-[color:var(--color-background)]"
                          : "text-white/50 hover:text-white/75",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 h-px w-full bg-white/8 md:mt-5" />
          </div>

          <div className="mt-3 rounded-t-[24px] bg-[--color-surface] px-3 pb-24 pt-5 md:mt-0 md:rounded-t-[32px] md:px-7 md:pb-8 md:pt-5">
            {sections.length === 0 ? (
              <div className="rounded-[--radius-lg] border border-white/8 bg-[--color-background] p-4 text-sm text-[--color-foreground-muted]">
                По выбранному фильтру пока нет фотосессий
              </div>
            ) : (
              <div className="space-y-6 md:space-y-7">
                {sections.map((section) => (
                  <section key={section.key} className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-[15px] font-medium leading-[116%] text-white/75 md:text-[20px] md:font-semibold md:leading-[112%]">
                        {section.title}
                      </h2>
                      <Link
                        href={section.href}
                        className="text-[11px] text-white/45 transition hover:text-white/75 md:hidden"
                      >
                        Смотреть все
                      </Link>
                    </div>

                    <div className="scrollbar-hide flex gap-2 overflow-x-auto overflow-y-hidden touch-pan-y pb-1 md:gap-3">
                      {section.sessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          onOpen={(item) => void handleSessionOpen(item)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {isMobile ? (
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <SheetContent
            side="bottom"
            className="overflow-hidden rounded-t-[26px] border-white/10 bg-transparent p-0 text-white [&>button:last-child]:hidden"
          >
            {previewContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-[720px] overflow-hidden border-0 bg-transparent p-0 text-white shadow-none [&>button:last-child]:hidden">
            {previewContent}
          </DialogContent>
        </Dialog>
      )}

      {selectedSession ? (
        isMobile ? (
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetContent
              side="bottom"
              className="overflow-hidden rounded-t-[26px] border-white/10 bg-[--color-background] p-0 text-white [&>button:last-child]:hidden"
            >
              <SessionGenerationForm
                session={selectedSession}
                inModal
                onClose={closeAllModals}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-[520px] overflow-hidden rounded-[24px] border-white/10 bg-[--color-background] p-0 text-white [&>button:last-child]:hidden">
              <SessionGenerationForm
                session={selectedSession}
                inModal
                onClose={closeAllModals}
              />
            </DialogContent>
          </Dialog>
        )
      ) : null}
    </>
  );
}
