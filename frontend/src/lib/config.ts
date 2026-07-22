/**
 * Configuration manager for backend API URL.
 * Allows dynamic override in client environments (e.g., Capacitor Android/iOS)
 * where localhost is not accessible.
 */

export function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = window.localStorage.getItem('custom_backend_url');
    if (custom) {
      return custom;
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
}

export function setBackendUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url) {
      // Clean trailing slash if present
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      window.localStorage.setItem('custom_backend_url', cleanUrl);
    } else {
      window.localStorage.removeItem('custom_backend_url');
    }
  }
}
