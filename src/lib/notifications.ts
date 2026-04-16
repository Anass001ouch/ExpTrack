export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }

  return Notification.requestPermission().then((permission) => {
    return permission === 'granted';
  });
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.error('Failed to show notification:', e);
    }
  }
}

export function notifyExpiringProducts(
  criticalCount: number,
  warningCount: number
): void {
  if (criticalCount === 0 && warningCount === 0) return;

  const messages: string[] = [];

  if (criticalCount > 0) {
    messages.push(`${criticalCount} batch${criticalCount > 1 ? 'es' : ''} expiring within 7 days`);
  }

  if (warningCount > 0) {
    messages.push(`${warningCount} batch${warningCount > 1 ? 'es' : ''} expiring within 30 days`);
  }

  if (messages.length > 0) {
    showNotification('Expiration Alert', {
      body: messages.join(', ') + ' - Check your inventory!',
      tag: 'expiration-alert',
      requireInteraction: true,
    });
  }
}