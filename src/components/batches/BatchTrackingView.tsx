'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, InventoryBatch, UrgencyLevel } from '@/lib/types';
import { formatDate, formatDaysUntil, getProductInitials } from '@/lib/utils';
import { Plus, X, ChevronLeft, ArrowLeft, Trash2, Package, Layers, AlertTriangle, Clock, ShieldCheck, Minus, GripVertical, LogOut, Menu } from 'lucide-react';

interface Props {
  product: Product;
  batches: InventoryBatch[];
  onAddBatches: (batches: Omit<InventoryBatch, 'id' | 'created_at'>[]) => Promise<void>;
  onDeleteBatch: (id: string) => Promise<void>;
  onNavigateToDashboard: () => void;
  onNavigateToProducts: () => void;
  onLogout: () => void;
}

const UC: Record<UrgencyLevel, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  critical: { bg: 'bg-critical-bg', border: 'border-critical-border', text: 'text-critical-text', label: 'Critical', icon: <AlertTriangle className="h-3 w-3" /> },
  warning:  { bg: 'bg-warning-bg', border: 'border-warning-border', text: 'text-warning-text', label: 'Warning', icon: <Clock className="h-3 w-3" /> },
  safe:     { bg: 'bg-safe-bg', border: 'border-safe-border', text: 'text-safe-text', label: 'Safe', icon: <ShieldCheck className="h-3 w-3" /> },
};

function getDays(exp: string): number {
  const n = new Date(); n.setHours(0,0,0,0);
  const e = new Date(exp); e.setHours(0,0,0,0);
  return Math.ceil((e.getTime() - n.getTime()) / 86400000);
}

export default function BatchTrackingView({ product, batches, onAddBatches, onDeleteBatch, onNavigateToDashboard, onNavigateToProducts, onLogout }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sorted = [...batches].sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());
  const totalQty = batches.reduce((s, b) => s + b.quantity, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[220px] flex-shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-card)] p-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-primary)]"><Package className="h-3.5 w-3.5 text-[var(--text-inverse)]" strokeWidth={1.5} /></div>
          <span className="font-heading text-sm font-semibold text-[var(--text-primary)]">ExpTrack</span>
        </div>
        <nav className="flex-1 space-y-0.5">
          <button onClick={onNavigateToDashboard} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />Dashboard</button>
          <button onClick={onNavigateToProducts} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><Package className="h-3.5 w-3.5" strokeWidth={1.5} />Products</button>
        </nav>
        <div className="mt-auto border-t border-[var(--border-secondary)] pt-3">
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6 lg:px-8">
          <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} onClick={onNavigateToProducts} className="mb-4 flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"><ArrowLeft className="h-3 w-3" />Products</motion.button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)]"><span className="text-xs font-semibold text-[var(--text-secondary)]">{getProductInitials(product.name)}</span></div>
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-lg font-semibold text-[var(--text-primary)]">{product.name}</h1>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                  <span>{product.category}</span>{product.sku && <><span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" /><span>{product.sku}</span></>}
                  <span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" /><span>{batches.length} batch{batches.length !== 1 ? 'es' : ''}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" /><span>{totalQty} units</span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] btn-press"><Plus className="h-4 w-4" strokeWidth={2} />Add</motion.button>
            </div>
          </motion.div>

          <div className="space-y-1.5">
            <AnimatePresence>
              {sorted.map((b, i) => {
                const d = getDays(b.expiration_date);
                const u: UrgencyLevel = d <= 7 ? 'critical' : d <= 30 ? 'warning' : 'safe';
                const c = UC[u];
                return (
                  <motion.div key={b.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, scale: 0.97 }} transition={{ delay: 0.025 * i }} className={`group rounded-lg border ${c.border} ${c.bg} p-3 hover:shadow-[var(--shadow-sm)] card-hover`}>
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[var(--text-primary)]">{b.lot_number}</h3>
                          <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${c.text} ${c.bg}`}>{c.icon}{c.label}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{b.quantity} units</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-sm font-medium ${c.text}`}>{formatDaysUntil(d)}</p>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{formatDate(b.expiration_date)}</p>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDeleteBatch(b.id)} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-critical-bg hover:text-critical-text transition-colors"><Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" /></motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {batches.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card)] p-8 text-center">
                <Layers className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-3 font-heading text-sm font-medium text-[var(--text-secondary)]">No batches yet</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Add expiration batches for this product.</p>
                <button onClick={() => setShowModal(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3 py-1.5 text-sm font-medium text-[var(--text-inverse)]"><Plus className="h-3.5 w-3.5" />Add Batch</button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>{showModal && <RapidModal productName={product.name} onAdd={onAddBatches} onClose={() => setShowModal(false)} loading={loading} setLoading={setLoading} />}</AnimatePresence>
    </div>
  );
}

interface BE { lot_number: string; quantity: number; expiration_date: string; }

function RapidModal({ productName, onAdd, onClose, loading, setLoading }: { productName: string; onAdd: (b: Omit<InventoryBatch, 'id' | 'created_at'>[]) => Promise<void>; onClose: () => void; loading: boolean; setLoading: (v: boolean) => void }) {
  const [rows, setRows] = useState<BE[]>([{ lot_number: '', quantity: 1, expiration_date: '' }]);

  const addRow = () => setRows([...rows, { lot_number: '', quantity: 1, expiration_date: '' }]);
  const removeRow = (i: number) => { if (rows.length > 1) setRows(rows.filter((_, idx) => idx !== i)); };
  const update = (i: number, f: keyof BE, v: string | number) => { const u = [...rows]; u[i] = { ...u[i], [f]: v }; setRows(u); };

  const submit = async () => {
    const valid = rows.filter((r) => r.lot_number && r.quantity > 0 && r.expiration_date);
    if (!valid.length) return;
    setLoading(true);
    try { await onAdd(valid.map((r) => ({ ...r, product_id: '' }))); onClose(); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center sm:pb-0" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--border-secondary)] px-5 py-3.5">
          <div><h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">Add Batches</h2><p className="text-xs text-[var(--text-tertiary)]">{productName}</p></div>
          <button onClick={onClose} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-2.5">
            {rows.map((entry, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-primary)] p-2.5">
                <div className="flex items-start gap-2">
                  <GripVertical className="mt-2.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--text-tertiary)]" strokeWidth={1} />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1"><label className="mb-0.5 block text-[10px] font-medium text-[var(--text-tertiary)]">Lot</label><input type="text" value={entry.lot_number} onChange={(e) => update(i, 'lot_number', e.target.value)} placeholder="LOT-001" className="w-full rounded border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--text-secondary)]" /></div>
                      <div className="w-20"><label className="mb-0.5 block text-[10px] font-medium text-[var(--text-tertiary)]">Qty</label><input type="number" min="1" value={entry.quantity} onChange={(e) => update(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} className="w-full rounded border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]" /></div>
                    </div>
                    <div><label className="mb-0.5 block text-[10px] font-medium text-[var(--text-tertiary)]">Expires</label><input type="date" value={entry.expiration_date} onChange={(e) => update(i, 'expiration_date', e.target.value)} className="w-full rounded border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--text-secondary)]" /></div>
                  </div>
                  {rows.length > 1 && <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeRow(i)} className="mt-1.5 rounded p-1 text-[var(--text-tertiary)] hover:bg-critical-bg hover:text-critical-text"><Minus className="h-3.5 w-3.5" /></motion.button>}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.99 }} onClick={addRow} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[var(--border-primary)] py-2 text-xs font-medium text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]"><Plus className="h-3.5 w-3.5" />Add row</motion.button>
        </div>
        <div className="flex gap-2 border-t border-[var(--border-secondary)] px-5 py-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-[var(--border-primary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]">Cancel</button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={submit} disabled={loading} className="flex-1 rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] disabled:opacity-50 btn-press">
            {loading ? <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : `Add ${rows.filter(r => r.lot_number && r.expiration_date).length} Batch${rows.filter(r => r.lot_number && r.expiration_date).length !== 1 ? 'es' : ''}`}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
