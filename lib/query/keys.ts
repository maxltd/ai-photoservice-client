export const queryKeys = {
  // Auth
  me: ["me"] as const,

  // Users
  users: {
    me: ["users", "me"] as const,
    aiProfilePhotos: ["users", "me", "ai-profile", "photos"] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    list: (params: object) => ["categories", "list", params] as const,
    bySlug: (slug: string) => ["categories", slug] as const,
  },

  // Presets
  presets: {
    all: ["presets"] as const,
    list: (params: object) => ["presets", "list", params] as const,
    bySlug: (slug: string) => ["presets", "slug", slug] as const,
    byId: (id: string) => ["presets", "id", id] as const,
  },

  // Photo Sessions
  photoSessions: {
    all: ["photo-sessions"] as const,
    list: (params: object) => ["photo-sessions", "list", params] as const,
    bySlug: (slug: string) => ["photo-sessions", slug] as const,
    byId: (id: string) => ["photo-sessions", "id", id] as const,
  },

  // Sessions (alias for photo sessions, used in admin P12)
  sessions: {
    all: ["photo-sessions"] as const,
    list: (params: object) => ["photo-sessions", "list", params] as const,
    bySlug: (slug: string) => ["photo-sessions", "slug", slug] as const,
    byId: (id: string) => ["photo-sessions", "id", id] as const,
  },

  // Generation
  generations: {
    all: ["generations"] as const,
    list: (params: object) => ["generations", "list", params] as const,
    byId: (id: string) => ["generations", id] as const,
  },

  // Pricing page
  pricingPage: {
    admin: ["admin", "pricing-page"] as const,
  },

  // Billing
  billing: {
    balance: ["billing", "balance"] as const,
    transactions: (params: object) =>
      ["billing", "transactions", params] as const,
    plans: ["billing", "plans"] as const,
    adminTransactions: (params: object) =>
      ["admin", "billing", "transactions", params] as const,
    adminPlans: ["admin", "billing", "plans"] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (params: object) => ["notifications", "list", params] as const,
  },

  // Gallery
  gallery: {
    all: ["gallery"] as const,
    list: (params: object) => ["gallery", "list", params] as const,
    byId: (id: string) => ["gallery", id] as const,
    admin: (params: object) => ["admin", "gallery", params] as const,
  },

  // Reports
  reports: {
    admin: (params: object) => ["admin", "reports", params] as const,
  },

  // Blog
  blog: {
    list: (params: object) => ["blog", "list", params] as const,
    bySlug: (slug: string) => ["blog", "slug", slug] as const,
    adminPages: (params: object) => ["admin", "blog", params] as const,
    adminById: (id: string) => ["admin", "blog", id] as const,
    hub: ["admin", "blog", "hub"] as const,
  },

  // Photo session ideas
  ideas: {
    bySlug: (slug: string) => ["ideas", slug] as const,
    adminPages: (params: object) => ["admin", "ideas", params] as const,
    adminPageById: (id: string) => ["admin", "ideas", id] as const,
  },

  // Photo session styles
  styles: {
    bySlug: (slug: string) => ["styles", slug] as const,
    adminPages: (params: object) => ["admin", "styles", params] as const,
    adminPageById: (id: string) => ["admin", "styles", id] as const,
  },

  // AI tools
  aiTools: {
    public: ["ai-tools"] as const,
    admin: ["admin", "ai-tools"] as const,
    hub: ["admin", "ai-tools", "hub"] as const,
    byId: (id: string) => ["admin", "ai-tools", id] as const,
  },

  // Nano Banana
  nanoBanana: {
    adminPages: (params: object) => ["admin", "nano-banana", params] as const,
    adminPageById: (id: string) => ["admin", "nano-banana", id] as const,
    hub: ["admin", "nano-banana", "hub"] as const,
  },

  // CMS
  cms: {
    bySlug: (slug: string) => ["cms", slug] as const,
    adminPages: (params: object) => ["admin", "cms", "pages", params] as const,
    adminPageById: (id: string) => ["admin", "cms", "pages", id] as const,
  },

  // Redirects
  redirects: {
    byPath: (fromPath: string) => ["redirects", fromPath] as const,
  },

  // SEO
  seo: {
    sitemap: ["seo", "sitemap"] as const,
  },

  // Admin
  admin: {
    overview: ["admin", "overview"] as const,
    daily: (days: number) => ["admin", "daily", days] as const,
    users: (params: object) => ["admin", "users", params] as const,
    userById: (id: string) => ["admin", "users", id] as const,
    audit: (params: object) => ["admin", "audit", params] as const,
    settings: ["admin", "settings"] as const,
    settingByKey: (key: string) => ["admin", "settings", key] as const,
  },

  // Homepage testimonials
  homepageTestimonials: {
    public: ["homepage", "testimonials", "public"] as const,
    admin: ["admin", "homepage", "testimonials"] as const,
  },

  homepageFaq: {
    public: ["homepage", "faq", "public"] as const,
    admin: ["admin", "homepage", "faq"] as const,
  },

  // Feedback
  feedback: {
    create: ["feedback", "create"] as const,
    admin: (params: object) => ["admin", "feedback", params] as const,
    byId: (id: string) => ["admin", "feedback", id] as const,
  },

  // Upload
  upload: {
    image: ["upload", "image"] as const,
    adminAsset: ["upload", "admin-asset"] as const,
  },
};
