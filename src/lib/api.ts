import { Customer, Reservation, Order, MenuCategory, MenuItem } from "@/types";
import { toast } from "sonner";

const base = "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!res.ok || !json.success) {
    const message = json.error || "Erro na requisição";
    throw new Error(message);
  }

  return json.data as T;
}

// ── Customers ────────────────────────────────────────────────

interface RawCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  visits: number;
  total_spent: string;
  last_visit: string | null;
  notes: string;
  tags: string[];
  created_at: string;
}

function mapCustomer(c: RawCustomer): Customer {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email,
    phone: c.phone,
    visits: c.visits ?? 0,
    totalSpent: Number(c.total_spent ?? 0),
    lastVisit: c.last_visit ? String(c.last_visit).split("T")[0] : "",
    notes: c.notes || "",
    tags: c.tags || [],
    createdAt: c.created_at ? String(c.created_at).split("T")[0] : "",
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const data = await apiFetch<RawCustomer[]>(`${base}/customers`);
  return data.map(mapCustomer);
}

export async function createCustomer(data: Partial<Customer>) {
  const result = await apiFetch(`${base}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Cliente criado com sucesso");
  return result;
}

export async function updateCustomer(data: Partial<Customer> & { id: string }) {
  const result = await apiFetch(`${base}/customers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Cliente atualizado");
  return result;
}

export async function deleteCustomer(id: string) {
  await apiFetch(`${base}/customers?id=${id}`, { method: "DELETE" });
  toast.success("Cliente excluído");
}

// ── Reservations ─────────────────────────────────────────────

interface RawReservation {
  id: number;
  customer_id: number;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  table_name: string;
  status: string;
  notes: string;
}

function mapReservation(r: RawReservation): Reservation {
  return {
    id: String(r.id),
    customerId: String(r.customer_id),
    customerName: r.customer_name,
    date: r.date ? String(r.date).split("T")[0] : "",
    time: r.time,
    guests: r.guests,
    table: r.table_name,
    status: r.status as Reservation["status"],
    notes: r.notes || "",
  };
}

export async function fetchReservations(): Promise<Reservation[]> {
  const data = await apiFetch<RawReservation[]>(`${base}/reservations`);
  return data.map(mapReservation);
}

export async function createReservation(data: Partial<Reservation>) {
  const result = await apiFetch(`${base}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Reserva criada com sucesso");
  return result;
}

export async function updateReservation(data: Partial<Reservation> & { id: string }) {
  const result = await apiFetch(`${base}/reservations`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Reserva atualizada");
  return result;
}

export async function deleteReservation(id: string) {
  await apiFetch(`${base}/reservations?id=${id}`, { method: "DELETE" });
  toast.success("Reserva excluída");
}

// ── Orders ───────────────────────────────────────────────────

interface RawOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  items: unknown;
  total: string;
  date: string;
  status: string;
}

function mapOrder(o: RawOrder): Order {
  return {
    id: String(o.id),
    customerId: String(o.customer_id),
    customerName: o.customer_name,
    items: (typeof o.items === "string" ? JSON.parse(o.items) : o.items) as Order["items"],
    total: Number(o.total),
    date: o.date ? String(o.date).split("T")[0] : "",
    status: o.status as Order["status"],
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const data = await apiFetch<RawOrder[]>(`${base}/orders`);
  return data.map(mapOrder);
}

export async function fetchCustomerProfile(id: string) {
  return apiFetch<{
    customer: Record<string, unknown>;
    reservations: Record<string, unknown>[];
    orders: Record<string, unknown>[];
  }>(`${base}/customers/${id}`);
}

// ── Menu ────────────────────────────────────────────────────

interface RawMenuCategory {
  id: number;
  name: string;
  description: string;
  sort_order: number;
}

interface RawMenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string | null;
}

function mapCategory(c: RawMenuCategory): MenuCategory {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description || "",
    sortOrder: c.sort_order ?? 0,
  };
}

function mapMenuItem(m: RawMenuItem): MenuItem {
  return {
    id: String(m.id),
    categoryId: String(m.category_id),
    name: m.name,
    description: m.description || "",
    price: Number(m.price),
    available: m.available ?? true,
    image: m.image,
  };
}

export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  const data = await apiFetch<RawMenuCategory[]>(`${base}/menu`);
  return data.map(mapCategory);
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const data = await apiFetch<RawMenuItem[]>(`${base}/menu/items`);
  return data.map(mapMenuItem);
}

export async function createMenuCategory(data: { name: string; description?: string }) {
  const result = await apiFetch(`${base}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Categoria criada com sucesso");
  return result;
}

export async function createMenuItem(data: {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  available?: boolean;
}) {
  const result = await apiFetch(`${base}/menu/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Prato criado com sucesso");
  return result;
}

export async function updateMenuItem(data: {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  available?: boolean;
}) {
  const result = await apiFetch(`${base}/menu/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Prato atualizado");
  return result;
}

export async function deleteMenuItem(id: string) {
  await apiFetch(`${base}/menu/items?id=${id}`, { method: "DELETE" });
  toast.success("Prato excluído");
}

export async function toggleMenuItemAvailability(id: string) {
  const result = await apiFetch(`${base}/menu/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: Number(id), toggleAvailability: true }),
  });
  toast.success("Disponibilidade atualizada");
  return result;
}

// ── Analytics ──────────────────────────────────────────────

export async function fetchDashboardAnalytics(
  period: string,
  from?: string,
  to?: string
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ period });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch<Record<string, unknown>>(`${base}/analytics/dashboard?${params}`);
}

export async function fetchReport(
  type: string,
  from?: string,
  to?: string
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({ type });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch<Record<string, unknown>>(`${base}/analytics/reports?${params}`);
}

export async function fetchInsights(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`${base}/analytics/insights`);
}

// ── Notifications ──────────────────────────────────────────

export async function fetchNotifications() {
  return apiFetch<{ notifications: Record<string, unknown>[]; unreadCount: number }>(
    `${base}/notifications`
  );
}

export async function markNotificationRead(id: number) {
  return apiFetch(`${base}/notifications`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export async function markAllNotificationsRead() {
  return apiFetch(`${base}/notifications`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ all: true }),
  });
}

// ── Webhooks ──────────────────────────────────────────────
export async function fetchWebhooks() {
  return apiFetch<Record<string, unknown>[]>(`${base}/webhooks`);
}

export async function createWebhook(data: { name: string; url: string; events: string[] }) {
  const result = await apiFetch(`${base}/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Webhook criado");
  return result;
}

export async function updateWebhook(data: {
  id: number;
  name?: string;
  url?: string;
  events?: string[];
  active?: boolean;
}) {
  const result = await apiFetch(`${base}/webhooks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Webhook atualizado");
  return result;
}

export async function deleteWebhook(id: number) {
  await apiFetch(`${base}/webhooks?id=${id}`, { method: "DELETE" });
  toast.success("Webhook excluído");
}

export async function fetchWebhookLogs(webhookId: number) {
  return apiFetch<Record<string, unknown>[]>(`${base}/webhooks/logs?webhookId=${webhookId}`);
}

// ── Training ──────────────────────────────────────────────

export async function fetchCourses(category?: string, difficulty?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (difficulty) params.set("difficulty", difficulty);
  const qs = params.toString();
  return apiFetch<Record<string, unknown>[]>(`${base}/training/courses${qs ? `?${qs}` : ""}`);
}

export async function fetchCourse(id: string) {
  return apiFetch<Record<string, unknown>>(`${base}/training/courses/${id}`);
}

export async function createCourseApi(data: Record<string, unknown>) {
  const result = await apiFetch(`${base}/training/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Curso criado com sucesso");
  return result;
}

export async function fetchEnrollments() {
  return apiFetch<Record<string, unknown>[]>(`${base}/training/enrollments`);
}

export async function enrollInCourse(courseId: number) {
  const result = await apiFetch(`${base}/training/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId }),
  });
  toast.success("Inscrição realizada!");
  return result;
}

export async function updateCourseProgress(enrollmentId: number, progress: number, score?: number) {
  const result = await apiFetch(`${base}/training/enrollments/${enrollmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress, score }),
  });
  if (progress >= 100) toast.success("Curso concluído! XP adicionado.");
  return result;
}

// ── Gamification ──────────────────────────────────────────

export async function fetchGamificationProfile() {
  return apiFetch<Record<string, unknown>>(`${base}/gamification/profile`);
}

export async function fetchLeaderboard(limit = 20) {
  return apiFetch<Record<string, unknown>[]>(`${base}/gamification/leaderboard?limit=${limit}`);
}

export async function fetchBadges() {
  return apiFetch<Record<string, unknown>[]>(`${base}/gamification/badges`);
}

export async function fetchChallenges() {
  return apiFetch<Record<string, unknown>>(`${base}/gamification/challenges`);
}

export async function joinChallenge(challengeId: number) {
  const result = await apiFetch(`${base}/gamification/challenges/${challengeId}`, {
    method: "POST",
  });
  toast.success("Você entrou no desafio!");
  return result;
}

// ── Settings ──────────────────────────────────────────────
export async function fetchSettings() {
  return apiFetch<Record<string, unknown>>(`${base}/settings`);
}

export async function updateSettings(data: Record<string, unknown>) {
  const result = await apiFetch(`${base}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  toast.success("Configurações salvas");
  return result;
}

export async function fetchFeatureFlags() {
  return apiFetch<Record<string, unknown>[]>(`${base}/settings/flags`);
}

export async function toggleFeatureFlag(key: string, enabled: boolean, description?: string) {
  const result = await apiFetch(`${base}/settings/flags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, enabled, description }),
  });
  toast.success("Flag atualizada");
  return result;
}
