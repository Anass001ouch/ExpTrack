import { User, Product, InventoryBatch } from './types';

const KEYS = {
  users: 'exptrack_users',
  products: 'exptrack_products',
  batches: 'exptrack_batches',
  session: 'exptrack_session',
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}



export async function registerUser(email: string, name: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const users = read<User>(KEYS.users);
  if (users.find((u) => u.email === email)) throw new Error('An account with this email already exists.');
  const user: User = { id: genId(), email, name, password, created_at: new Date().toISOString() };
  users.push(user);
  write(KEYS.users, users);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const users = read<User>(KEYS.users);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password.');
  return user;
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  try { const d = localStorage.getItem(KEYS.session); return d ? JSON.parse(d) : null; } catch { return null; }
}

export function setSession(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.session, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.session);
}

export async function getProducts(userId: string): Promise<Product[]> {
  await new Promise((r) => setTimeout(r, 50));
  return read<Product>(KEYS.products).filter((p) => p.user_id === userId);
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'user_id'>, userId: string): Promise<Product> {
  await new Promise((r) => setTimeout(r, 100));
  const prods = read<Product>(KEYS.products);
  const np: Product = { ...product, id: genId(), user_id: userId, created_at: new Date().toISOString() };
  prods.push(np);
  write(KEYS.products, prods);
  return np;
}

export async function deleteProduct(pid: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  write(KEYS.products, read<Product>(KEYS.products).filter((p) => p.id !== pid));
  write(KEYS.batches, read<InventoryBatch>(KEYS.batches).filter((b) => b.product_id !== pid));
}

export async function getBatches(productIds: string[]): Promise<InventoryBatch[]> {
  await new Promise((r) => setTimeout(r, 50));
  return read<InventoryBatch>(KEYS.batches).filter((b) => productIds.includes(b.product_id));
}

export async function addBatches(batches: Omit<InventoryBatch, 'id' | 'created_at'>[]): Promise<InventoryBatch[]> {
  await new Promise((r) => setTimeout(r, 100));
  const existing = read<InventoryBatch>(KEYS.batches);
  const nb: InventoryBatch[] = batches.map((b) => ({ ...b, id: genId(), created_at: new Date().toISOString() }));
  write(KEYS.batches, [...existing, ...nb]);
  return nb;
}

export async function deleteBatch(bid: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  write(KEYS.batches, read<InventoryBatch>(KEYS.batches).filter((b) => b.id !== bid));
}

export interface ExportData {
  version: number;
  exportedAt: string;
  user: User | null;
  products: Product[];
  batches: InventoryBatch[];
}

export function exportAllData(userId: string): ExportData {
  const users = read<User>(KEYS.users);
  const user = users.find((u) => u.id === userId) || null;
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: user ? { ...user, password: '[REDACTED]' } : null,
    products: read<Product>(KEYS.products).filter((p) => p.user_id === userId),
    batches: read<InventoryBatch>(KEYS.batches).filter((b) => {
      const prods = read<Product>(KEYS.products);
      return prods.some((p) => p.id === b.product_id && p.user_id === userId);
    }),
  };
}

export async function importAllData(data: ExportData, userId: string): Promise<{ products: number; batches: number }> {
  await new Promise((r) => setTimeout(r, 100));

  const existingProds = read<Product>(KEYS.products);
  const existingBatches = read<InventoryBatch>(KEYS.batches);

  // Create mapping for old product IDs to new IDs
  const productIdMap: Record<string, string> = {};

  const newProducts: Product[] = data.products.map((p) => {
    const newId = genId();
    productIdMap[p.id] = newId;
    return { ...p, id: newId, user_id: userId, created_at: new Date().toISOString() };
  });

  const newBatches: InventoryBatch[] = data.batches.map((b) => ({
    ...b,
    id: genId(),
    product_id: productIdMap[b.product_id] || b.product_id,
    created_at: new Date().toISOString(),
  }));

  write(KEYS.products, [...existingProds, ...newProducts]);
  write(KEYS.batches, [...existingBatches, ...newBatches]);

  return { products: newProducts.length, batches: newBatches.length };
}
