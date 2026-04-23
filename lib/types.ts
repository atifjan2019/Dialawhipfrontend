export type Role = "customer" | "staff" | "admin" | "driver";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type DeliveryTier = "standard" | "priority" | "super";

export type DocType =
  | "passport"
  | "driving_licence"
  | "residency_card"
  | "citizen_card"
  | "military_id";

export type VerificationDocStatus = "pending" | "approved" | "rejected";

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
  verification_status?: VerificationStatus;
  verified_at?: string | null;
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
  brand?: string | null;
  description: string | null;
  price_pence: number;
  image_url: string | null;
  is_active: boolean;
  is_age_restricted?: boolean;
  short_spec?: Record<string, string | number | boolean> | null;
  stock_count?: number | null;
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
  delivery_tier?: DeliveryTier;
  statement_of_use_accepted?: boolean;
  n2o_agreement_accepted?: boolean;
  notes: string | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  created_at: string;
}

export interface ServiceAreaInfo {
  postcode: string;
  available: boolean;
  postcode_prefix: string | null;
  delivery_fee_pence: number | null;
  eta_standard_minutes: number | null;
  eta_priority_minutes: number | null;
  priority_fee_pence: number | null;
  super_fee_pence: number | null;
}

export interface PricingResult {
  subtotal_pence: number;
  delivery_fee_pence: number;
  vat_pence: number;
  total_pence: number;
  minimum_pence: number;
  delivery_tier?: DeliveryTier;
  requires_id_verification?: boolean;
  service_area?: {
    postcode_prefix: string;
    eta_standard_minutes: number;
    eta_priority_minutes: number;
    priority_fee_pence: number;
    super_fee_pence: number;
  } | null;
  lines: Array<{
    product_id: string;
    name: string;
    brand?: string | null;
    quantity: number;
    is_age_restricted?: boolean;
    unit_price_pence: number;
    line_total_pence: number;
  }>;
}

export interface IdVerification {
  id: string;
  doc_type: DocType;
  status: VerificationDocStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string; phone: string | null; verification_status: VerificationStatus };
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
