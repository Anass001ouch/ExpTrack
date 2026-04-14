'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, InventoryBatch, UrgencyLevel } from '@/lib/types';
import { formatDate, formatDaysUntil, getUrgencyLevel, getProductInitials } from '@/lib/utils';
import {
  Plus,
  X,
  ArrowLeft,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Minus,
  GripVertical,
} from 'lucide-react';

/* ================================================================
   BATCH TRACKING VIEW
   ================================================================ */

interface BatchTrackingViewProps {
  product: Product;
  batches: InventoryBatch[];
  onAddBatches: (batches: Omit<InventoryBatch, 'id' | 'created_at'>[]) => Promise<void>;
  onDeleteBatch: (batchId: string) => Promise<void>;
  onBack: () => void;
}

export default function BatchTrackingView({
  product,
  batches,
  onAddBatches,
  onDeleteBatch,
  onBack,
}: BatchTrackingViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sort batches by expiration date
  const sortedBatches = [...batches].sort(
    (a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
  );

  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-card)] p-6 lg:flex lg:flex-col">
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Package className="h-4 w-4 text-[var(--text-inverse)]" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-base font-semibold tracking-tight text-[var(--text-primary)]">
            ExpTrack
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
            Dashboard
          </button>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]">
            <Package className="h-4 w-4" strokeWidth={1.5} />
            Products
          </button>
        </nav>
        <div className="mt-auto border-t border-[var(--border-secondary)] pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)]">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Inventory Manager</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
          {/* Back nav */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </motion.button>

          {/* Product header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)]">
                <span className="text-sm font-bold text-[var(--text-secondary)]">
                  {getProductInitials(product.name)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {product.name}
                </h1>
                <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                  <span>{product.category}</span>
                  {product.sku && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" />
                      <span>{product.sku}</span>
                    </>
                  )}
                  <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" />
                  <span>{batches.length} batch{batches.length !== 1 ? 'es' : ''}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" />
                  <span>{totalQuantity} total units</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add Batch
              </motion.button>
            </div>
          </motion.div>

          {/* Batches list */}
          <div className="space-y-2">
            <AnimatePresence>
              {sortedBatches.map((batch, index) => {
                const days = getDaysUntil(batch.expiration_date);
                const urgency = getUrgencyLevel(days);
                const config = getUrgencyConfig(urgency);

                return (
                  <motion.div
                    key={batch.id}
                    layout
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: 0.03 * index }}
                    className={`group rounded-xl border ${config.border} ${config.bg} p-4 transition-all duration-200 hover:shadow-[var(--shadow-sm)]`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Left: Lot info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[var(--text-primary)]">
                            {batch.lot_number}
                          </h3>
                          <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.text} ${config.bg}`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                          {batch.quantity} units
                        </p>
                      </div>

                      {/* Right: Expiry */}
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-sm font-medium ${config.text}`}>
                          {formatDaysUntil(days)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                          {formatDate(batch.expiration_date)}
                        </p>
                      </div>

                      {/* Delete */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteBatch(batch.id)}
                        className="rounded-lg p-1.5 text-[var(--text-tertiary)] opacity-0 transition-all duration-200 hover:bg-critical-bg hover:text-critical-text group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {batches.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[var(--border-secondary)] bg-[var(--bg-card)] p-12 text-center"
              >
                <Layers className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-4 font-heading text-base font-medium text-[var(--text-secondary)]">
                  No batches yet
                </p>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  Add expiration batches for this product to start tracking.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-[var(--text-inverse)]"
                >
                  <Plus className="h-4 w-4" />
                  Add First Batch
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Rapid Batch Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <RapidBatchEntryModal
            productName={product.name}
            onAdd={onAddBatches}
            onClose={() => setShowAddModal(false)}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   RAPID BATCH ENTRY MODAL
   Allows adding multiple batches at once without page reload
   ================================================================ */

interface RapidBatchEntryModalProps {
  productName: string;
  onAdd: (batches: Omit<InventoryBatch, 'id' | 'created_at'>[]) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

interface BatchEntry {
  lot_number: string;
  quantity: number;
  expiration_date: string;
}

function RapidBatchEntryModal({
  productName,
  onAdd,
  onClose,
  isLoading,
  setIsLoading,
}: RapidBatchEntryModalProps) {
  const [entries, setEntries] = useState<BatchEntry[]>([
    { lot_number: '', quantity: 1, expiration_date: '' },
  ]);

  const addRow = () => {
    setEntries([...entries, { lot_number: '', quantity: 1, expiration_date: '' }]);
  };

  const removeRow = (index: number) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof BatchEntry, value: string | number) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validEntries = entries.filter(
      (entry) => entry.lot_number && entry.quantity > 0 && entry.expiration_date
    );
    if (validEntries.length === 0) return;

    setIsLoading(true);
    try {
      // We need the product_id, but it's not passed here.
      // Instead, we'll pass it from the parent. Let's adjust the interface.
      // For now, we'll call onAdd with the entries (parent will add product_id)
      const batches = validEntries.map((entry) => ({
        ...entry,
        product_id: '', // will be filled by parent
      }));
      await onAdd(batches);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm px-4 pb-4 sm:items-center sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)] max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-secondary)] px-6 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
              Add Batches
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
              for {productName} &middot; {entries.length} row{entries.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-primary)] p-3"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="mt-3 h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)]" strokeWidth={1} />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-medium tracking-wider text-[var(--text-tertiary)] uppercase">
                          Lot Number
                        </label>
                        <input
                          type="text"
                          value={entry.lot_number}
                          onChange={(e) => updateEntry(index, 'lot_number', e.target.value)}
                          placeholder="LOT-001"
                          className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                        />
                      </div>
                      <div className="w-24">
                        <label className="mb-1 block text-[10px] font-medium tracking-wider text-[var(--text-tertiary)] uppercase">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={(e) =>
                            updateEntry(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium tracking-wider text-[var(--text-tertiary)] uppercase">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        value={entry.expiration_date}
                        onChange={(e) => updateEntry(index, 'expiration_date', e.target.value)}
                        className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/10"
                      />
                    </div>
                  </div>
                  {entries.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeRow(index)}
                      className="mt-2 rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-critical-bg hover:text-critical-text transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add row button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={addRow}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-primary)] py-2.5 text-xs font-medium text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another row
          </motion.button>
        </div>

        {/* Footer actions */}
        <div className="border-t border-[var(--border-secondary)] px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              `Add ${entries.length} Batch${entries.length !== 1 ? 'es' : ''}`
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   HELPERS
   ================================================================ */

function getDaysUntil(expirationDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
}

function getUrgencyConfig(urgency: UrgencyLevel) {
  const configs: Record<UrgencyLevel, {
    bg: string;
    border: string;
    text: string;
    label: string;
    icon: React.ReactNode;
  }> = {
    critical: {
      bg: 'bg-critical-bg',
      border: 'border-critical-border',
      text: 'text-critical-text',
      label: 'Critical',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    warning: {
      bg: 'bg-warning-bg',
      border: 'border-warning-border',
      text: 'text-warning-text',
      label: 'Warning',
      icon: <Clock className="h-3 w-3" />,
    },
    safe: {
      bg: 'bg-safe-bg',
      border: 'border-safe-border',
      text: 'text-safe-text',
      label: 'Safe',
      icon: <ShieldCheck className="h-3 w-3" />,
    },
  };
  return configs[urgency];
}
