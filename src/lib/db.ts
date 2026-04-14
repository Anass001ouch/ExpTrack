import { User, Product, InventoryBatch } from './types';

// ============================================================
// Mock Database Layer (localStorage-backed)
// Simulates Supabase-style async operations
// ============================================================

const KEYS = {
  users: 'exptrack_users',
  products: 'exptrack_products',
  batches: 'exptrack_batches',
  session: 'exptrack_session',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed demo data on first load
function seedDemoData(userId: string): void {
  const existingProducts = read<Product>(KEYS.products);
  if (existingProducts.length > 0) return;

  const now = Date.now();
  const day = 86400000;

  const products: Product[] = [
    {
      id: generateId(),
      name: 'Organic Whole Milk',
      category: 'Dairy',
      sku: 'DAI-001',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 30 * day).toISOString(),
    },
    {
      id: generateId(),
      name: 'Sourdough Bread',
      category: 'Bakery',
      sku: 'BAK-002',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 25 * day).toISOString(),
    },
    {
      id: generateId(),
      name: 'Greek Yogurt',
      category: 'Dairy',
      sku: 'DAI-003',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 20 * day).toISOString(),
    },
    {
      id: generateId(),
      name: 'Fresh Salmon Fillet',
      category: 'Seafood',
      sku: 'SEA-004',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 15 * day).toISOString(),
    },
    {
      id: generateId(),
      name: 'Baby Spinach',
      category: 'Produce',
      sku: 'PRD-005',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 10 * day).toISOString(),
    },
    {
      id: generateId(),
      name: 'Free-Range Eggs',
      category: 'Dairy',
      sku: 'DAI-006',
      image_url: '',
      user_id: userId,
      created_at: new Date(now - 8 * day).toISOString(),
    },
  ];
  write(KEYS.products, products);

  const batches: InventoryBatch[] = [
    // Critical: expired or < 7 days
    {
      id: generateId(),
      product_id: products[0].id,
      lot_number: 'LOT-MK-001',
      quantity: 24,
      expiration_date: new Date(now - 2 * day).toISOString().split('T')[0],
      created_at: new Date(now - 7 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[1].id,
      lot_number: 'LOT-BR-003',
      quantity: 12,
      expiration_date: new Date(now + 3 * day).toISOString().split('T')[0],
      created_at: new Date(now - 5 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[3].id,
      lot_number: 'LOT-SL-001',
      quantity: 8,
      expiration_date: new Date(now + 1 * day).toISOString().split('T')[0],
      created_at: new Date(now - 2 * day).toISOString(),
    },
    // Warning: 7-30 days
    {
      id: generateId(),
      product_id: products[0].id,
      lot_number: 'LOT-MK-002',
      quantity: 48,
      expiration_date: new Date(now + 14 * day).toISOString().split('T')[0],
      created_at: new Date(now - 3 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[2].id,
      lot_number: 'LOT-YG-001',
      quantity: 36,
      expiration_date: new Date(now + 22 * day).toISOString().split('T')[0],
      created_at: new Date(now - 4 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[4].id,
      lot_number: 'LOT-SP-002',
      quantity: 20,
      expiration_date: new Date(now + 18 * day).toISOString().split('T')[0],
      created_at: new Date(now - 3 * day).toISOString(),
    },
    // Safe: > 30 days
    {
      id: generateId(),
      product_id: products[5].id,
      lot_number: 'LOT-EG-001',
      quantity: 60,
      expiration_date: new Date(now + 45 * day).toISOString().split('T')[0],
      created_at: new Date(now - 2 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[1].id,
      lot_number: 'LOT-BR-004',
      quantity: 15,
      expiration_date: new Date(now + 60 * day).toISOString().split('T')[0],
      created_at: new Date(now - 1 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[3].id,
      lot_number: 'LOT-SL-002',
      quantity: 10,
      expiration_date: new Date(now + 35 * day).toISOString().split('T')[0],
      created_at: new Date(now - 1 * day).toISOString(),
    },
    {
      id: generateId(),
      product_id: products[2].id,
      lot_number: 'LOT-YG-002',
      quantity: 24,
      expiration_date: new Date(now + 50 * day).toISOString().split('T')[0],
      created_at: new Date(now).toISOString(),
    },
  ];
  write(KEYS.batches, batches);
}

// ---- Auth Operations ----

export async function registerUser(email: string, name: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const users = read<User>(KEYS.users);
  if (users.find((u) => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const user: User = {
    id: generateId(),
    email,
    name,
    password, // In a real app, this would be hashed
    created_at: new Date().toISOString(),
  };
  users.push(user);
  write(KEYS.users, users);
  seedDemoData(user.id);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const users = read<User>(KEYS.users);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  seedDemoData(user.id);
  return user;
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(KEYS.session);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setSession(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.session, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.session);
}

// ---- Product Operations ----

export async function getProducts(userId: string): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 100));
  return read<Product>(KEYS.products).filter((p) => p.user_id === userId);
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'user_id'>, userId: string): Promise<Product> {
  await new Promise((r) => setTimeout(r, 200));
  const products = read<Product>(KEYS.products);
  const newProduct: Product = {
    ...product,
    id: generateId(),
    user_id: userId,
    created_at: new Date().toISOString(),
  };
  products.push(newProduct);
  write(KEYS.products, products);
  return newProduct;
}

export async function deleteProduct(productId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const products = read<Product>(KEYS.products).filter((p) => p.id !== productId);
  write(KEYS.products, products);
  const batches = read<InventoryBatch>(KEYS.batches).filter((b) => b.product_id !== productId);
  write(KEYS.batches, batches);
}

// ---- Batch Operations ----

export async function getBatches(productIds: string[]): Promise<InventoryBatch[]> {
  await new Promise((r) => setTimeout(r, 100));
  const allBatches = read<InventoryBatch>(KEYS.batches);
  return allBatches.filter((b) => productIds.includes(b.product_id));
}

export async function getBatchesForProduct(productId: string): Promise<InventoryBatch[]> {
  await new Promise((r) => setTimeout(r, 100));
  return read<InventoryBatch>(KEYS.batches).filter((b) => b.product_id === productId);
}

export async function addBatches(batches: Omit<InventoryBatch, 'id' | 'created_at'>[]): Promise<InventoryBatch[]> {
  await new Promise((r) => setTimeout(r, 200));
  const existing = read<InventoryBatch>(KEYS.batches);
  const newBatches: InventoryBatch[] = batches.map((b) => ({
    ...b,
    id: generateId(),
    created_at: new Date().toISOString(),
  }));
  write(KEYS.batches, [...existing, ...newBatches]);
  return newBatches;
}

export async function deleteBatch(batchId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  const batches = read<InventoryBatch>(KEYS.batches).filter((b) => b.id !== batchId);
  write(KEYS.batches, batches);
}
