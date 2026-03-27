import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  date,
  timestamp,
  jsonb,
  primaryKey,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

// ── Auth Tables (Global — sem tenantId) ─────────────────────

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: varchar("role", { length: 20 }).notNull().default("garcom"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ── Multi-Tenancy ───────────────────────────────────────────

export const tenants = pgTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: text("parent_id").references((): any => tenants.id),
  logo: text("logo"),
  primaryColor: varchar("primary_color", { length: 20 }).default("#1a365d"),
  secondaryColor: varchar("secondary_color", { length: 20 }).default("#e2e8f0"),
  customDomain: varchar("custom_domain", { length: 255 }),
  plan: varchar("plan", { length: 50 }).default("starter"),
  active: boolean("active").default(true),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantUsers = pgTable(
  "tenant_users",
  {
    id: serial("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).default("staff"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique().on(table.tenantId, table.userId)]
);

// ── Business Tables ─────────────────────────────────────────

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  visits: integer("visits").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  lastVisit: date("last_visit"),
  notes: text("notes").default(""),
  tags: text("tags").array().default([]),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "cascade",
  }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  guests: integer("guests").notNull(),
  tableName: varchar("table_name", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes").default(""),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "cascade",
  }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  items: jsonb("items").notNull().default([]),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).default("preparing"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 50 }),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Menu Tables ─────────────────────────────────────────────

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").default(""),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => menuCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(""),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").default(true),
  image: text("image"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Notifications ───────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("info"),
  read: boolean("read").default(false),
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Webhook Tables ──────────────────────────────────────────

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  secret: varchar("secret", { length: 255 }),
  events: text("events").array().default([]),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  webhookId: integer("webhook_id").references(() => webhooks.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 100 }).notNull(),
  payload: jsonb("payload"),
  statusCode: integer("status_code"),
  response: text("response"),
  success: boolean("success").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Restaurant Settings ─────────────────────────────────────

export const restaurantSettings = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull().default("Meu Restaurante"),
  slug: varchar("slug", { length: 100 }).unique(),
  logo: text("logo"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  openingHours: jsonb("opening_hours").default({}),
  currency: varchar("currency", { length: 10 }).default("BRL"),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  maxReservationsPerSlot: integer("max_reservations_per_slot").default(10),
  reservationDuration: integer("reservation_duration_minutes").default(120),
  autoConfirmReservations: boolean("auto_confirm_reservations").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 100 }).notNull().unique(),
  enabled: boolean("enabled").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Gamification & Training Tables ──────────────────────────

export const employeeProfiles = pgTable("employee_profiles", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  displayName: varchar("display_name", { length: 255 }),
  avatar: text("avatar"),
  totalXp: integer("total_xp").default(0),
  level: integer("level").default(1),
  streak: integer("streak").default(0),
  lastActivityDate: date("last_activity_date"),
  coursesCompleted: integer("courses_completed").default(0),
  badgesEarned: integer("badges_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("iniciante"),
  pillbitsUrl: text("pillbits_url"),
  thumbnailUrl: text("thumbnail_url"),
  durationMinutes: integer("duration_minutes").default(5),
  xpReward: integer("xp_reward").default(50),
  requiredLevel: integer("required_level").default(1),
  mandatory: boolean("mandatory").default(false),
  active: boolean("active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("enrolled"),
  progress: integer("progress").default(0),
  score: integer("score"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  sourceId: varchar("source_id", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  xpReward: integer("xp_reward").default(100),
  criteria: jsonb("criteria"),
  rarity: varchar("rarity", { length: 20 }).default("common"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeeBadges = pgTable("employee_badges", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  goal: jsonb("goal").notNull(),
  xpReward: integer("xp_reward").default(200),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeParticipations = pgTable("challenge_participations", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  currentProgress: integer("current_progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Module: DIAGNOSTICO ─────────────────────────────────────

export const diagnostics = pgTable("diagnostics", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  createdBy: text("created_by").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"),
  answers: jsonb("answers").default({}),
  scores: jsonb("scores").default({}),
  overallScore: decimal("overall_score", { precision: 4, scale: 2 }),
  report: jsonb("report"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diagnosticTemplates = pgTable("diagnostic_templates", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sections: jsonb("sections").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Module: COMANDO ─────────────────────────────────────────

export const sops = pgTable("sops", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  content: text("content"),
  version: integer("version").default(1),
  status: varchar("status", { length: 20 }).default("draft"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  url: text("url"),
  metadata: jsonb("metadata").default({}),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingChecklists = pgTable("onboarding_checklists", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  items: jsonb("items").notNull(),
  role: varchar("role", { length: 50 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  checklistId: integer("checklist_id")
    .notNull()
    .references(() => onboardingChecklists.id, { onDelete: "cascade" }),
  completedItems: jsonb("completed_items").default([]),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Module: CLONES ──────────────────────────────────────────

export const clones = pgTable("clones", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  department: varchar("department", { length: 100 }),
  status: varchar("status", { length: 20 }).default("training"),
  config: jsonb("config").default({}),
  phoneNumber: varchar("phone_number", { length: 50 }),
  stats: jsonb("stats").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cloneKnowledgeBase = pgTable("clone_knowledge_base", {
  id: serial("id").primaryKey(),
  cloneId: integer("clone_id")
    .notNull()
    .references(() => clones.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Module: AUTOMACOES ──────────────────────────────────────

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  trigger: jsonb("trigger").default({}),
  actions: jsonb("actions").default([]),
  active: boolean("active").default(true),
  executionCount: integer("execution_count").default(0),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const automationLogs = pgTable("automation_logs", {
  id: serial("id").primaryKey(),
  automationId: integer("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  executedAt: timestamp("executed_at").defaultNow(),
});

// ── Module: RECEITAS (Loyalty) ──────────────────────────────

export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("points"),
  rules: jsonb("rules").default({}),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyBalances = pgTable("loyalty_balances", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  programId: integer("program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  points: integer("points").default(0),
  tier: varchar("tier", { length: 50 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  programId: integer("program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(),
  points: integer("points").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});
