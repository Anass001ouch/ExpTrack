import { UrgencyLevel } from './types';

export function daysUntilExpiry(expirationDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
}

export function getUrgencyLevel(daysUntil: number): UrgencyLevel {
  if (daysUntil <= 7) return 'critical';
  if (daysUntil <= 30) return 'warning';
  return 'safe';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDaysUntil(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function getProductInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);
}
