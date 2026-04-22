export type Role = "customer" | "staff" | "admin" | "driver";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_prep"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "cancelled"
  | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  price_pence: number;
  image_url: string | null;
  is_active: boolean;
  allergens?: string[] | null;
  dietary_tags?: string[] | null;
  category?: Category;
}

export interface Address {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  unit_price_pence: number;
  quantity: number;
  line_total_pence: number;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  customer_id: string;
  customer?: User;
  address?: Address;
  items: OrderItem[];
  subtotal_pence: number;
  delivery_fee_pence: number;
  vat_pence: number;
  total_pence: number;
  notes: string | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  created_at: string;
}

export interface PricingResult {
  subtotal_pence: number;
  delivery_fee_pence: number;
  vat_pence: number;
  total_pence: number;
  minimum_pence: number;
  lines: Array<{ product_id: string; name: string; quantity: number; unit_price_pence: number; line_total_pence: number }>;
}

export interface Paginated<T> {
  data: T[];
  meta: { next_cursor: string | null; prev_cursor: string | null };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}
