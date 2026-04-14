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

function seedDemoData(userId: string): void {
  const existing = read<Product>(KEYS.products);
  if (existing.length > 0) return;
  const now = Date.now();
  const day = 86400000;
  const prods: Product[] = [
    { id: genId(), name: 'Organic Whole Milk', category: 'Dairy', sku: 'DAI-001', image_url: '', user_id: userId, created_at: new Date(now - 30 * day).toISOString() },
    { id: genId(), name: 'Sourdough Bread', category: 'Bakery', sku: 'BAK-002', image_url: '', user_id: userId, created_at: new Date(now - 25 * day).toISOString() },
    { id: genId(), name: 'Greek Yogurt', category: 'Dairy', sku: 'DAI-003', image_url: '', user_id: userId, created_at: new Date(now - 20 * day).toISOString() },
    { id: genId(), name: 'Fresh Salmon Fillet', category: 'Seafood', sku: 'SEA-004', image_url: '', user_id: userId, created_at: new Date(now - 15 * day).toISOString() },
    { id: genId(), name: 'Baby Spinach', category: 'Produce', sku: 'PRD-005', image_url: '', user_id: userId, created_at: new Date(now - 10 * day).toISOString() },
    { id: genId(), name: 'Free-Range Eggs', category: 'Dairy', sku: 'DAI-006', image_url: '', user_id: userId, created_at: new Date(now - 8 * day).toISOString() },
  ];
  write(KEYS.products, prods);
  const batches: InventoryBatch[] = [
    { id: genId(), product_id: prods[0].id, lot_number: 'LOT-MK-001', quantity: 24, expiration_date: new Date(now - 2 * day).toISOString().split('T')[0], created_at: new Date(now - 7 * day).toISOString() },
    { id: genId(), product_id: prods[1].id, lot_number: 'LOT-BR-003', quantity: 12, expiration_date: new Date(now + 3 * day).toISOString().split('T')[0], created_at: new Date(now - 5 * day).toISOString() },
    { id: genId(), product_id: prods[3].id, lot_number: 'LOT-SL-001', quantity: 8, expiration_date: new Date(now + 1 * day).toISOString().split('T')[0], created_at: new Date(now - 2 * day).toISOString() },
    { id: genId(), product_id: prods[0].id, lot_number: 'LOT-MK-002', quantity: 48, expiration_date: new Date(now + 14 * day).toISOString().split('T')[0], created_at: new Date(now - 3 * day).toISOString() },
    { id: genId(), product_id: prods[2].id, lot_number: 'LOT-YG-001', quantity: 36, expiration_date: new Date(now + 22 * day).toISOString().split('T')[0], created_at: new Date(now - 4 * day).toISOString() },
    { id: genId(), product_id: prods[4].id, lot_number: 'LOT-SP-002', quantity: 20, expiration_date: new Date(now + 18 * day).toISOString().split('T')[0], created_at: new Date(now - 3 * day).toISOString() },
    { id: genId(), product_id: prods[5].id, lot_number: 'LOT-EG-001', quantity: 60, expiration_date: new Date(now + 45 * day).toISOString().split('T')[0], created_at: new Date(now - 2 * day).toISOString() },
    { id: genId(), product_id: prods[1].id, lot_number: 'LOT-BR-004', quantity: 15, expiration_date: new Date(now + 60 * day).toISOString().split('T')[0], created_at: new Date(now - 1 * day).toISOString() },
    { id: genId(), product_id: prods[3].id, lot_number: 'LOT-SL-002', quantity: 10, expiration_date: new Date(now + 35 * day).toISOString().split('T')[0], created_at: new Date(now - 1 * day).toISOString() },
    { id: genId(), product_id: prods[2].id, lot_number: 'LOT-YG-002', quantity: 24, expiration_date: new Date(now + 50 * day).toISOString().split('T')[0], created_at: new Date(now).toISOString() },
  ];
  write(KEYS.batches, batches);
}

export async function registerUser(email: string, name: string, password: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  const users = read<User>(KEYS.users);
  if (users.find((u) => u.email === email)) throw new Error('An account with this email already exists.');
  const user: User = { id: genId(), email, name, password, created_at: new Date().toISOString() };
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
