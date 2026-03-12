export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  notes: string;
  tags: string[];
  createdAt: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  table: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: "preparing" | "served" | "paid" | "cancelled";
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalCustomers: number;
  reservationsToday: number;
  revenueToday: number;
  revenueMonth: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string | null;
}
