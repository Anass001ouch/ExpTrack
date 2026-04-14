export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  image_url: string;
  user_id: string;
  created_at: string;
}

export interface InventoryBatch {
  id: string;
  product_id: string;
  lot_number: string;
  quantity: number;
  expiration_date: string;
  created_at: string;
}

export type UrgencyLevel = 'critical' | 'warning' | 'safe';

export interface EnrichedBatch extends InventoryBatch {
  product: Product;
  urgency: UrgencyLevel;
  days_until_expiry: number;
}

export type AppView = 'login' | 'dashboard' | 'products' | 'batches';
