'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Product,
  InventoryBatch,
  EnrichedBatch,
  AppView,
} from '@/lib/types';
import {
  registerUser,
  loginUser,
  getSession,
  setSession,
  clearSession,
  getProducts,
  addProduct,
  deleteProduct,
  getBatches,
  addBatches,
  deleteBatch,
} from '@/lib/db';
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
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Load data — stable reference with useCallback
  const loadData = useCallback(async (userId: string) => {
    try {
      const prods = await getProducts(userId);
      const productIds = prods.map((p) => p.id);
      const batches = await getBatches(productIds);
      setProducts(prods);
      setAllBatches(batches);

      const enriched: EnrichedBatch[] = batches
        .map((batch) => {
          const product = prods.find((p) => p.id === batch.product_id);
          if (!product) return null;
          const days = daysUntilExpiry(batch.expiration_date);
          return {
            ...batch,
            product,
            urgency: getUrgencyLevel(days),
            days_until_expiry: days,
          };
        })
        .filter(Boolean) as EnrichedBatch[];

      const urgencyOrder = { critical: 0, warning: 1, safe: 2 };
      enriched.sort((a, b) => {
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.days_until_expiry - b.days_until_expiry;
      });

      setEnrichedBatches(enriched);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setView('dashboard');
    }
  }, []);

  // Load data when user is set
  useEffect(() => {
    if (!user) return;
    loadData(user.id);
  }, [user, loadData]);

  // Reload when navigating between views
  useEffect(() => {
    if (!user || view === 'login') return;
    loadData(user.id);
  }, [view, user, loadData]);

  // ── Auth Handlers ──

  const handleLogin = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      setSession(loggedUser);
      setView('dashboard');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const newUser = await registerUser(email, name, password);
      setUser(newUser);
      setSession(newUser);
      setView('dashboard');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setProducts([]);
    setAllBatches([]);
    setEnrichedBatches([]);
    setView('login');
    setAuthError('');
  };

  // ── Product Handlers ──

  const handleAddProduct = async (productData: {
    name: string;
    category: string;
    sku: string;
    image_url: string;
  }) => {
    if (!user) return;
    await addProduct(productData, user.id);
    await loadData(user.id);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    if (user) await loadData(user.id);
  };

  // ── Batch Handlers ──

  const handleAddBatches = async (
    batches: Omit<InventoryBatch, 'id' | 'created_at'>[]
  ) => {
    if (!selectedProductId) return;
    const batchesWithProduct = batches.map((b) => ({
      ...b,
      product_id: selectedProductId,
    }));
    await addBatches(batchesWithProduct);
    if (user) await loadData(user.id);
  };

  const handleDeleteBatch = async (batchId: string) => {
    await deleteBatch(batchId);
    if (user) await loadData(user.id);
  };

  // ── Navigation ──

  const navigateToProducts = () => {
    setView('products');
  };

  const navigateToBatches = async (productId: string) => {
    setSelectedProductId(productId);
    setView('batches');
  };

  const navigateBack = () => {
    if (view === 'batches') {
      setView('products');
    } else if (view === 'products') {
      setView('dashboard');
    }
  };

  // ── Get selected product for batch view ──

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || null
    : null;

  const selectedProductBatches = selectedProductId
    ? allBatches.filter((b) => b.product_id === selectedProductId)
    : [];

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'login' || view === 'register' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginView
              onLogin={handleLogin}
              onRegister={handleRegister}
              error={authError}
              isLoading={isAuthLoading}
            />
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full"
          >
            {/* Logout button (floating) */}
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 z-40 flex items-center gap-2 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] hover:shadow-[var(--shadow-md)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>

            {view === 'dashboard' && (
              <DashboardView
                enrichedBatches={enrichedBatches}
                onNavigateToProducts={navigateToProducts}
                onNavigateToBatches={navigateToBatches}
              />
            )}

            {view === 'products' && (
              <ProductCatalogView
                products={products}
                batches={allBatches}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onNavigateToBatches={navigateToBatches}
                onBack={navigateBack}
              />
            )}

            {view === 'batches' && selectedProduct && (
              <BatchTrackingView
                product={selectedProduct}
                batches={selectedProductBatches}
                onAddBatches={handleAddBatches}
                onDeleteBatch={handleDeleteBatch}
                onBack={navigateBack}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
