"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Copy,
  Gift,
  Loader2,
  LogOut,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  User,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import {
  API_ROUTES,
  ApiError,
  type GetMeResponse,
  type PaginationMeta,
  type TokenTransactionResponse,
  type UploadImageResponse,
} from "@/lib/api/contract";
import {
  useBillingPlans,
  useTopup,
  useTransactions,
} from "@/lib/hooks/billing/useBilling";
import { apiUpload } from "@/lib/api/client";
import {
  useAddAiProfilePhoto,
  useAiProfilePhotos,
  useMe,
  useRemoveAiProfilePhoto,
  useUpdateMe,
} from "@/lib/hooks/profile/useProfile";
import {
  readAiProfilePhotos,
  writeAiProfilePhotos,
} from "@/lib/profile/aiProfileStorage";
import { FeedbackSheet } from "@/components/feedback/FeedbackSheet";
import { TransactionRow } from "@/components/billing/TransactionRow";
import {
  PhotoUploadZone,
  type UploadedPhoto,
} from "@/components/create/PhotoUploadZone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AI_PROFILE_MIN_RECOMMENDED = 10;
const AI_PROFILE_MAX = 15;

type ProfileTabId =
  "overview" | "settings" | "account" | "ai-profile" | "support";

interface ProfileClientProps {
  initialUser: GetMeResponse;
}

interface ProfileTabItem {
  id: ProfileTabId;
  label: string;
}

interface ApiData<TData> {
  data: TData;
}

const PROFILE_TABS: ProfileTabItem[] = [
  { id: "overview", label: "Общая информация" },
  { id: "settings", label: "Настройки" },
  { id: "account", label: "Аккаунт" },
  { id: "ai-profile", label: "AI-профиль" },
  { id: "support", label: "Поддержка" },
];

const REFERRAL_REWARDS: Array<{ label: string; amount: number }> = [
  { label: "Пополнение на 30 токенов", amount: 10 },
  { label: "Пополнение на 100 токенов", amount: 40 },
  { label: "Пополнение на 200 токенов", amount: 60 },
  { label: "Пополнение на 500 токенов", amount: 100 },
  { label: "Пополнение на 1000 токенов", amount: 300 },
];

function TopupTicketIcon({
  className,
  color = "var(--color-token)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M22 10.75c.41 0 .75-.34.75-.75V9c0-4.41-1.34-5.75-5.75-5.75h-6.25V5.5c0 .41-.34.75-.75.75s-.75-.34-.75-.75V3.25H7C2.59 3.25 1.25 4.59 1.25 9v.5c0 .41.34.75.75.75.96 0 1.75.79 1.75 1.75S2.96 13.75 2 13.75c-.41 0-.75.34-.75.75v.5c0 4.41 1.34 5.75 5.75 5.75h2.25V18.5c0-.41.34-.75.75-.75s.75.34.75.75v2.25H17c4.41 0 5.75-1.34 5.75-5.75 0-.41-.34-.75-.75-.75-.96 0-1.75-.79-1.75-1.75s.79-1.75 1.75-1.75Zm-11.25 3.42c0 .41-.34.75-.75.75s-.75-.34-.75-.75V9.83c0-.41.34-.75.75-.75s.75.34.75.75v4.34Z"
        fill={color}
      />
    </svg>
  );
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const persistedUploadsRef = useRef<Set<string>>(new Set());
  const aiProfileMigrationRef = useRef(false);

  const meQuery = useMe(initialUser);
  const updateMeMutation = useUpdateMe();
  const aiProfilePhotosQuery = useAiProfilePhotos();
  const addAiProfilePhotoMutation = useAddAiProfilePhoto();
  const removeAiProfilePhotoMutation = useRemoveAiProfilePhoto();
  const billingPlansQuery = useBillingPlans();
  const topupMutation = useTopup();
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactions, setTransactions] = useState<TokenTransactionResponse[]>(
    [],
  );
  const [transactionMeta, setTransactionMeta] = useState<PaginationMeta | null>(
    null,
  );
  const loadedTransactionPagesRef = useRef<Set<number>>(new Set());
  const transactionsQuery = useTransactions(
    transactionPage,
    20,
    showTransactions,
  );
  const user = meQuery.data ?? initialUser;

  useEffect(() => {
    const result = transactionsQuery.data;
    if (!result || loadedTransactionPagesRef.current.has(transactionPage)) {
      return;
    }

    setTransactions((previous) =>
      transactionPage === 1 ? result.data : [...previous, ...result.data],
    );
    setTransactionMeta(result.meta);
    loadedTransactionPagesRef.current.add(transactionPage);
  }, [transactionPage, transactionsQuery.data]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) {
      return;
    }

    if (paymentStatus === "success") {
      toast.info("Оплата обрабатывается");
    } else if (paymentStatus === "failed") {
      toast.error("Оплата не выполнена");
    }

    router.replace("/app/profile");
  }, [router, searchParams]);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabId>(() =>
    typeof window !== "undefined" && window.location.hash === "#ai"
      ? "ai-profile"
      : "overview",
  );
  const [mobileAccordionValue, setMobileAccordionValue] = useState<
    ProfileTabId | ""
  >(() =>
    typeof window !== "undefined" && window.location.hash === "#ai"
      ? "ai-profile"
      : "overview",
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isCopyingReferral, setIsCopyingReferral] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedTopupPlanId, setSelectedTopupPlanId] = useState<string | null>(
    null,
  );

  const aiPhotos = aiProfilePhotosQuery.data ?? [];

  useEffect(() => {
    if (!aiProfilePhotosQuery.isSuccess || aiProfileMigrationRef.current) {
      return;
    }

    aiProfileMigrationRef.current = true;

    const localPhotos = readAiProfilePhotos();
    if (localPhotos.length === 0) {
      return;
    }

    if (aiPhotos.length > 0) {
      writeAiProfilePhotos([]);
      return;
    }

    void (async () => {
      const uniqueStorageKeys = Array.from(
        new Set(localPhotos.map((photo) => photo.storageKey)),
      ).slice(0, AI_PROFILE_MAX);

      for (const storageKey of uniqueStorageKeys) {
        try {
          await addAiProfilePhotoMutation.mutateAsync({ storageKey });
        } catch {
          // ignore invalid legacy keys
        }
      }

      writeAiProfilePhotos([]);
    })();
  }, [
    aiPhotos.length,
    aiProfilePhotosQuery.isSuccess,
    addAiProfilePhotoMutation,
  ]);

  useEffect(() => {
    const newDone = uploadedPhotos.filter(
      (photo) =>
        photo.status === "done" &&
        !persistedUploadsRef.current.has(photo.localId) &&
        photo.storageKey,
    );

    if (newDone.length === 0) {
      return;
    }

    persistedUploadsRef.current = new Set([
      ...persistedUploadsRef.current,
      ...newDone.map((photo) => photo.localId),
    ]);

    const doneIds = new Set(newDone.map((photo) => photo.localId));

    void (async () => {
      for (const photo of newDone) {
        try {
          await addAiProfilePhotoMutation.mutateAsync({
            storageKey: photo.storageKey,
          });
        } catch (error: unknown) {
          if (error instanceof ApiError) {
            toast.error(
              error.message || "Не удалось сохранить фото AI-профиля",
            );
          } else {
            toast.error("Не удалось сохранить фото AI-профиля");
          }
        }
      }

      setUploadedPhotos((prev) =>
        prev.filter((photo) => !doneIds.has(photo.localId)),
      );
    })();
  }, [uploadedPhotos, addAiProfilePhotoMutation]);

  const aiCount = aiPhotos.length;
  const isAiProfileFull = aiCount >= AI_PROFILE_MAX;
  const aiRecommendedLeft = Math.max(AI_PROFILE_MIN_RECOMMENDED - aiCount, 0);
  const aiProgress = Math.min(
    (aiCount / AI_PROFILE_MIN_RECOMMENDED) * 100,
    100,
  );
  const uploadLimit = Math.max(AI_PROFILE_MAX - aiCount, 1);

  const inviteDialogOpen = searchParams.get("panel") === "invite";
  const topupDialogOpen = searchParams.get("panel") === "topup";

  const billingPlans = billingPlansQuery.data ?? [];
  const selectedTopupPlan =
    billingPlans.find((plan) => plan.id === selectedTopupPlanId) ??
    billingPlans[0];
  const topupBonusTickets = selectedTopupPlan
    ? Math.ceil(selectedTopupPlan.tickets * 0.1)
    : 0;

  const referralLink = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/ref/${user.id}`;
    }

    return `https://app.neyro.photo/ref/${user.id}`;
  }, [user.id]);

  async function handleTopup(): Promise<void> {
    if (!selectedTopupPlan || topupMutation.isPending) {
      return;
    }

    try {
      const payment = await topupMutation.mutateAsync({
        billingPlanId: selectedTopupPlan.id,
      });
      window.location.assign(payment.paymentUrl);
    } catch (error: unknown) {
      if (!(error instanceof ApiError)) {
        toast.error("Не удалось создать платёжную ссылку");
      }
    }
  }

  function removeAiPhoto(photoId: string): void {
    void removeAiProfilePhotoMutation
      .mutateAsync(photoId)
      .catch((error: unknown) => {
        if (error instanceof ApiError) {
          toast.error(error.message || "Не удалось удалить фото");
        } else {
          toast.error("Не удалось удалить фото");
        }
      });
  }

  function unwrapUpload(
    payload: UploadImageResponse | ApiData<UploadImageResponse>,
  ): UploadImageResponse {
    if (
      payload &&
      typeof payload === "object" &&
      "data" in (payload as unknown as Record<string, unknown>)
    ) {
      return (payload as ApiData<UploadImageResponse>).data;
    }

    return payload as UploadImageResponse;
  }

  async function handleAvatarUpload(file: File): Promise<void> {
    if (!file.type.startsWith("image/")) {
      toast.error("Разрешены только изображения");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploadingAvatar(true);

      const uploadResponse = await apiUpload<
        UploadImageResponse | ApiData<UploadImageResponse>
      >(API_ROUTES.UPLOAD_IMAGE, formData);
      const upload = unwrapUpload(uploadResponse);

      if (!upload.storageKey) {
        throw new Error("Missing storageKey");
      }

      await updateMeMutation.mutateAsync({
        image: upload.storageKey,
      } as { name?: string; image?: string | null });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message || "Не удалось обновить аватар");
      } else {
        toast.error("Не удалось обновить аватар");
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleLogout(): Promise<void> {
    await signOut();
    router.replace("/");
    router.refresh();
  }

  function setProfilePanel(panel: "invite" | "topup" | null): void {
    const params = new URLSearchParams(searchParams.toString());

    if (panel) {
      params.set("panel", panel);
    } else {
      params.delete("panel");
    }

    const query = params.toString();
    const target = query ? `/app/profile?${query}` : "/app/profile";

    router.replace(target, { scroll: false });
  }

  function handleInviteDialogChange(open: boolean): void {
    setProfilePanel(open ? "invite" : null);
  }

  function handleTopupDialogChange(open: boolean): void {
    setProfilePanel(open ? "topup" : null);
  }

  async function handleCopyReferralLink(): Promise<void> {
    try {
      setIsCopyingReferral(true);
      await navigator.clipboard.writeText(referralLink);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    } finally {
      setIsCopyingReferral(false);
    }
  }

  function handleAvatarInputChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void handleAvatarUpload(file);
    event.target.value = "";
  }

  function showFaqPlaceholder(): void {
    toast.info("Раздел FAQ скоро появится");
  }

  function showPolicyPlaceholder(label: string): void {
    toast.info(`${label} скоро появится`);
  }

  function renderTransactionHistory() {
    const isInitialLoading =
      transactionsQuery.isLoading && transactions.length === 0;
    const hasMore = transactionMeta
      ? transactionMeta.page < transactionMeta.totalPages
      : false;

    return (
      <section className="rounded-2xl border border-white/8 bg-surface p-4 md:p-6">
        <h2 className="text-[18px] font-semibold leading-[1.12] text-white">
          История транзакций
        </h2>

        {isInitialLoading ? (
          <p className="mt-3 text-sm text-white/50">Загружаем...</p>
        ) : transactions.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-white/50">
            Транзакций пока нет.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </ul>
        )}

        {hasMore ? (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={transactionsQuery.isFetching}
              onClick={() => {
                if (transactionMeta) {
                  setTransactionPage(transactionMeta.page + 1);
                }
              }}
            >
              {transactionsQuery.isFetching ? "Загружаем..." : "Загрузить ещё"}
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  function renderOverviewContent(isMobile = false) {
    if (isMobile) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[--color-background] px-3 py-1.5 text-[15px] text-white">
              <TopupTicketIcon className="h-4 w-4" />
              <span>{user.balance}</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-8 rounded-[10px] px-3 text-[15px] font-medium text-white hover:opacity-95"
              style={{ background: "var(--gradient-topup-cta)" }}
              onClick={() => setProfilePanel("topup")}
            >
              Пополнить
            </Button>
          </div>

          <div className="min-w-0 space-y-1">
            <p className="truncate text-[20px] font-semibold leading-[1.12] text-white">
              {user.name}
            </p>
            <p className="truncate text-[15px] text-white/75">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowTransactions(true)}
            className="text-[11px] text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
          >
            История транзакций
          </button>

          {showTransactions ? renderTransactionHistory() : null}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <label className="relative block cursor-pointer">
                <Avatar className="h-[100px] w-[100px] rounded-2xl bg-white/5">
                  <AvatarImage
                    src={user.image ?? ""}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-white/5">
                    <User className="h-10 w-10 text-white/75" />
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploadingAvatar || updateMeMutation.isPending}
                  onChange={handleAvatarInputChange}
                />
                {isUploadingAvatar ? (
                  <span className="absolute inset-0 inline-flex items-center justify-center rounded-2xl bg-black/30">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </span>
                ) : null}
              </label>

              <div className="min-w-0 space-y-1">
                <p className="truncate text-[20px] font-semibold leading-[1.12] text-white">
                  {user.name}
                </p>
                <p className="truncate text-[15px] text-white/75">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-[--color-background] px-3 py-1.5 text-[15px] text-white">
                <TopupTicketIcon className="h-4 w-4" />
                <span>{user.balance}</span>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-[10px] px-3 text-[15px] font-medium text-white hover:opacity-95"
                style={{ background: "var(--gradient-topup-cta)" }}
                onClick={() => setProfilePanel("topup")}
              >
                Пополнить
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTransactions(true)}
            className="text-[13px] text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
          >
            История транзакций
          </button>
        </div>

        {showTransactions ? renderTransactionHistory() : null}
      </div>
    );
  }

  function renderSettingsContent() {
    return (
      <div className="space-y-4">
        <div className="space-y-4 rounded-2xl p-4 md:space-y-5 md:p-0">
          <div className="space-y-2 md:space-y-3">
            <p className="text-[15px] text-white/75 md:text-[18px]">
              Язык интерфейса
            </p>
            <button
              type="button"
              disabled
              className="flex h-[47px] w-full items-center justify-between rounded-2xl border border-white/8 bg-[--color-background] px-[14px] text-left md:h-[52px] md:px-4"
            >
              <span className="text-[15px] font-medium text-foreground md:text-[18px] md:font-normal">
                Русский
              </span>
              <ChevronDown className="h-4 w-4 text-white/75" />
            </button>
          </div>

          <p className="text-left text-[14px] leading-[1.12] text-white/75 md:whitespace-nowrap">
            Используя наш сервис, вы соглашаетесь с{" "}
            <button
              type="button"
              onClick={() =>
                showPolicyPlaceholder("Политика конфиденциальности")
              }
              className="text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
            >
              политикой конфиденциальности
            </button>{" "}
            и правилами{" "}
            <button
              type="button"
              onClick={() =>
                showPolicyPlaceholder("Правила обработки персональных данных")
              }
              className="text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
            >
              обработки персональных данных
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  function renderAccountContent() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <p className="text-[15px] text-white/75">{user.name}</p>
            <p className="text-[15px] text-white/75">{user.email}</p>
          </div>

          <Button
            variant="outline"
            className="h-[43px] rounded-xl border-white/30 bg-transparent px-4 text-[15px] font-medium text-white/75 hover:bg-white/8 hover:text-white"
            onClick={() => {
              void handleLogout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>

        <div className="space-y-3 rounded-xl border border-border p-4">
          <p className="text-[15px] text-white/75">
            Если вы хотите удалить свой профиль, нажмите на кнопку ниже. Все
            ваши данные будут удалены без возможности восстановления.
          </p>

          <Button
            variant="outline"
            disabled
            className="h-[43px] rounded-xl border-white/30 bg-transparent px-4 text-[15px] font-medium text-white/75"
          >
            <Trash2 className="h-4 w-4" />
            Удалить аккаунт
          </Button>
        </div>
      </div>
    );
  }

  function renderAiProfileContent() {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold md:text-xl">
              <Sparkles className="h-4 w-4 text-[--color-primary]" />
              AI-профиль
            </h2>
            <p className="mt-1 text-xs text-[--color-foreground-muted] md:text-sm">
              Добавьте 10–15 фото. Чем разнообразнее ракурсы и свет, тем лучше
              результат генерации.
            </p>
          </div>

          <Badge variant="secondary">
            {aiCount}/{AI_PROFILE_MAX}
          </Badge>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[--color-background]">
          <div
            className="h-full rounded-full bg-[--color-primary] transition-[width]"
            style={{ width: `${aiProgress}%` }}
          />
        </div>

        <p className="text-xs text-[--color-foreground-muted]">
          {aiRecommendedLeft > 0
            ? `До рекомендуемого минимума осталось: ${aiRecommendedLeft}`
            : "Рекомендуемый минимум достигнут"}
        </p>

        <div>
          {isAiProfileFull ? (
            <p className="rounded-[--radius-md] border border-border bg-[--color-background]/40 px-3 py-2 text-sm text-[--color-foreground-muted]">
              Достигнут лимит AI-профиля (15 фото). Удалите одно из фото, чтобы
              добавить новое.
            </p>
          ) : (
            <PhotoUploadZone
              value={uploadedPhotos}
              onChange={(next) => {
                setUploadedPhotos(
                  next.filter((photo) => photo.status !== "error"),
                );
              }}
              min={1}
              max={uploadLimit}
              showPreviewList={false}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {aiPhotos.length === 0 ? (
            <p className="col-span-full rounded-[--radius-md] border border-dashed border-border px-3 py-4 text-sm text-[--color-foreground-muted]">
              Пока нет сохранённых фото AI-профиля.
            </p>
          ) : (
            aiPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative overflow-hidden rounded-xl border border-border bg-[--color-background]/40"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={photo.imageUrl}
                    alt="Фото AI-профиля"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAiPhoto(photo.id)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors hover:bg-black/70 hover:text-[--color-danger]"
                  aria-label="Удалить фото из AI-профиля"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderSupportContent() {
    return (
      <div className="space-y-5">
        <p className="text-[15px] leading-[1.27] text-white/75">
          Если у вас возникли вопросы, пожалуйста, ознакомьтесь с{" "}
          <button
            type="button"
            onClick={showFaqPlaceholder}
            className="text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
          >
            часто задаваемыми вопросами
          </button>
          .
        </p>

        <p className="text-[15px] leading-[1.27] text-white/75">
          Если вы не нашли ответ на свой вопрос, напишите нам на почту{" "}
          <a
            href="mailto:help@photo.com"
            className="text-[var(--color-profile-link)] transition-opacity hover:opacity-85"
          >
            help@photo.com
          </a>
          .
        </p>
      </div>
    );
  }

  function renderTabContent(tabId: ProfileTabId) {
    if (tabId === "overview") {
      return renderOverviewContent();
    }

    if (tabId === "settings") {
      return renderSettingsContent();
    }

    if (tabId === "account") {
      return renderAccountContent();
    }

    if (tabId === "ai-profile") {
      return renderAiProfileContent();
    }

    return renderSupportContent();
  }

  return (
    <section className="w-full max-w-[968px] px-3 py-4 md:px-6 md:py-8">
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold leading-[1.12] text-white md:text-[28px]">
          Профиль
        </h1>

        <div className="hidden overflow-x-auto scrollbar-hide md:block">
          <div className="inline-flex gap-1 rounded-2xl bg-white/4 p-1 backdrop-blur-[6px]">
            {PROFILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-xl px-4 py-3 text-[15px] transition-colors",
                  activeTab === tab.id
                    ? "bg-white/8 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "hidden md:block",
            activeTab === "overview" ? "" : "rounded-2xl bg-surface p-6",
          )}
        >
          {renderTabContent(activeTab)}
        </div>

        <div className="space-y-3 md:hidden">
          <div className="rounded-2xl bg-surface px-4 py-4">
            {renderOverviewContent(true)}
          </div>

          <Accordion
            type="single"
            collapsible
            value={mobileAccordionValue}
            onValueChange={(value) => {
              const nextValue = (value as ProfileTabId | "") || "";
              setMobileAccordionValue(nextValue);
              if (nextValue) {
                setActiveTab(nextValue);
              }
            }}
            className="space-y-3"
          >
            {PROFILE_TABS.filter((tab) => tab.id !== "overview").map((tab) => (
              <AccordionItem
                key={tab.id}
                value={tab.id}
                className="overflow-hidden rounded-2xl border-0 bg-surface"
              >
                <AccordionTrigger className="px-4 py-4 text-[18px] font-semibold leading-[1.12] text-white hover:bg-transparent hover:text-white data-[state=open]:text-white">
                  {tab.label}
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="px-4 pb-4">{renderTabContent(tab.id)}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <section className="flex flex-col gap-3 py-1 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[15px] text-white/50">Отзыв</p>
            <p className="text-[15px] text-white/75 md:text-[18px]">
              Пожалуйста, оставьте{" "}
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="text-white underline underline-offset-2 transition-opacity hover:opacity-85"
              >
                отзыв
              </button>{" "}
              о нашем приложении. Это поможет нам стать лучше.
            </p>
          </div>

          <div
            className="inline-flex items-center gap-1"
            style={{ color: "var(--color-rating-star)" }}
          >
            <Star className="h-4 w-4 fill-current stroke-current" />
            <Star className="h-4 w-4 fill-current stroke-current" />
            <Star className="h-4 w-4 fill-current stroke-current" />
            <Star className="h-4 w-4 fill-current stroke-current" />
            <Star className="h-4 w-4 fill-current stroke-current" />
          </div>
        </section>
      </div>

      <FeedbackSheet
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        userEmail={user.email}
      />

      <Dialog open={topupDialogOpen} onOpenChange={handleTopupDialogChange}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-[520px] overflow-hidden rounded-[24px] border border-white/10 bg-[--color-background] p-0 shadow-none max-md:left-0 max-md:top-10 max-md:w-screen max-md:max-w-none max-md:max-h-[calc(100dvh-40px)] max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-y-auto max-md:overscroll-contain max-md:rounded-t-[26px] max-md:rounded-b-none [&>button]:right-4 [&>button]:top-4 [&>button]:z-10 [&>button]:inline-flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-white/15 [&>button]:bg-black/30 [&>button]:p-0 [&>button]:text-white/80 [&>button]:backdrop-blur-sm max-md:[&>button]:right-3 max-md:[&>button]:top-3 hover:[&>button]:text-white [&>button>svg]:h-3.5 [&>button>svg]:w-3.5">
          <div className="relative h-[260px] w-full overflow-hidden bg-[radial-gradient(100%_100%_at_0%_0%,#5BD0FF_0%,rgba(132,60,255,0)_100%)] max-md:h-[200px] max-md:bg-[radial-gradient(110.93%_100%_at_50%_0%,#5BCFFF_0%,rgba(132,60,255,0)_100%)]">
            <Image
              src="/images/funds/topup-iridescent-ticket.webp"
              alt="Пополнение баланса"
              width={700}
              height={420}
              className="pointer-events-none absolute left-1/2 top-[-72px] w-[470px] max-w-none -translate-x-1/2 opacity-95 max-md:top-[-56px] max-md:w-[346px]"
              priority
            />
          </div>

          <div className="-mt-5 px-4 pb-4 max-md:-mt-[27px] max-md:px-3 max-md:pb-0 md:px-8 md:pb-8">
            <DialogHeader className="space-y-3 md:items-center md:text-center">
              <DialogTitle className="text-left text-2xl font-semibold leading-[112%] text-white md:text-center">
                Пополнение баланса
              </DialogTitle>
              <DialogDescription className="mx-auto max-w-[314px] text-center text-[15px] text-white/75">
                Выберите нужное количество тикетов
                <br />
                для пополнения
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 flex gap-1 overflow-x-auto pb-1 scrollbar-hide md:justify-center md:overflow-visible md:pb-0">
              {billingPlans.slice(0, 3).map((plan) => {
                const isActive = selectedTopupPlan?.id === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedTopupPlanId(plan.id)}
                    className={cn(
                      "inline-flex h-[29px] min-w-[96px] flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-[100px] px-2 py-1 text-xs font-semibold transition",
                      isActive
                        ? "bg-white text-[#050505]"
                        : "border border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.07] hover:text-white/50",
                    )}
                  >
                    <TopupTicketIcon
                      className="h-3.5 w-3.5"
                      color={
                        isActive
                          ? "var(--color-token)"
                          : "rgba(255,255,255,0.5)"
                      }
                    />
                    {plan.tickets} тикетов
                  </button>
                );
              })}
            </div>

            {billingPlansQuery.isLoading ? (
              <div className="mt-3 rounded-[--radius-md] border border-dashed border-white/20 px-3 py-5 text-center text-xs text-white/70">
                Загружаем тарифы...
              </div>
            ) : null}

            {!billingPlansQuery.isLoading && !selectedTopupPlan ? (
              <div className="mt-3 rounded-[--radius-md] border border-dashed border-white/20 px-3 py-5 text-center text-xs text-white/70">
                Тарифы пока не настроены
              </div>
            ) : null}

            {selectedTopupPlan ? (
              <div className="mt-3 rounded-[16px] bg-white [background-image:radial-gradient(48.83%_11.98%_at_50%_50%,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0)_100%)] p-4 text-black max-md:mt-2 md:mt-4">
                <div className="mx-auto w-full max-w-[304px] space-y-3 md:max-w-[424px]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[28px] font-semibold leading-[112%]">
                      {selectedTopupPlan.price} ₽
                    </p>
                    <span className="inline-flex h-6 items-center gap-1 rounded-[6px] bg-black/75 px-1.5 py-1 text-[13px] leading-[116%] text-white backdrop-blur-[8px]">
                      <TopupTicketIcon className="h-4 w-4" />
                      {selectedTopupPlan.tickets}
                    </span>
                  </div>

                  <div className="h-px bg-black/10" />

                  <div className="space-y-2">
                    <p className="text-[18px] font-semibold leading-[112%] text-black">
                      Что вы получите:
                    </p>

                    <ul className="space-y-2 text-[15px] leading-5 text-black/70">
                      {selectedTopupPlan.whatYouGet.map((item, index) => (
                        <li
                          key={`${selectedTopupPlan.id}-get-${index}`}
                          className="flex items-start gap-2"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden="true"
                          >
                            <path
                              d="m21.56 10.739-1.36-1.58c-.26-.3-.47-.86-.47-1.26v-1.7c0-1.06-.87-1.93-1.93-1.93h-1.7c-.39 0-.96-.21-1.26-.47l-1.58-1.36c-.69-.59-1.82-.59-2.52 0l-1.57 1.37c-.3.25-.87.46-1.26.46H6.18c-1.06 0-1.93.87-1.93 1.93v1.71c0 .39-.21.95-.46 1.25l-1.35 1.59c-.58.69-.58 1.81 0 2.5l1.35 1.59c.25.3.46.86.46 1.25v1.71c0 1.06.87 1.93 1.93 1.93h1.73c.39 0 .96.21 1.26.47l1.58 1.36c.69.59 1.82.59 2.52 0l1.58-1.36c.3-.26.86-.47 1.26-.47h1.7c1.06 0 1.93-.87 1.93-1.93v-1.7c0-.39.21-.96.47-1.26l1.36-1.58c.58-.69.58-1.83-.01-2.52Zm-5.4-.63-4.83 4.83a.75.75 0 0 1-1.06 0l-2.42-2.42a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l1.89 1.89 4.3-4.3c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06Z"
                              fill="var(--color-profile-link)"
                            />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedTopupPlan.included.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[18px] font-semibold leading-[112%] text-black">
                        Включено:
                      </p>
                      <ul className="space-y-2 text-[15px] leading-5 text-black/70">
                        {selectedTopupPlan.included.map((item, index) => (
                          <li
                            key={`${selectedTopupPlan.id}-inc-${index}`}
                            className="flex items-start gap-2"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            >
                              <path
                                d="m21.56 10.739-1.36-1.58c-.26-.3-.47-.86-.47-1.26v-1.7c0-1.06-.87-1.93-1.93-1.93h-1.7c-.39 0-.96-.21-1.26-.47l-1.58-1.36c-.69-.59-1.82-.59-2.52 0l-1.57 1.37c-.3.25-.87.46-1.26.46H6.18c-1.06 0-1.93.87-1.93 1.93v1.71c0 .39-.21.95-.46 1.25l-1.35 1.59c-.58.69-.58 1.81 0 2.5l1.35 1.59c.25.3.46.86.46 1.25v1.71c0 1.06.87 1.93 1.93 1.93h1.73c.39 0 .96.21 1.26.47l1.58 1.36c.69.59 1.82.59 2.52 0l1.58-1.36c.3-.26.86-.47 1.26-.47h1.7c1.06 0 1.93-.87 1.93-1.93v-1.7c0-.39.21-.96.47-1.26l1.36-1.58c.58-.69.58-1.83-.01-2.52Zm-5.4-.63-4.83 4.83a.75.75 0 0 1-1.06 0l-2.42-2.42a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l1.89 1.89 4.3-4.3c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06Z"
                                fill="var(--color-profile-link)"
                              />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex h-10 items-center gap-2.5 rounded-[12px] border border-white/40 bg-[radial-gradient(120%_160%_at_8%_10%,#DE7CFF_0%,rgba(115,44,215,0.8)_100%)] px-3 py-2.5 text-[15px] leading-none text-white">
                    <Gift className="h-5 w-5 shrink-0 text-white" />
                    <span className="inline-flex items-center gap-0.5">
                      <span className="font-semibold text-white">
                        {topupBonusTickets}
                      </span>
                      <span className="text-white/75"> тикетов в подарок</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              disabled={!selectedTopupPlan || topupMutation.isPending}
              onClick={() => void handleTopup()}
              className="mt-4 h-[52px] w-full rounded-[16px] text-[15px] font-semibold text-white hover:opacity-95 max-md:mt-6"
              style={{
                background:
                  "radial-gradient(62.91% 61.14% at 13.64% 11.36%, rgba(81, 197, 255, 0.5) 0%, rgba(81, 197, 255, 0) 100%), #1F93E6",
                backgroundBlendMode: "color-dodge, normal",
              }}
            >
              {selectedTopupPlan
                ? `Купить ${selectedTopupPlan.tickets} тикетов`
                : "Купить тикеты"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteDialogOpen} onOpenChange={handleInviteDialogChange}>
        <DialogContent className="max-w-2xl rounded-[--radius-xl] border border-border bg-[--color-background] p-4 md:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="inline-flex items-center gap-2 text-xl md:text-2xl">
              <Gift className="h-5 w-5 text-[--color-profile-link]" />
              Приглашайте друзей и получайте бонусы
            </DialogTitle>
            <DialogDescription>
              Делитесь персональной ссылкой и получайте токены за регистрацию и
              пополнения приглашённых друзей.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-[--radius-lg] border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-[--color-foreground-muted]">
                Ваша персональная ссылка
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[--color-profile-link] hover:text-[--color-profile-link]"
                onClick={() => {
                  void handleCopyReferralLink();
                }}
                disabled={isCopyingReferral}
              >
                <Copy className="h-4 w-4" />
                Скопировать
              </Button>
            </div>

            <div className="rounded-[--radius-md] border border-border bg-[--color-background] px-4 py-3 text-sm text-foreground">
              {referralLink}
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[--radius-lg] border border-border bg-surface">
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border bg-white/5 px-4 py-3 text-sm font-medium text-foreground">
              <span>Действие</span>
              <span>Награда</span>
            </div>

            <div className="divide-y divide-border">
              {REFERRAL_REWARDS.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-sm"
                >
                  <span>{item.label}</span>
                  <span className="inline-flex items-center gap-1 text-[--color-foreground-muted]">
                    <Ticket className="h-4 w-4 text-[--color-token]" />
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
