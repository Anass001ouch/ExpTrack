'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Product, InventoryBatch, EnrichedBatch, AppView } from '@/lib/types';
import { registerUser, loginUser, getSession, setSession, clearSession, getProducts, addProduct, deleteProduct, getBatches, addBatches, deleteBatch } from '@/lib/db';
import { daysUntilExpiry, getUrgencyLevel } from '@/lib/utils';
import LoginView from '@/components/login/LoginView';
import DashboardView from '@/components/dashboard/DashboardView';
import ProductCatalogView from '@/components/products/ProductCatalogView';
import BatchTrackingView from '@/components/batches/BatchTrackingView';
import { LogOut } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<AppView>('login');
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allBatches, setAllBatches] = useState<InventoryBatch[]>([]);
  const [enrichedBatches, setEnrichedBatches] = useState<EnrichedBatch[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const load = useCallback(async (userId: string) => {
    try {
      const prods = await getProducts(userId);
      const pids = prods.map((p) => p.id);
      const bats = await getBatches(pids);
      setProducts(prods);
      setAllBatches(bats);
      const enriched: EnrichedBatch[] = bats.map((b) => {
        const prod = prods.find((p) => p.id === b.product_id);
        if (!prod) return null;
        const days = daysUntilExpiry(b.expiration_date);
        return { ...b, product: prod, urgency: getUrgencyLevel(days), days_until_expiry: days };
      }).filter(Boolean) as EnrichedBatch[];
      const order = { critical: 0, warning: 1, safe: 2 };
      enriched.sort((a, b) => order[a.urgency] !== order[b.urgency] ? order[a.urgency] - order[b.urgency] : a.days_until_expiry - b.days_until_expiry);
      setEnrichedBatches(enriched);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const s = getSession();
    if (s) { setUser(s); setView('dashboard'); }
  }, []);

  useEffect(() => { if (user) load(user.id); }, [user, load]);
  useEffect(() => { if (user && view !== 'login') load(user.id); }, [view, user, load]);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true); setAuthError('');
    try { const u = await loginUser(email, password); setUser(u); setSession(u); setView('dashboard'); }
    catch (e) { setAuthError(e instanceof Error ? e.message : 'Login failed.'); }
    finally { setAuthLoading(false); }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setAuthLoading(true); setAuthError('');
    try { const u = await registerUser(email, name, password); setUser(u); setSession(u); setView('dashboard'); }
    catch (e) { setAuthError(e instanceof Error ? e.message : 'Registration failed.'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => { clearSession(); setUser(null); setProducts([]); setAllBatches([]); setEnrichedBatches([]); setView('login'); setAuthError(''); };

  const handleAddProduct = async (d: { name: string; category: string; sku: string; image_url: string }) => {
    if (!user) return;
    await addProduct(d, user.id);
    await load(user.id);
  };

  const handleDeleteProduct = async (pid: string) => {
    await deleteProduct(pid);
    if (user) await load(user.id);
  };

  const handleAddBatches = async (bats: Omit<InventoryBatch, 'id' | 'created_at'>[]) => {
    if (!selectedProductId) return;
    await addBatches(bats.map((b) => ({ ...b, product_id: selectedProductId })));
    if (user) await load(user.id);
  };

  const handleDeleteBatch = async (bid: string) => {
    await deleteBatch(bid);
    if (user) await load(user.id);
  };

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) || null : null;
  const selectedProductBatches = selectedProductId ? allBatches.filter((b) => b.product_id === selectedProductId) : [];

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LoginView onLogin={handleLogin} onRegister={handleRegister} error={authError} isLoading={authLoading} />
          </motion.div>
        ) : (
          <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative h-full">
            <button onClick={handleLogout} className="absolute top-4 right-4 z-40 flex items-center gap-2 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] shadow-[var(--shadow-sm)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)]">
              <LogOut className="h-3.5 w-3.5" />Sign Out
            </button>
            {view === 'dashboard' && <DashboardView enrichedBatches={enrichedBatches} onNavigateToProducts={() => setView('products')} onNavigateToBatches={(pid) => { setSelectedProductId(pid); setView('batches'); }} />}
            {view === 'products' && <ProductCatalogView products={products} batches={allBatches} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onNavigateToBatches={(pid) => { setSelectedProductId(pid); setView('batches'); }} onBack={() => setView('dashboard')} />}
            {view === 'batches' && selectedProduct && <BatchTrackingView product={selectedProduct} batches={selectedProductBatches} onAddBatches={handleAddBatches} onDeleteBatch={handleDeleteBatch} onBack={() => setView(view === 'batches' ? 'products' : 'dashboard')} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
