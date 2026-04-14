'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, InventoryBatch } from '@/lib/types';
import { formatDaysUntil, getUrgencyLevel, getProductInitials } from '@/lib/utils';
import { Plus, X, Camera, ArrowLeft, Trash2, Package, ChevronRight, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  products: Product[];
  batches: InventoryBatch[];
  onAddProduct: (p: { name: string; category: string; sku: string; image_url: string }) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onNavigateToBatches: (id: string) => void;
  onBack: () => void;
}

export default function ProductCatalogView({ products, batches, onAddProduct, onDeleteProduct, onNavigateToBatches, onBack }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-card)] p-6 lg:flex lg:flex-col">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]"><Package className="h-4 w-4 text-[var(--text-inverse)]" strokeWidth={1.5} /></div>
          <span className="font-heading text-base font-semibold tracking-tight text-[var(--text-primary)]">ExpTrack</span>
        </div>
        <nav className="flex-1 space-y-1">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><AlertTriangle className="h-4 w-4" strokeWidth={1.5} />Dashboard</button>
          <button className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)]"><Package className="h-4 w-4" strokeWidth={1.5} />Products</button>
        </nav>
        <div className="mt-auto border-t border-[var(--border-secondary)] pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)]">U</div>
            <div><p className="text-sm font-medium text-[var(--text-primary)]">Inventory Manager</p><p className="text-xs text-[var(--text-tertiary)]">Pro Plan</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
            <div>
              <button onClick={onBack} className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><ArrowLeft className="h-3.5 w-3.5" />Dashboard</button>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Product Catalog</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{products.length} product{products.length !== 1 ? 's' : ''} in your inventory</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"><Plus className="h-4 w-4" strokeWidth={2} />Add Product</motion.button>
          </motion.div>

          <div className="space-y-2">
            <AnimatePresence>
              {products.map((product, i) => {
                const bc = batchCount(product.id);
                const ne = nearestExpiry(product.id);
                const u = ne ? getUrgencyLevel(ne.days) : 'safe';
                const icon = u === 'critical' ? <AlertTriangle className="h-3.5 w-3.5 text-critical-accent" /> : u === 'warning' ? <Clock className="h-3.5 w-3.5 text-warning-accent" /> : <ShieldCheck className="h-3.5 w-3.5 text-safe-accent" />;
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.03 * i }} onClick={() => onNavigateToBatches(product.id)} className="group cursor-pointer rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-card)] p-4 hover:shadow-[var(--shadow-md)] hover:border-[var(--border-primary)]">
                    <div className="flex items-center gap-4">
                      {product.image_url ? (
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg"><Image src={product.image_url} alt={product.name} width={44} height={44} className="h-full w-full object-cover" unoptimized /></div>
                      ) : (
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]"><span className="text-xs font-semibold text-[var(--text-secondary)]">{getProductInitials(product.name)}</span></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">{product.name}</h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                          <span>{product.category}</span>
                          {product.sku && <><span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" /><span>{product.sku}</span></>}
                          <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" /><span>{bc} batch{bc !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                      {ne && <div className="hidden items-center gap-1.5 sm:flex">{icon}<span className="text-xs text-[var(--text-secondary)]">{formatDaysUntil(ne.days)}</span></div>}
                      <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }} className="rounded-lg p-1.5 text-[var(--text-tertiary)] opacity-0 hover:bg-critical-bg hover:text-critical-text group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></motion.button>
                        <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {products.length === 0 && (
              <div className="rounded-2xl border border-[var(--border-secondary)] bg-[var(--bg-card)] p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-4 font-heading text-base font-medium text-[var(--text-secondary)]">No products yet</p>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">Add your first product to start tracking expiration dates.</p>
                <button onClick={() => setShowModal(true)} className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)]"><Plus className="h-4 w-4" />Add Product</button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-xl)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">Add New Product</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mb-5">
          {imageUrl ? (
            <div className="relative h-32 w-full overflow-hidden rounded-xl">
              <Image src={imageUrl} alt="Preview" width={400} height={128} className="h-full w-full object-cover" unoptimized />
              <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 rounded-lg bg-black/50 p-1.5 text-white/80 hover:bg-black/70"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button type="button" onClick={() => ref.current?.click()} className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]">
              <Camera className="h-5 w-5" strokeWidth={1.5} /><span className="text-xs">Upload a photo</span><span className="text-[10px]">Optional</span>
            </button>
          )}
          <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handleImg} className="hidden" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Organic Whole Milk" required className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] appearance-none">
              <option value="">Select category</option>
              {['Dairy','Bakery','Produce','Seafood','Meat','Beverages','Frozen','Snacks','Supplements','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">SKU / Barcode</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10" />
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }} className="w-full rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Add Product'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
