'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnrichedBatch, UrgencyLevel } from '@/lib/types';
import { formatDate, formatDaysUntil, getProductInitials } from '@/lib/utils';
import { requestNotificationPermission, notifyExpiringProducts } from '@/lib/notifications';
import { AlertTriangle, Clock, ShieldCheck, ChevronRight, Package, Layers, LogOut, Bell, BellOff, Download, Upload, Menu, X } from 'lucide-react';
import { exportAllData, importAllData, ExportData } from '@/lib/db';

interface Props {
  enrichedBatches: EnrichedBatch[];
  userId: string;
  onNavigateToProducts: () => void;
  onNavigateToBatches: (productId: string) => void;
  onLogout: () => void;
  onDataImported: () => void;
}

const UC: Record<UrgencyLevel, { bg: string; border: string; text: string; label: string; icon: React.ReactNode }> = {
  critical: { bg: 'bg-critical-bg', border: 'border-critical-border', text: 'text-critical-text', label: 'Critical', icon: <AlertTriangle className="h-3 w-3" /> },
  warning:  { bg: 'bg-warning-bg', border: 'border-warning-border', text: 'text-warning-text', label: 'Warning', icon: <Clock className="h-3 w-3" /> },
  safe:     { bg: 'bg-safe-bg', border: 'border-safe-border', text: 'text-safe-text', label: 'Safe', icon: <ShieldCheck className="h-3 w-3" /> },
};

export default function DashboardView({ enrichedBatches, userId, onNavigateToProducts, onNavigateToBatches, onLogout, onDataImported }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cc = enrichedBatches.filter((b) => b.urgency === 'critical').length;
  const wc = enrichedBatches.filter((b) => b.urgency === 'warning').length;
  const sc = enrichedBatches.filter((b) => b.urgency === 'safe').length;
  const tu = enrichedBatches.reduce((s, b) => s + b.quantity, 0);
  const up = new Set(enrichedBatches.map((b) => b.product_id)).size;

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (notificationsEnabled && (cc > 0 || wc > 0)) {
      notifyExpiringProducts(cc, wc);
    }
  }, [cc, wc, notificationsEnabled]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted && (cc > 0 || wc > 0)) {
      notifyExpiringProducts(cc, wc);
    }
  };

  const handleExport = () => {
    const data = exportAllData(userId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exptrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      if (!data.products || !data.batches) {
        throw new Error('Invalid file format');
      }
      const result = await importAllData(data, userId);
      onDataImported();
      alert(`Imported ${result.products} products and ${result.batches} batches`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                <button className="flex w-full items-center gap-2 rounded-md bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)]"><Layers className="h-4 w-4" strokeWidth={1.5} />Dashboard</button>
                <button onClick={() => { setMobileMenuOpen(false); onNavigateToProducts(); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><Package className="h-4 w-4" strokeWidth={1.5} />Products</button>
              </nav>
              <div className="mt-6 border-t border-[var(--border-secondary)] pt-4 space-y-1">
                <button onClick={handleExport} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><Download className="h-4 w-4" strokeWidth={1.5} />Export Data</button>
                <label className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] cursor-pointer"><Upload className="h-4 w-4" strokeWidth={1.5} />Import Data<input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
              </div>
              <div className="mt-auto border-t border-[var(--border-secondary)] pt-4">
                <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)]"><LogOut className="h-4 w-4" strokeWidth={1.5} />Sign out</button>
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
          <button className="flex w-full items-center gap-2 rounded-md bg-[var(--accent-primary)] px-2.5 py-1.5 text-sm font-medium text-[var(--text-inverse)]"><Layers className="h-3.5 w-3.5" strokeWidth={1.5} />Dashboard</button>
          <button onClick={onNavigateToProducts} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><Package className="h-3.5 w-3.5" strokeWidth={1.5} />Products</button>
        </nav>
        <div className="border-t border-[var(--border-secondary)] pt-3 space-y-0.5">
          <button onClick={handleExport} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"><Download className="h-3.5 w-3.5" strokeWidth={1.5} />Export Data</button>
          <label className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)] cursor-pointer"><Upload className="h-3.5 w-3.5" strokeWidth={1.5} />Import Data<input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
        </div>
        <div className="mt-3 border-t border-[var(--border-secondary)] pt-3">
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="mx-auto max-w-3xl px-4 py-5 lg:px-8 lg:py-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="font-heading text-lg font-semibold text-[var(--text-primary)] lg:text-xl">Dashboard</h1>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] lg:text-sm">Batches sorted by urgency.</p>
            </div>
            <button
              onClick={handleEnableNotifications}
              className={`hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all btn-press sm:flex ${
                notificationsEnabled
                  ? 'bg-safe-bg text-safe-text border border-safe-border'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {notificationsEnabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
              {notificationsEnabled ? 'On' : 'Alerts'}
            </button>
          </motion.div>

          {importError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-lg border border-critical-border bg-critical-bg p-3 text-sm text-critical-text">
              {importError}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SC label="Critical" value={cc} bgCls="bg-critical-bg" txtCls="text-critical-text" dotCls="bg-critical-accent" />
            <SC label="Warning" value={wc} bgCls="bg-warning-bg" txtCls="text-warning-text" dotCls="bg-warning-accent" />
            <SC label="Safe" value={sc} bgCls="bg-safe-bg" txtCls="text-safe-text" dotCls="bg-safe-accent" />
            <SC label="Total" value={tu} bgCls="bg-[var(--bg-secondary)]" txtCls="text-[var(--text-primary)]" dotCls="bg-[var(--text-tertiary)]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-4 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span>{up} products</span><span className="h-0.5 w-0.5 rounded-full bg-[var(--border-primary)]" />
            <span>{enrichedBatches.length} batches</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="space-y-1.5">
            {enrichedBatches.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-secondary)] bg-[var(--bg-card)] p-8 text-center">
                <Package className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-3 font-heading text-sm font-medium text-[var(--text-secondary)]">No batches tracked yet</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">Add products and batches to get started.</p>
                <button onClick={onNavigateToProducts} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)] hover:underline">Add Products<ChevronRight className="h-3 w-3" /></button>
              </div>
            ) : enrichedBatches.map((batch, i) => {
              const c = UC[batch.urgency];
              return (
                <motion.div key={batch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.025 * Math.min(i, 10) }} onClick={() => onNavigateToBatches(batch.product_id)} className={`group cursor-pointer rounded-lg border ${c.border} ${c.bg} p-3 hover:shadow-[var(--shadow-sm)] card-hover`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${c.bg} border ${c.border}`}>
                      <span className={`text-[10px] font-semibold ${c.text}`}>{getProductInitials(batch.product.name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">{batch.product.name}</h3>
                        <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${c.text} ${c.bg}`}>{c.icon}{c.label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{batch.lot_number} · {batch.quantity} units</p>
                    </div>
                    <div className="hidden flex-shrink-0 text-right sm:block">
                      <p className={`text-sm font-medium ${c.text}`}>{formatDaysUntil(batch.days_until_expiry)}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{formatDate(batch.expiration_date)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          <div className="h-20 lg:h-16" />
        </div>
      </main>
    </div>
  );
}

function SC({ label, value, bgCls, txtCls, dotCls }: { label: string; value: number; bgCls: string; txtCls: string; dotCls: string }) {
  return (
    <div className={`rounded-lg ${bgCls} p-3`}>
      <div className="mb-1 flex items-center gap-1.5">
        <div className={`h-1 w-1 rounded-full ${dotCls}`} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{label}</span>
      </div>
      <p className={`font-heading text-xl font-semibold ${txtCls}`}>{value}</p>
    </div>
  );
}
