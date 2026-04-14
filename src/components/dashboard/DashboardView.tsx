'use client';

import { motion } from 'framer-motion';
import { EnrichedBatch, UrgencyLevel } from '@/lib/types';
import { formatDate, formatDaysUntil, getProductInitials } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Package,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  enrichedBatches: EnrichedBatch[];
  onNavigateToProducts: () => void;
  onNavigateToBatches: (productId: string) => void;
}

const urgencyConfig: Record<UrgencyLevel, {
  bg: string;
  border: string;
  text: string;
  accent: string;
  dot: string;
  label: string;
  icon: React.ReactNode;
}> = {
  critical: {
    bg: 'bg-critical-bg',
    border: 'border-critical-border',
    text: 'text-critical-text',
    accent: 'text-critical-accent',
    dot: 'bg-critical-accent',
    label: 'Critical',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  warning: {
    bg: 'bg-warning-bg',
    border: 'border-warning-border',
    text: 'text-warning-text',
    accent: 'text-warning-accent',
    dot: 'bg-warning-accent',
    label: 'Warning',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  safe: {
    bg: 'bg-safe-bg',
    border: 'border-safe-border',
    text: 'text-safe-text',
    accent: 'text-safe-accent',
    dot: 'bg-safe-accent',
    label: 'Safe',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
};

export default function DashboardView({
  enrichedBatches,
  onNavigateToProducts,
  onNavigateToBatches,
}: DashboardViewProps) {
  const criticalCount = enrichedBatches.filter((b) => b.urgency === 'critical').length;
  const warningCount = enrichedBatches.filter((b) => b.urgency === 'warning').length;
  const safeCount = enrichedBatches.filter((b) => b.urgency === 'safe').length;
  const uniqueProducts = new Set(enrichedBatches.map((b) => b.product_id)).size;
  const totalUnits = enrichedBatches.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-[var(--border-secondary)] bg-[var(--bg-card)] p-6 lg:flex lg:flex-col">
        {/* Brand */}
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Package className="h-4 w-4 text-[var(--text-inverse)]" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-base font-semibold tracking-tight text-[var(--text-primary)]">
            ExpTrack
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <button className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-medium text-[var(--text-inverse)]">
            <Layers className="h-4 w-4" strokeWidth={1.5} />
            Dashboard
          </button>
          <button
            onClick={onNavigateToProducts}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-ghost)] hover:text-[var(--text-primary)]"
          >
            <Package className="h-4 w-4" strokeWidth={1.5} />
            Products
          </button>
        </nav>

        {/* User info area */}
        <div className="mt-auto border-t border-[var(--border-secondary)] pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)]">
              U
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">Inventory Manager</p>
              <p className="truncate text-xs text-[var(--text-tertiary)]">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Expiration Command
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Prioritized view of all inventory batches, sorted by urgency.
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <StatCard
              label="Critical"
              value={criticalCount}
              bgClass="bg-critical-bg"
              textClass="text-critical-text"
              dotClass="bg-critical-accent"
            />
            <StatCard
              label="Warning"
              value={warningCount}
              bgClass="bg-warning-bg"
              textClass="text-warning-text"
              dotClass="bg-warning-accent"
            />
            <StatCard
              label="Safe"
              value={safeCount}
              bgClass="bg-safe-bg"
              textClass="text-safe-text"
              dotClass="bg-safe-accent"
            />
            <StatCard
              label="Total Units"
              value={totalUnits}
              bgClass="bg-[var(--bg-secondary)]"
              textClass="text-[var(--text-primary)]"
              dotClass="bg-[var(--text-tertiary)]"
            />
          </motion.div>

          {/* Overview info bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6 flex items-center gap-3 text-xs text-[var(--text-tertiary)]"
          >
            <span>{uniqueProducts} products tracked</span>
            <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" />
            <span>{enrichedBatches.length} active batches</span>
            <span className="h-1 w-1 rounded-full bg-[var(--border-primary)]" />
            <span>Sorted by expiration date</span>
          </motion.div>

          {/* Batch List */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            {enrichedBatches.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border-secondary)] bg-[var(--bg-card)] p-12 text-center">
                <Package className="mx-auto h-10 w-10 text-[var(--text-tertiary)]" strokeWidth={1} />
                <p className="mt-4 font-heading text-base font-medium text-[var(--text-secondary)]">
                  No batches tracked yet
                </p>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  Add products and their expiration batches to get started.
                </p>
                <button
                  onClick={onNavigateToProducts}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] hover:underline"
                >
                  Go to Products
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              enrichedBatches.map((batch, index) => {
                const config = urgencyConfig[batch.urgency];
                return (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * Math.min(index, 12) }}
                    onClick={() => onNavigateToBatches(batch.product_id)}
                    className={`group cursor-pointer rounded-xl border ${config.border} ${config.bg} p-4 transition-all duration-200 hover:shadow-[var(--shadow-md)]`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product avatar */}
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${config.bg} border ${config.border}`}
                      >
                        <span className={`text-xs font-semibold ${config.text}`}>
                          {getProductInitials(batch.product.name)}
                        </span>
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {batch.product.name}
                          </h3>
                          <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.text} ${config.bg}`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                          Lot {batch.lot_number} &middot; {batch.quantity} units
                        </p>
                      </div>

                      {/* Expiration info */}
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-sm font-medium ${config.text}`}>
                          {formatDaysUntil(batch.days_until_expiry)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                          {formatDate(batch.expiration_date)}
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Bottom spacing */}
          <div className="h-16" />
        </div>
      </main>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  bgClass,
  textClass,
  dotClass,
}: {
  label: string;
  value: number;
  bgClass: string;
  textClass: string;
  dotClass: string;
}) {
  return (
    <div className={`rounded-xl ${bgClass} p-4`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </span>
      </div>
      <p className={`font-heading text-2xl font-semibold ${textClass}`}>{value}</p>
    </div>
  );
}
