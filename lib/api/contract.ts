// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum Role {
  USER = "USER",
  CONTENT_MANAGER = "CONTENT_MANAGER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export enum OrderSourceType {
  PRESET = "PRESET",
  PHOTO_SESSION = "PHOTO_SESSION",
}

export enum GenerationSourceType {
  PRESET = "PRESET",
  PHOTO_SESSION_SLOT = "PHOTO_SESSION_SLOT",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum GenerationStatus {
  CREATED = "CREATED",
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  RETRYING = "RETRYING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum GenerationMode {
  PROMPT_AND_PHOTO = "PROMPT_AND_PHOTO",
  PROMPT_TO_PHOTO = "PROMPT_TO_PHOTO",
  MERGE_TWO_PHOTOS = "MERGE_TWO_PHOTOS",
  PROMPT_TO_VIDEO = "PROMPT_TO_VIDEO",
  ANIMATE_IMAGE = "ANIMATE_IMAGE",
  MERGE_THREE_TO_FIVE_PHOTOS = "MERGE_THREE_TO_FIVE_PHOTOS",
  BACKGROUND_REPLACE = "BACKGROUND_REPLACE",
}

export enum TokenTransactionType {
  TOPUP = "TOPUP",
  CHARGE = "CHARGE",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export enum GalleryStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  HIDDEN = "HIDDEN",
}

export enum ReportReason {
  INAPPROPRIATE = "INAPPROPRIATE",
  COPYRIGHT = "COPYRIGHT",
  SPAM = "SPAM",
  OTHER = "OTHER",
}

export enum ReportStatus {
  OPEN = "OPEN",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

export enum FeedbackStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  REORDER = "REORDER",
  HIDE = "HIDE",
  MODERATE_GALLERY = "MODERATE_GALLERY",
  UPDATE_SEO = "UPDATE_SEO",
  CHANGE_ROLE = "CHANGE_ROLE",
  ADJUST_BALANCE = "ADJUST_BALANCE",
}

export enum MediaEntityType {
  PRESET = "PRESET",
  SESSION = "SESSION",
  SLOT = "SLOT",
  CMS = "CMS",
  AI_TOOL = "AI_TOOL",
  UPLOAD = "UPLOAD",
  RESULT = "RESULT",
}

export enum PhotoSessionAudience {
  FEMALE = "FEMALE",
  MALE = "MALE",
  KIDS = "KIDS",
  JOINT = "JOINT",
}

export enum PhotoSessionIdeaStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum PhotoSessionIdeaRelationType {
  STYLE = "STYLE",
  AI_TOOL = "AI_TOOL",
}

export enum PhotoSessionStyleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum PhotoSessionStyleRelationType {
  STYLE = "STYLE",
  IDEA = "IDEA",
}

export enum BlogArticleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum BlogCalloutVariant {
  ACCENT = "ACCENT",
  SUCCESS = "SUCCESS",
  DANGER = "DANGER",
}

export enum NanoBananaPageStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── ERROR CONTRACT ───────────────────────────────────────────────────────────

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INSUFFICIENT_TOKENS"
  | "ACTIVE_GENERATIONS_LIMIT_EXCEEDED"
  | "MAINTENANCE_MODE"
  | "FAL_AI_ERROR"
  | "SLOT_LIMIT_EXCEEDED"
  | "FORBIDDEN_ACTION"
  | "INVALID_SOURCE_TYPE";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown[];
  };
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown[];

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    details?: unknown[],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export interface GetMeResponse {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: Role;
  status: UserStatus;
  balance: number;
  createdAt: string;
}

export interface UserAiProfilePhotoResponse {
  id: string;
  storageKey: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreateUserAiProfilePhotoRequest {
  storageKey: string;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export interface SeoMeta {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: unknown;
}

export interface WithSeoMeta {
  meta: {
    seo: SeoMeta;
  };
}

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  featured: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  featured?: boolean;
  isVisible?: boolean;
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export interface ReorderRequest {
  items: Array<{ id: string; sortOrder: number }>;
}

// ─── PRESETS ───────────────────────────────────────────────────────────────────

export interface ParameterOptionResponse {
  id: string;
  label: string;
  promptSnippet: string;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ParameterGroupResponse {
  id: string;
  question: string;
  isRequired: boolean;
  sortOrder: number;
  options: ParameterOptionResponse[];
}

export interface PresetListItemResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  previewUrl: string | null;
  categoryId: string;
  tokenCost: number;
  sortOrder: number;
  featured: boolean;
  popular: boolean;
  isVisible?: boolean;
  createdAt: string;
}

export interface PresetResponse extends PresetListItemResponse {
  basePrompt: string;
  isVisible: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  jsonLd: unknown;
  parameterGroups: ParameterGroupResponse[];
  updatedAt: string;
}

export interface ParameterOptionRequest {
  label: string;
  promptSnippet: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface ParameterGroupRequest {
  question: string;
  isRequired?: boolean;
  sortOrder?: number;
  options: ParameterOptionRequest[];
}

export interface CreatePresetRequest {
  slug: string;
  title: string;
  description?: string;
  previewUrl?: string;
  basePrompt: string;
  tokenCost: number;
  categoryId: string;
  sortOrder?: number;
  featured?: boolean;
  popular?: boolean;
  isVisible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: Record<string, unknown>;
  parameterGroups?: ParameterGroupRequest[];
}

export type UpdatePresetRequest = Partial<CreatePresetRequest>;

export type PresetResponseDto = PresetResponse;

// ─── PHOTO SESSIONS ───────────────────────────────────────────────────────────

export interface SlotResponse {
  id: string;
  order: number;
  basePrompt: string;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoSessionListItemResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  previewUrl: string | null;
  categoryId: string;
  tokenCostPerSlot: number;
  sortOrder: number;
  featured: boolean;
  popular: boolean;
  audience: PhotoSessionAudience;
  isVisible?: boolean;
  createdAt: string;
}

export interface PhotoSessionResponse extends PhotoSessionListItemResponse {
  isVisible: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  jsonLd: unknown;
  parameterGroups: ParameterGroupResponse[];
  slots: SlotResponse[];
  updatedAt: string;
}

export interface CreateSlotRequest {
  order: number;
  basePrompt: string;
  previewUrl?: string;
}

export interface CreatePhotoSessionRequest {
  slug: string;
  title: string;
  description?: string;
  previewUrl?: string;
  tokenCostPerSlot: number;
  categoryId: string;
  sortOrder?: number;
  featured?: boolean;
  popular?: boolean;
  audience?: PhotoSessionAudience;
  isVisible?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: Record<string, unknown>;
  parameterGroups?: ParameterGroupRequest[];
  slots: CreateSlotRequest[];
}

export type UpdatePhotoSessionRequest = Partial<CreatePhotoSessionRequest>;

// ─── GENERATION ───────────────────────────────────────────────────────────────

export interface SelectedOptionRequest {
  parameterGroupId: string;
  optionId: string;
}

export interface PromptGenerationRequest {
  inputImageUrl: string;
  prompt: string;
}

export interface CreateGenerationRequest {
  sourceType: OrderSourceType;
  presetId?: string;
  photoSessionId?: string;
  inputImageUrl: string;
  selectedOptions: SelectedOptionRequest[];
}

export interface CreateGenerationModeRequest {
  mode: GenerationMode;
  prompt: string;
  inputImageKeys: string[];
}

export interface CreateGenerationModeResponse {
  orderId: string;
  status: OrderStatus;
  mode: GenerationMode;
  tokenCost: number;
}

export interface GenerationModeCostResponse {
  mode: GenerationMode;
  tokenCost: number;
}

export interface GenerationResponse {
  id: string;
  sourceType: GenerationSourceType;
  sourceId?: string | null;
  mode?: GenerationMode | null;
  status: GenerationStatus;
  progress: number;
  resultImageUrl?: string | null;
  resultVideoUrl?: string | null;
  resultUrl?: string;
  inputSignedUrl?: string;
  tokenCost: number;
  attemptCount: number;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface GenerationOrderListItemResponse {
  id: string;
  sourceType: OrderSourceType;
  presetId?: string | null;
  photoSessionId?: string | null;
  mode?: GenerationMode | null;
  totalCost: number;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface GenerationOrderResponse {
  id: string;
  sourceType: OrderSourceType;
  presetId?: string | null;
  photoSessionId?: string | null;
  mode?: GenerationMode | null;
  totalCost: number;
  status: OrderStatus;
  selectedOptions: SelectedOptionRequest[];
  generations: GenerationResponse[];
  createdAt: string;
  completedAt?: string | null;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: unknown;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

export interface GalleryItemResponse {
  id: string;
  userId: string;
  generationId: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  status: GalleryStatus;
  createdAt: string;
}

export interface PublishGalleryItemRequest {
  generationId: string;
  title?: string;
  description?: string;
}

export interface UpdateGalleryStatusRequest {
  status: GalleryStatus;
}

// ─── CMS ──────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageContent extends Record<string, unknown> {
  description: string;
  items: FaqItem[];
}

export interface LegalPageContent extends Record<string, unknown> {
  markdown: string;
}

export type LegalPageSlug =
  "rules" | "privacy-policy" | "personal-data-policy" | "cookie-policy";

export interface CmsPageResponse {
  id: string;
  slug: string;
  title: string;
  h1: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  jsonLd: unknown;
}

export interface CreateCmsPageRequest {
  slug: string;
  title: string;
  h1: string;
  content: Record<string, unknown>;
  isPublished?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: Record<string, unknown>;
}

export type UpdateCmsPageRequest = Partial<CreateCmsPageRequest>;

export interface FaqCmsPageResponse extends CmsPageResponse {
  slug: "faq";
  content: FaqPageContent;
}

// ─── FILE UPLOAD ───────────────────────────────────────────────────────────────

export interface ImageVariants {
  width400Url?: string;
  width640Url?: string;
  width1280Url?: string;
  width1920Url?: string;
}

export interface UploadImageResponse {
  storageKey: string;
  mediaAssetId: string;
}

export interface UploadAdminAssetResponse {
  url: string;
  mediaAssetId: string;
  variants?: ImageVariants;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface TopContentUsageDto {
  id: string;
  title: string;
  slug: string;
  usageCount: number;
}

export interface OverviewStatsDto {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalGenerationOrders: number;
  ordersToday: number;
  completedOrdersToday: number;
  failedOrdersToday: number;
  totalTokensCharged: number;
  tokensChargedToday: number;
  activeOrders: number;
  topPresets: TopContentUsageDto[];
  topPhotoSessions: TopContentUsageDto[];
}

export interface DailyStatsDto {
  date: string;
  ordersCreated: number;
  ordersCompleted: number;
  ordersFailed: number;
  tokensCharged: number;
}

export interface AdminUserListItemDto {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: Role;
  status: UserStatus;
  balance: number;
  createdAt: string;
}

export interface GenerationOrderListItemDto {
  id: string;
  sourceType: OrderSourceType;
  presetId: string | null;
  photoSessionId: string | null;
  mode?: GenerationMode | null;
  totalCost: number;
  status: OrderStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminUserDetailDto extends AdminUserListItemDto {
  totalOrders: number;
  totalTokensSpent: number;
  recentOrders: GenerationOrderListItemDto[];
}

export interface UpdateUserRoleRequest {
  role: Role;
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────

export interface ReportResponse {
  id: string;
  galleryItemId: string;
  reporterId: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ResolveReportRequest {
  status: ReportStatus.RESOLVED | ReportStatus.DISMISSED;
}

// ─── HOMEPAGE TESTIMONIALS ─────────────────────────────────────────────────────

export interface HomepageTestimonialResponse {
  id: string;
  authorName: string;
  text: string;
  rating: number;
}

export interface AdminHomepageTestimonialResponse extends HomepageTestimonialResponse {
  isVisible: boolean;
}

export interface CreateHomepageTestimonialRequest {
  authorName: string;
  text: string;
  rating: number;
  isVisible?: boolean;
}

export type UpdateHomepageTestimonialRequest =
  Partial<CreateHomepageTestimonialRequest>;

// ─── HOMEPAGE FAQ ──────────────────────────────────────────────────────────────

export interface HomepageFaqResponse {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export type AdminHomepageFaqResponse = HomepageFaqResponse;

export interface CreateHomepageFaqRequest {
  question: string;
  answer: string;
}

export type UpdateHomepageFaqRequest = Partial<CreateHomepageFaqRequest>;

export interface ReorderHomepageFaqRequest {
  items: Array<{ id: string; sortOrder: number }>;
}

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

export interface FeedbackResponse {
  id: string;
  email: string | null;
  text: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  email?: string;
  text: string;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

// ─── APP SETTINGS ─────────────────────────────────────────────────────────────

export interface AppSettingResponse {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export interface UpdateAppSettingRequest {
  value: string;
}

// ─── BILLING ──────────────────────────────────────────────────────────────────

export interface BalanceResponse {
  balance: number;
  currency: "TOKEN";
}

export interface TokenTransactionResponse {
  id: string;
  type: TokenTransactionType;
  amount: number;
  orderId?: string;
  /** Payment amount in rubles; present only for successful TOPUP transactions. */
  paymentAmount?: number;
  description?: string;
  createdAt: string;
}

export interface TopupRequest {
  billingPlanId: string;
}

export interface TopupResponse {
  paymentId: string;
  paymentLinkId: string;
  paymentUrl: string;
  billingPlanId: string;
  amount: number;
  tickets: number;
  status: "PENDING";
}

export interface BillingPlanResponse {
  id: string;
  tickets: number;
  price: number;
  whatYouGet: string[];
  included: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingPlanRequest {
  tickets: number;
  price: number;
  whatYouGet: string[];
  included: string[];
}

export type UpdateBillingPlanRequest = Partial<CreateBillingPlanRequest>;

export interface PricingPageSettingsResponse {
  id: string;
  h1: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingPageResponse {
  settings: PricingPageSettingsResponse;
  plans: BillingPlanResponse[];
}

export interface PricingPageSeoMeta {
  title: string;
  description: string;
  canonical: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
}

export interface UpdatePricingPageSettingsRequest {
  h1?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  showInSitemap?: boolean;
}

// ─── BILLING ADMIN ────────────────────────────────────────────────────────────

export interface AdminAdjustBalanceRequest {
  userId: string;
  amount: number;
  description: string;
}

export interface AuditLogResponse {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldData: unknown;
  newData: unknown;
  createdAt: string;
}

export interface PhotoSessionIdeaRelation {
  id: string;
  type: PhotoSessionIdeaRelationType;
  targetId: string;
  sortOrder: number;
}

export interface PhotoSessionStyleRelation {
  id: string;
  type: PhotoSessionStyleRelationType;
  targetId: string;
  sortOrder: number;
}

export interface PhotoSessionIdeaContent {
  ideaTypes?: string[];
  hero: {
    description: string;
    images: Array<{
      url: string;
      alt?: string;
      title?: string;
      variants?: ImageVariants | null;
    }>;
    showRating?: boolean;
    rating?: string;
    cta: { text: string; href: string };
  };
  howToCreate: {
    title: string;
    steps: Array<{ title: string; text: string; palette: string }>;
    cta: { text: string; href: string };
  };
  trends: {
    title: string;
    subtitle: string;
    cta: { text: string; href: string };
  };
  moreIdeas: { title: string; cta: { text: string; href: string } };
  faq: { title: string; items: Array<{ question: string; answer: string }> };
  bottomCta: {
    title: string;
    text: string;
    images: [string, string, string];
    button: { text: string; href: string };
  };
  seoText: { title: string; body: string; tags: string[] };
}

export interface PhotoSessionIdeaCardTag {
  text: string;
  gradient: string;
  icon?: "bolt" | "fire";
}

export interface PhotoSessionIdeaCard {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  imageVariants: ImageVariants | null;
  href: string;
  categoryId: string | null;
  usageCount?: string | null;
  usagePeriod?: string | null;
  tag?: PhotoSessionIdeaCardTag | null;
  secondaryImages?: string[];
  imageCount: number;
}

export interface IdeasHubSettingsResponse {
  id: string;
  h1: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: unknown;
  showInSitemap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateIdeasHubSettingsRequest {
  h1?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  showInSitemap?: boolean;
}

export interface PhotoSessionIdeaMenuCategory {
  id: string;
  name: string;
}

export interface PublicIdeasListResponse {
  data: PhotoSessionIdeaCard[];
  categories: PhotoSessionIdeaMenuCategory[];
  meta: PaginationMeta & {
    pageSettings: { h1: string | null; description: string | null };
    seo: SeoMeta & { ogUrl?: string | null; jsonLd?: unknown };
  };
}

export interface PhotoSessionIdeaResponse {
  id: string;
  slug: string;
  internalName: string;
  h1: string;
  content: PhotoSessionIdeaContent;
  status: PhotoSessionIdeaStatus;
  isVisible: boolean;
  sortOrder: number;
  featured: boolean;
  wasPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedById: string | null;
  lastEditedByName: string | null;
  primaryCategoryId: string | null;
  mainImage: string | null;
  mainImageVariants: ImageVariants | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  showInMenu: boolean;
  showInHomepage: boolean;
  showInSearch: boolean;
  isAdultSensitive: boolean;
  isBrandPopCulture: boolean;
  relations: PhotoSessionIdeaRelation[];
  trends?: PhotoSessionIdeaCard[];
  moreIdeas?: PhotoSessionIdeaCard[];
}

export interface CreatePhotoSessionIdeaRequest {
  internalName: string;
  slug: string;
  h1: string;
  content: PhotoSessionIdeaContent;
  primaryCategoryId?: string;
  mainImage?: string;
  sortOrder?: number;
  featured?: boolean;
  isVisible?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  showInSitemap?: boolean;
  showInMenu?: boolean;
  showInHomepage?: boolean;
  showInSearch?: boolean;
  isAdultSensitive?: boolean;
  isBrandPopCulture?: boolean;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  relations?: Array<{
    type: PhotoSessionIdeaRelationType;
    targetId: string;
    sortOrder?: number;
  }>;
}

export type UpdatePhotoSessionIdeaRequest =
  Partial<CreatePhotoSessionIdeaRequest>;

export type BlogListVariant = "default" | "positive" | "negative";

export type BlogArticleBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      style: "unordered" | "ordered";
      variant?: BlogListVariant;
      items: string[];
    }
  | {
      type: "quote";
      text: string;
      author?: string;
    }
  | {
      type: "link";
      text: string;
      href: string;
    }
  | {
      type: "image";
      url: string;
      variants?: ImageVariants | null;
      alt: string;
      title?: string;
    }
  | {
      type: "callout";
      variant: BlogCalloutVariant;
      text: string;
    }
  | {
      type: "figure";
      url: string;
      variants?: ImageVariants | null;
      alt: string;
      title?: string;
      caption: string;
      showInImageSitemap?: boolean;
    };

export interface BlogArticleContent {
  blocks: BlogArticleBlock[];
}

export interface BlogRecommendationCard {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  imageVariants: ImageVariants | null;
  publishedAt: string;
}

export interface BlogRating {
  average: number;
  votes: number;
}

export interface BlogHubSettingsResponse {
  id: string;
  h1: string;
  subtitle: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogArticleListItem {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  imageVariants: ImageVariants | null;
  publishedAt: string;
}

export interface PublicBlogListResponse {
  data: BlogArticleListItem[];
  meta: PaginationMeta & {
    hub: BlogHubSettingsResponse;
  };
}

export interface BlogArticleResponse {
  id: string;
  slug: string;
  internalName: string;
  h1: string;
  content: BlogArticleContent;
  status: BlogArticleStatus;
  isVisible: boolean;
  sortOrder: number;
  featured: boolean;
  wasPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedById: string | null;
  lastEditedByName: string | null;
  primaryCategoryId: string | null;
  mainImage: string | null;
  mainImageVariants: ImageVariants | null;
  tags: string[];
  readingTimeMinutes: number | null;
  viewsCount: number;
  rating: BlogRating;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  showInMenu: boolean;
  showInHomepage: boolean;
  isAdultSensitive: boolean;
  isBrandPopCulture: boolean;
  mainImageInImageSitemap: boolean;
  previousArticle: BlogRecommendationCard | null;
  nextArticle: BlogRecommendationCard | null;
  readMore: BlogRecommendationCard[];
}

export interface CreateBlogArticleRequest {
  internalName: string;
  slug: string;
  h1: string;
  content: BlogArticleContent;
  primaryCategoryId?: string;
  mainImage?: string;
  readingTimeMinutes?: number;
  publishedAt?: string;
  isVisible?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  showInSitemap?: boolean;
  showInHomepage?: boolean;
  mainImageInImageSitemap?: boolean;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export type UpdateBlogArticleRequest = Partial<CreateBlogArticleRequest>;

export interface UpdateBlogHubSettingsRequest {
  h1?: string;
  subtitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  showInSitemap?: boolean;
}

export interface RateBlogArticleRequest {
  value: number;
}

export interface RateBlogArticleResponse {
  data: BlogRating;
}

export type PhotoSessionStyleStepPalette = "purple" | "blue" | "green";

export interface PhotoSessionStyleStepImage {
  url: string;
  variants?: ImageVariants | null;
  alt: string;
  title: string;
}

export interface PhotoSessionStyleStep {
  title: string;
  text: string;
  palette: PhotoSessionStyleStepPalette;
  image: PhotoSessionStyleStepImage;
}

export interface PhotoSessionStyleContent {
  styleTypes?: string[];
  hero: {
    description: string;
    images: Array<{
      url: string;
      alt?: string;
      title?: string;
      variants?: ImageVariants | null;
    }>;
    showRating?: boolean;
    rating?: string;
  };
  howGeneratorWorks: {
    title: string;
    steps: PhotoSessionStyleStep[];
  };
  trends: {
    title: string;
    subtitle: string;
    cta: { text: string; href: string };
  };
  moreIdeas: { title: string; cta: { text: string; href: string } };
  faq: { title: string; items: Array<{ question: string; answer: string }> };
  bottomCta: {
    title: string;
    text: string;
    image: {
      url: string;
      variants?: ImageVariants | null;
      alt: string;
      title: string;
    };
    button: { text: string; href: string };
  };
  seoText: { title: string; body: string; tags: string[] };
}

export interface PhotoSessionStyleResponse {
  id: string;
  slug: string;
  internalName: string;
  h1: string;
  content: PhotoSessionStyleContent;
  status: PhotoSessionStyleStatus;
  isVisible: boolean;
  sortOrder: number;
  featured: boolean;
  wasPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedById: string | null;
  lastEditedByName: string | null;
  primaryCategoryId: string | null;
  primaryCategoryName: string | null;
  mainImage: string | null;
  mainImageVariants: ImageVariants | null;
  ctaText: string | null;
  ctaHref: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  showInMenu: boolean;
  showInHomepage: boolean;
  showInSearch: boolean;
  isAdultSensitive: boolean;
  isBrandPopCulture: boolean;
  weeklyGenerationsCount: number;
  relations: PhotoSessionStyleRelation[];
  trends?: PhotoSessionIdeaCard[];
  moreIdeas?: PhotoSessionIdeaCard[];
}

export interface CreatePhotoSessionStyleRequest {
  internalName: string;
  slug: string;
  h1: string;
  content: PhotoSessionStyleContent;
  ctaText?: string;
  ctaHref?: string;
  primaryCategoryId?: string;
  mainImage?: string;
  sortOrder?: number;
  featured?: boolean;
  isVisible?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  showInSitemap?: boolean;
  showInMenu?: boolean;
  showInHomepage?: boolean;
  showInSearch?: boolean;
  isAdultSensitive?: boolean;
  isBrandPopCulture?: boolean;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  relations?: Array<{
    type: PhotoSessionStyleRelationType;
    targetId: string;
    sortOrder?: number;
  }>;
}

export type UpdatePhotoSessionStyleRequest =
  Partial<CreatePhotoSessionStyleRequest>;

export interface PhotoSessionStyleCard {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageVariants: ImageVariants | null;
  href: string;
  categoryId: string | null;
  usageCount: string;
  usagePeriod: string;
}

export interface PhotoSessionStyleMenuCategory {
  id: string;
  name: string;
}

export interface StylesHubSettingsResponse {
  id: string;
  h1: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: unknown;
  showInSitemap: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStylesHubSettingsRequest {
  h1?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonical?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  showInSitemap?: boolean;
}

export interface PublicStylesListResponse {
  data: PhotoSessionStyleCard[];
  categories: PhotoSessionStyleMenuCategory[];
  meta: PaginationMeta & {
    pageSettings: { h1: string | null; description: string | null };
    seo: SeoMeta & { ogUrl?: string | null; jsonLd?: unknown };
  };
}

// ─── SSE EVENTS ───────────────────────────────────────────────────────────────

export type SseEventType =
  | "generation_status"
  | "generation_progress"
  | "generation_result"
  | "generation_error"
  | "order_status"
  | "notification";

export interface SseEvent<TData = unknown> {
  type: SseEventType;
  data: TData;
}

export interface SseGenerationStatusEvent {
  orderId: string;
  generationId: string;
  slotOrder: number | null;
  status: GenerationStatus;
  at: string;
}

export interface SseGenerationProgressEvent {
  orderId: string;
  generationId: string;
  slotOrder: number | null;
  progress: number;
}

export interface SseGenerationResultEvent {
  orderId: string;
  generationId: string;
  slotOrder: number | null;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface SseGenerationErrorEvent {
  orderId: string;
  generationId: string;
  slotOrder: number | null;
  code: ApiErrorCode;
  message: string;
}

export interface SseOrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  at: string;
}

// ─── COMMON API RESPONSE ──────────────────────────────────────────────────────

export interface ApiResponse<TData, TMeta = undefined> {
  data: TData;
  meta: TMeta;
}

export interface ApiResponseWithoutMeta<TData> {
  data: TData;
}

export interface NanoBananaImage {
  url: string;
  variants?: ImageVariants | null;
  alt: string;
  caption?: string;
  showInImageSitemap: boolean;
}

export interface NanoBananaCta {
  text: string;
  href: string;
}

export type NanoBananaSteps = Array<{
  image: NanoBananaImage;
  title: string;
  description: string;
}>;
export type NanoBananaFeatures = Array<{
  image: NanoBananaImage;
  icon: "plus" | "maximize" | "sticker" | "mask" | "sparkles";
  title: string;
}>;
export type NanoBananaAudiences = Array<{
  image: NanoBananaImage;
  title: string;
  description: string;
}>;
export interface NanoBananaFaqItem {
  question: string;
  answer: string;
}
export type NanoBananaFaq = NanoBananaFaqItem[];
export type NanoBananaExamples = NanoBananaImage[];
export type NanoBananaCtaImages = NanoBananaImage[];
export type NanoBananaSeoSections = Array<{ heading: string; body: string }>;

export interface NanoBananaContent {
  hero: {
    titleAccent: string;
    titlePlain: string;
    description: string;
    cta: NanoBananaCta;
  };
  howItWorks: {
    titlePrefix: string;
    titleBrand: string;
    titleSuffix: string;
    description: string;
    steps: NanoBananaSteps;
    cta: NanoBananaCta;
  };
  editor: {
    titleAccent: string;
    titlePlain: string;
    description: string;
    image: NanoBananaImage;
  };
  features: {
    title: string;
    items: NanoBananaFeatures;
    allToolsCta: NanoBananaCta;
  };
  examples: {
    title: string;
    description: string;
    items: NanoBananaExamples;
    cta: NanoBananaCta;
  };
  realism: {
    titleAccent: string;
    titlePlain: string;
    description: string;
    before: NanoBananaImage;
    after: NanoBananaImage;
    beforeLabel: string;
    afterLabel: string;
  };
  audiences: {
    title: string;
    items: NanoBananaAudiences;
  };
  faq: {
    title: string;
    items: NanoBananaFaq;
  };
  bottomCta: {
    images: NanoBananaCtaImages;
    title: string;
    description: string;
    cta: NanoBananaCta;
  };
  seoText: { sections: NanoBananaSeoSections };
}

export interface NanoBananaPageResponse {
  id: string;
  slug: string;
  internalName: string;
  h1: string;
  content: NanoBananaContent;
  mainImage: NanoBananaImage;
  status: NanoBananaPageStatus;
  isVisible: boolean;
  featured: boolean;
  sortOrder: number;
  wasPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedById: string | null;
  primaryCategoryId: string | null;
  seoTitle: string;
  seoDescription: string;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  showInSitemap: boolean;
  showInMenu: boolean;
  showInSearch: boolean;
  isAdultSensitive: boolean;
  isBrandPopCulture: boolean;
}

export interface NanoBananaHubSettingsResponse {
  id: string;
  h1: string;
  description: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaText: string;
  ctaHref: string;
  seoTitle: string;
  seoDescription: string;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  showInSitemap: boolean;
}

export interface NanoBananaHubCard {
  id: string;
  slug: string;
  h1: string;
  mainImage: NanoBananaImage;
  href: string;
}

export interface NanoBananaHubResponse extends NanoBananaHubSettingsResponse {
  pages: NanoBananaHubCard[];
}

export interface NanoBananaSeoMeta {
  title: string;
  description: string;
  canonical: string | null;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  jsonLd: unknown;
}

export interface NanoBananaPublicHubResponse {
  data: NanoBananaHubResponse;
  meta: { seo: NanoBananaSeoMeta };
}

export interface NanoBananaPublicPageResponse {
  data: NanoBananaPageResponse;
  meta: { seo: NanoBananaSeoMeta };
}

export interface CreateNanoBananaRequest {
  internalName: string;
  slug: string;
  h1: string;
  content: NanoBananaContent;
  mainImage: NanoBananaImage;
  primaryCategoryId?: string;
  sortOrder?: number;
  featured?: boolean;
  isVisible?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  showInSitemap?: boolean;
  showInMenu?: boolean;
  showInSearch?: boolean;
  isAdultSensitive?: boolean;
  isBrandPopCulture?: boolean;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export type UpdateNanoBananaRequest = Partial<CreateNanoBananaRequest>;

export type UpdateNanoBananaHubRequest = Partial<
  Omit<NanoBananaHubSettingsResponse, "id">
>;

// ─── AI TOOLS ─────────────────────────────────────────────────────────────────
export interface AiToolImage {
  url: string;
  alt: string;
  title?: string;
  variants?: ImageVariants | null;
}

export interface AiToolPageContent {
  hero: {
    title: string;
    description: string;
    cta: { text: string; href: string };
    showRating?: boolean;
    rating?: string;
    images: AiToolImage[];
  };
  gallery: { title: string; description: string; items: AiToolImage[] };
  howTo: {
    title: string;
    steps: Array<{ title: string; text: string }>;
    cta: { text: string; href: string };
  };
  usage: {
    title: string;
    description: string;
    items: Array<{ title: string; text: string }>;
    image: AiToolImage;
  };
  realism: {
    titleAccent: string;
    titlePlain: string;
    description: string;
    before: AiToolImage;
    after: AiToolImage;
    beforeLabel: string;
    afterLabel: string;
  };
  features: { title: string; items: Array<{ title: string; text: string }> };
  tryLook?: { title: string };
  faq: { title: string; items: Array<{ question: string; answer: string }> };
  bottomCta: {
    title: string;
    text: string;
    images: [string, string, string];
    button: { text: string; href: string };
  };
  seoText: { title: string; body: string; tags: string[] };
}

export interface AiToolsSeoSection {
  heading: string;
  body: string;
}
export enum AiToolPageStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}
export interface AiToolPageCard {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  imageVariants: ImageVariants | null;
  href: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
export interface AiToolsHubSettingsResponse {
  id: string;
  h1: string;
  description: string;
  seoSections: [AiToolsSeoSection, AiToolsSeoSection];
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  jsonLd: unknown;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AiToolsPublicResponse {
  data: { settings: AiToolsHubSettingsResponse; tools: AiToolPageCard[] };
  meta: { seo: SeoMeta };
}

export interface AiToolPageRelation {
  id: string;
  blogArticleId: string;
  sortOrder: number;
}
export interface AiToolPageResponse {
  id: string;
  slug: string;
  internalName: string;
  h1: string;
  content: AiToolPageContent;
  mainImage: AiToolImage;
  status: AiToolPageStatus;
  isVisible: boolean;
  featured: boolean;
  sortOrder: number;
  wasPublished: boolean;
  publishedAt: string | null;
  lastEditedById: string | null;
  primaryCategoryId: string | null;
  deletedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonical: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  showInSitemap: boolean;
  showInMenu: boolean;
  showInSearch: boolean;
  tryLook?: {
    title: string;
    ideas: PhotoSessionIdeaCard[];
    styles: PhotoSessionStyleCard[];
  };
  relations: AiToolPageRelation[];
  relatedArticles?: BlogArticleListItem[];
  otherTools?: AiToolPageCard[];
  createdAt: string;
  updatedAt: string;
}
export interface AiToolPagePublicResponse {
  data: AiToolPageResponse;
  meta: { seo: SeoMeta };
}
export interface CreateAiToolPageRequest {
  internalName: string;
  slug: string;
  h1: string;
  content: AiToolPageContent;
  mainImage: AiToolImage;
  primaryCategoryId?: string;
  sortOrder?: number;
  featured?: boolean;
  isVisible?: boolean;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  showInSitemap?: boolean;
  showInMenu?: boolean;
  showInSearch?: boolean;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  relations?: Array<{ blogArticleId: string; sortOrder?: number }>;
}
export type UpdateAiToolPageRequest = Partial<CreateAiToolPageRequest>;
export type UpdateAiToolsHubRequest = Partial<
  Omit<AiToolsHubSettingsResponse, "id" | "createdAt" | "updatedAt">
>;

// ─── API ROUTES ───────────────────────────────────────────────────────────────

export const API_BASE = "/api/v1";

export const API_ROUTES = {
  // Auth
  AUTH_ME: `${API_BASE}/auth/me`,

  // Users
  USERS_ME: `${API_BASE}/users/me`,
  USERS_ME_AI_PROFILE_PHOTOS: `${API_BASE}/users/me/ai-profile/photos`,
  USERS_ME_AI_PROFILE_PHOTO_BY_ID: (photoId: string) =>
    `${API_BASE}/users/me/ai-profile/photos/${photoId}`,

  // Categories
  CATEGORIES: `${API_BASE}/categories`,
  ADMIN_CATEGORIES: `${API_BASE}/admin/categories`,
  CATEGORIES_BY_SLUG: (slug: string) => `${API_BASE}/categories/${slug}`,
  CATEGORIES_REORDER: `${API_BASE}/categories/reorder`,
  CATEGORY_BY_ID: (id: string) => `${API_BASE}/categories/${id}`,

  // Presets
  PRESETS: `${API_BASE}/presets`,
  ADMIN_PRESETS: `${API_BASE}/admin/presets`,
  PRESETS_REORDER: `${API_BASE}/presets/reorder`,
  PRESET_BY_SLUG: (slug: string) => `${API_BASE}/presets/${slug}`,
  PRESET_BY_USER_ID: (id: string) => `${API_BASE}/presets/by-id/${id}`,
  PRESET_BY_ID: (id: string) => `${API_BASE}/presets/${id}`,
  // GET /api/v1/admin/presets/:id (CONTENT_MANAGER | ADMIN)
  // Возвращает пресет по id независимо от isVisible (deletedAt: null)
  ADMIN_PRESET_BY_ID: (id: string) => `${API_BASE}/admin/presets/${id}`,

  // Photo Sessions
  PHOTO_SESSIONS: `${API_BASE}/photo-sessions`,
  ADMIN_PHOTO_SESSIONS: `${API_BASE}/admin/photo-sessions`,
  PHOTO_SESSIONS_REORDER: `${API_BASE}/photo-sessions/reorder`,
  PHOTO_SESSION_BY_SLUG: (slug: string) => `${API_BASE}/photo-sessions/${slug}`,
  PHOTO_SESSION_BY_ID: (id: string) => `${API_BASE}/photo-sessions/${id}`,
  // GET /api/v1/admin/photo-sessions/:id (CONTENT_MANAGER | ADMIN)
  // Возвращает фотосессию по id независимо от isVisible (deletedAt: null)
  ADMIN_PHOTO_SESSION_BY_ID: (id: string) =>
    `${API_BASE}/admin/photo-sessions/${id}`,

  // Generation
  GENERATIONS: `${API_BASE}/generations`,
  GENERATIONS_PROMPT: `${API_BASE}/generations/prompt`,
  GENERATIONS_MODES: `${API_BASE}/generations/modes`,
  GENERATIONS_MODE_COSTS: `${API_BASE}/generations/modes/costs`,
  GENERATION_BY_ID: (id: string) => `${API_BASE}/generations/${id}`,
  GENERATION_CANCEL: (id: string) => `${API_BASE}/generations/${id}/cancel`,
  SSE_ORDERS: `${API_BASE}/sse/orders`,
  SSE_ORDER: (orderId: string) => `${API_BASE}/sse/orders/${orderId}`,
  SSE_NOTIFICATIONS: `${API_BASE}/sse/notifications`,

  // Pricing page
  PRICING_PAGE: `${API_BASE}/prices`,
  ADMIN_PRICING_PAGE: `${API_BASE}/admin/prices`,

  // Billing
  BILLING_BALANCE: `${API_BASE}/billing/balance`,
  BILLING_TRANSACTIONS: `${API_BASE}/billing/transactions`,
  BILLING_TOPUP: `${API_BASE}/billing/topup`,
  BILLING_PLANS: `${API_BASE}/billing/plans`,
  ADMIN_BILLING_ADJUST: `${API_BASE}/admin/billing/adjust`,
  ADMIN_BILLING_TRANSACTIONS: `${API_BASE}/admin/billing/transactions`,
  ADMIN_BILLING_PLANS: `${API_BASE}/admin/billing/plans`,
  ADMIN_BILLING_PLAN_BY_ID: (id: string) =>
    `${API_BASE}/admin/billing/plans/${id}`,

  // Notifications
  NOTIFICATIONS: `${API_BASE}/notifications`,
  NOTIFICATION_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: `${API_BASE}/notifications/read-all`,

  // Gallery
  GALLERY: `${API_BASE}/gallery`,
  GALLERY_BY_ID: (id: string) => `${API_BASE}/gallery/${id}`,
  GALLERY_HIDE: (id: string) => `${API_BASE}/gallery/${id}/hide`,
  GALLERY_REPORT: (galleryItemId: string) =>
    `${API_BASE}/gallery/${galleryItemId}/report`,
  ADMIN_GALLERY: `${API_BASE}/admin/gallery`,
  ADMIN_GALLERY_STATUS: (id: string) =>
    `${API_BASE}/admin/gallery/${id}/status`,

  // Reports
  ADMIN_REPORTS: `${API_BASE}/admin/reports`,
  ADMIN_REPORT_RESOLVE: (id: string) => `${API_BASE}/admin/reports/${id}`,

  // Blog
  BLOG: `${API_BASE}/blog`,
  BLOG_BY_SLUG: (slug: string) => `${API_BASE}/blog/${slug}`,
  BLOG_RATE: (slug: string) => `${API_BASE}/blog/${slug}/rating`,
  ADMIN_BLOG: `${API_BASE}/admin/blog`,
  ADMIN_BLOG_BY_ID: (id: string) => `${API_BASE}/admin/blog/${id}`,
  ADMIN_BLOG_PUBLISH: (id: string) => `${API_BASE}/admin/blog/${id}/publish`,
  ADMIN_BLOG_UNPUBLISH: (id: string) =>
    `${API_BASE}/admin/blog/${id}/unpublish`,
  ADMIN_BLOG_RESTORE: (id: string) => `${API_BASE}/admin/blog/${id}/restore`,
  ADMIN_BLOG_HUB: `${API_BASE}/admin/blog/hub`,

  // Photo session ideas
  PHOTO_SESSION_IDEAS: `${API_BASE}/ideas`,
  PHOTO_SESSION_IDEA: (slug: string) => `${API_BASE}/ideas/${slug}`,
  ADMIN_PHOTO_SESSION_IDEAS: `${API_BASE}/admin/ideas`,
  ADMIN_PHOTO_SESSION_IDEAS_HUB: `${API_BASE}/admin/ideas/hub`,
  ADMIN_PHOTO_SESSION_IDEA: (id: string) => `${API_BASE}/admin/ideas/${id}`,
  ADMIN_PHOTO_SESSION_IDEA_PUBLISH: (id: string) =>
    `${API_BASE}/admin/ideas/${id}/publish`,
  ADMIN_PHOTO_SESSION_IDEA_UNPUBLISH: (id: string) =>
    `${API_BASE}/admin/ideas/${id}/unpublish`,
  ADMIN_PHOTO_SESSION_IDEA_RESTORE: (id: string) =>
    `${API_BASE}/admin/ideas/${id}/restore`,

  // Photo session styles
  PHOTO_SESSION_STYLES: `${API_BASE}/styles`,
  PHOTO_SESSION_STYLE: (slug: string) => `${API_BASE}/styles/${slug}`,
  ADMIN_PHOTO_SESSION_STYLES: `${API_BASE}/admin/styles`,
  ADMIN_PHOTO_SESSION_STYLES_HUB: `${API_BASE}/admin/styles/hub`,
  ADMIN_PHOTO_SESSION_STYLE: (id: string) => `${API_BASE}/admin/styles/${id}`,
  ADMIN_PHOTO_SESSION_STYLE_PUBLISH: (id: string) =>
    `${API_BASE}/admin/styles/${id}/publish`,
  ADMIN_PHOTO_SESSION_STYLE_UNPUBLISH: (id: string) =>
    `${API_BASE}/admin/styles/${id}/unpublish`,
  ADMIN_PHOTO_SESSION_STYLE_RESTORE: (id: string) =>
    `${API_BASE}/admin/styles/${id}/restore`,

  // AI tools
  AI_TOOLS: `${API_BASE}/ai-tools`,
  ADMIN_AI_TOOLS_HUB: `${API_BASE}/admin/ai-tools/hub`,
  AI_TOOL_PAGE_BY_SLUG: (slug: string) => `${API_BASE}/ai-tools/${slug}`,
  ADMIN_AI_TOOL_PAGES: `${API_BASE}/admin/ai-tools/pages`,
  ADMIN_AI_TOOL_PAGE_BY_ID: (id: string) =>
    `${API_BASE}/admin/ai-tools/pages/${id}`,
  ADMIN_AI_TOOL_PAGE_PUBLISH: (id: string) =>
    `${API_BASE}/admin/ai-tools/pages/${id}/publish`,
  ADMIN_AI_TOOL_PAGE_UNPUBLISH: (id: string) =>
    `${API_BASE}/admin/ai-tools/pages/${id}/unpublish`,
  ADMIN_AI_TOOL_PAGE_RESTORE: (id: string) =>
    `${API_BASE}/admin/ai-tools/pages/${id}/restore`,

  // Nano Banana
  NANO_BANANA: `${API_BASE}/nano-banana`,
  NANO_BANANA_BY_SLUG: (slug: string) => `${API_BASE}/nano-banana/${slug}`,
  ADMIN_NANO_BANANA: `${API_BASE}/admin/nano-banana`,
  ADMIN_NANO_BANANA_BY_ID: (id: string) =>
    `${API_BASE}/admin/nano-banana/${id}`,
  ADMIN_NANO_BANANA_PUBLISH: (id: string) =>
    `${API_BASE}/admin/nano-banana/${id}/publish`,
  ADMIN_NANO_BANANA_UNPUBLISH: (id: string) =>
    `${API_BASE}/admin/nano-banana/${id}/unpublish`,
  ADMIN_NANO_BANANA_RESTORE: (id: string) =>
    `${API_BASE}/admin/nano-banana/${id}/restore`,
  ADMIN_NANO_BANANA_HUB: `${API_BASE}/admin/nano-banana/hub`,

  // CMS
  CMS_PAGE: (slug: string) => `${API_BASE}/cms/pages/${slug}`,
  ADMIN_CMS_PAGES: `${API_BASE}/admin/cms/pages`,
  ADMIN_CMS_PAGE_BY_SLUG: (slug: string) =>
    `${API_BASE}/admin/cms/pages/by-slug/${slug}`,
  ADMIN_CMS_PAGE: (id: string) => `${API_BASE}/admin/cms/pages/${id}`,
  ADMIN_CMS_PAGE_BY_ID: (id: string) => `${API_BASE}/admin/cms/pages/${id}`,

  // Redirects
  REDIRECTS: `${API_BASE}/redirects`,

  // SEO
  SITEMAP: `${API_BASE}/seo/sitemap.xml`,
  IMAGE_SITEMAP: `${API_BASE}/seo/image-sitemap.xml`,

  // Admin
  ADMIN_STATS_OVERVIEW: `${API_BASE}/admin/stats/overview`,
  ADMIN_STATS_DAILY: `${API_BASE}/admin/stats/daily`,
  ADMIN_USERS: `${API_BASE}/admin/users`,
  ADMIN_USER_BY_ID: (id: string) => `${API_BASE}/admin/users/${id}`,
  ADMIN_USER_ROLE: (id: string) => `${API_BASE}/admin/users/${id}/role`,
  ADMIN_AUDIT: `${API_BASE}/admin/audit`,
  ADMIN_SETTINGS: `${API_BASE}/admin/settings`,
  ADMIN_SETTING_BY_KEY: (key: string) => `${API_BASE}/admin/settings/${key}`,

  // Homepage testimonials
  HOMEPAGE_TESTIMONIALS: `${API_BASE}/homepage/testimonials`,
  ADMIN_HOMEPAGE_TESTIMONIALS: `${API_BASE}/admin/homepage/testimonials`,
  ADMIN_HOMEPAGE_TESTIMONIAL_BY_ID: (id: string) =>
    `${API_BASE}/admin/homepage/testimonials/${id}`,

  // Homepage FAQ
  HOMEPAGE_FAQ: `${API_BASE}/homepage/faq`,
  ADMIN_HOMEPAGE_FAQ: `${API_BASE}/admin/homepage/faq`,
  ADMIN_HOMEPAGE_FAQ_BY_ID: (id: string) =>
    `${API_BASE}/admin/homepage/faq/${id}`,
  ADMIN_HOMEPAGE_FAQ_REORDER: `${API_BASE}/admin/homepage/faq/reorder`,

  // Feedback
  FEEDBACK: `${API_BASE}/feedback`,
  ADMIN_FEEDBACK: `${API_BASE}/admin/feedback`,
  ADMIN_FEEDBACK_BY_ID: (id: string) => `${API_BASE}/admin/feedback/${id}`,

  // Upload
  UPLOAD_IMAGE: `${API_BASE}/upload/image`,
  ADMIN_UPLOAD_ASSET: `${API_BASE}/admin/upload/asset`,
} as const;
