'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, InventoryBatch } from '@/lib/types';
import { formatDaysUntil, getUrgencyLevel, getProductInitials } from '@/lib/utils';
import { Plus, X, Camera, Trash2, Package, ChevronRight, AlertTriangle, Clock, ShieldCheck, LogOut, Menu } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

interface Props {
  products: Product[];
  batches: InventoryBatch[];
  onAddProduct: (p: { name: string; category: string; sku: string; image_url: string }) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onNavigateToBatches: (id: string) => void;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}

export default function ProductCatalogView({ products, batches, onAddProduct, onDeleteProduct, onNavigateToBatches, onNavigateToDashboard, onLogout }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const batchCount = (pid: string) => batches.filter((b) => b.product_id === pid).length;
  const nearestExpiry = (pid: string) => {
    const pb = batches.filter((b) => b.product_id === pid);
    if (!pb.length) return null;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const sorted = [...pb].sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
    const exp = new Date(sorted[0].expiration_date); exp.setHours(0, 0, 0, 0);
    return { days: Math.ceil((exp.getTime() - now.getTime()) / 86400000) };
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-[var(--border-secondary)] bg-[var(--bg-card)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-primary)]"><Package className="h-3.5 w-3.5 text-[var(--text-inverse)]" strokeWidth={1.5} /></div>
          <span className="font-heading text-sm font-semibold text-[var(--text-primary)]">ExpTrack</span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 h-full w-64 bg-[var(--bg-card)] p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-heading text-sm font-semibold text-[var(--text-primary)]">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><X className="h-5 w-5" /></button>
              </div>
              <nav className="space-y-1">
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToDashboard(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><AlertTriangle className="h-4 w-4" strokeWidth={1.5} />Dashboard</button>
                <button className="flex w-full items-center gap-2 rounded-md bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)]"><Package className="h-4 w-4" strokeWidth={1.5} />Products</button>
              </nav>
              <div className="mt-auto border-t border-[var(--border-secondary)] pt-4">
                <button onClick={() => { setMobileMenuOpen(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><LogOut className="h-4 w-4" strokeWidth={1.5} />Sign out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] flex-shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-card)] p-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-primary)]"><Package className="h-3.5 w-3.5 text-[var(--text-inverse)]" strokeWidth={1.5} /></div>
          <span className="font-heading text-sm font-semibold text-[var(--text-primary)]">ExpTrack</span>
        </div>
        <nav className="flex-1 space-y-0.5">
          <button onClick={onNavigateToDashboard} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />Dashboard</button>
          <button className="flex w-full items-center gap-2 rounded-md bg-[var(--accent-primary)] px-2.5 py-1.5 text-sm font-medium text-[var(--text-inverse)]"><Package className="h-3.5 w-3.5" strokeWidth={1.5} />Products</button>
        </nav>
        <div className="mt-auto border-t border-[var(--border-secondary)] pt-3">
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start justify-between">
            <div>
              <button onClick={onNavigateToDashboard} className="mb-1.5 flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><ChevronLeft className="h-3 w-3" />Dashboard</button>
              <h1 className="font-heading text-lg font-semibold text-[var(--text-primary)] lg:text-xl">Products</h1>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] lg:text-sm">{products.length} item{products.length !== 1 ? 's' : ''}</p>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] btn-press"><Plus className="h-4 w-4" strokeWidth={2} />Add</motion.button>
          </motion.div>

          <div className="space-y-1.5">
            <AnimatePresence>
              {products.map((product, i) => {
                const bc = batchCount(product.id);
                const ne = nearestExpiry(product.id);
                const u = ne ? getUrgencyLevel(ne.days) : 'safe';
                const icon = u === 'critical' ? <AlertTriangle className="h-3 w-3 text-critical-accent" /> : u === 'warning' ? <Clock className="h-3 w-3 text-warning-accent" /> : <ShieldCheck className="h-3 w-3 text-safe-accent" />;
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: 0.025 * i }} onClick={() => onNavigateToBatches(product.id)} className="group cursor-pointer rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card)] p-3 hover:shadow-[var(--shadow-sm)] hover:border-[var(--border-primary)] card-hover">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md"><Image src={product.image_url} alt={product.name} width={36} height={36} className="h-full w-full object-cover" unoptimized /></div>
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[var(--bg-secondary)]"><span className="text-[10px] font-semibold text-[var(--text-secondary)]">{getProductInitials(product.name)}</span></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">{product.name}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                          <span>{product.category}</span>
                          {product.sku && <><span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" /><span>{product.sku}</span></>}
                          <span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" /><span>{bc} batch{bc !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                      {ne && <div className="hidden items-center gap-1 sm:flex">{icon}<span className="text-xs text-[var(--text-secondary)]">{formatDaysUntil(ne.days)}</span></div>}
                      <div className="flex items-center gap-0.5">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-critical-bg hover:text-critical-text transition-colors"><Trash2 className="h-3.5 w-3.5" /></motion.button>
                        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {products.length === 0 && (
              <div className="rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card)] p-8 text-center">
                <Package className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-3 font-heading text-sm font-medium text-[var(--text-secondary)]">No products yet</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Add your first product to start tracking.</p>
                <button onClick={() => setShowModal(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-sm font-medium text-[var(--text-inverse)]"><Plus className="h-3.5 w-3.5" />Add Product</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>{showModal && <AddModal onAdd={onAddProduct} onClose={() => setShowModal(false)} loading={loading} setLoading={setLoading} />}</AnimatePresence>
    </div>
  );
}

function AddModal({ onAdd, onClose, loading, setLoading }: { onAdd: (p: { name: string; category: string; sku: string; image_url: string }) => Promise<void>; onClose: () => void; loading: boolean; setLoading: (v: boolean) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setImageUrl(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await onAdd({ name, category, sku, image_url: imageUrl }); onClose(); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-5 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">Add Product</h2>
          <button onClick={onClose} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative h-24 w-full overflow-hidden rounded-lg">
              <Image src={imageUrl} alt="Preview" width={400} height={96} className="h-full w-full object-cover" unoptimized />
              <button onClick={() => setImageUrl('')} className="absolute top-1.5 right-1.5 rounded bg-black/50 p-1 text-white/80 hover:bg-black/70"><X className="h-3 w-3" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => ref.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]">
              <Camera className="h-4 w-4" strokeWidth={1.5} /><span className="text-[10px]">Add photo (optional)</span>
            </button>
          )}
          <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleImg} className="hidden" />
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)] appearance-none">
              <option value="">Select...</option>
              {['Dairy','Bakery','Produce','Seafood','Meat','Beverages','Frozen','Snacks','Supplements','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">SKU</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)]" />
          </div>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:opacity-50 btn-press">
            {loading ? <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Add Product'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
