import { UrgencyLevel } from './types';

/**
 * Calculate days until expiration for a given date string.
 */
export function daysUntilExpiry(expirationDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

/**
 * Determine urgency level based on days until expiration.
 * Critical: expired or < 7 days
 * Warning: 7-30 days
 * Safe: > 30 days
 */
export function getUrgencyLevel(daysUntil: number): UrgencyLevel {
  if (daysUntil <= 7) return 'critical';
  if (daysUntil <= 30) return 'warning';
  return 'safe';
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format days until expiry into a human-readable string.
 */
export function formatDaysUntil(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/**
 * Generate a placeholder image URL for products without images.
 * Uses initials-based avatar generation.
 */
export function getProductInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
