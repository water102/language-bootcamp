/**
 * Browser Capability Detection and Hardware Adapters
 * Spec reference: docs/cefr-learning-planner-spec/02_SYSTEM_ARCHITECTURE.md (section 3.4)
 * docs/cefr-learning-planner-spec/10_RESOURCE_AND_BROWSER_FEATURES.md
 */

export class BrowserCapabilities {
  /**
   * Detect available browser features
   * @returns {Record<string, boolean>}
   */
  static detect() {
    const isBrowser = typeof window !== 'undefined';
    const nav = isBrowser ? window.navigator : {};

    return {
      wakeLock: isBrowser && 'wakeLock' in nav,
      notifications: isBrowser && 'Notification' in window,
      webShare: isBrowser && 'share' in nav,
      clipboard: isBrowser && 'clipboard' in nav,
      speechSynthesis: isBrowser && 'speechSynthesis' in window,
      speechRecognition: isBrowser && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
      mediaDevices: isBrowser && !!(nav.mediaDevices && nav.mediaDevices.getUserMedia),
      serviceWorker: isBrowser && 'serviceWorker' in nav,
      indexedDB: isBrowser && 'indexedDB' in window,
      localStorage: isBrowser && 'localStorage' in window
    };
  }

  /**
   * Screen Wake Lock Adapter
   */
  static createWakeLockAdapter() {
    let sentinel = null;

    return {
      async request() {
        try {
          if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
            sentinel = await navigator.wakeLock.request('screen');
            sentinel.addEventListener('release', () => {
              sentinel = null;
            });
            return true;
          }
        } catch (err) {
          console.warn('[WakeLock] Request failed:', err);
        }
        return false;
      },
      async release() {
        if (sentinel) {
          try {
            await sentinel.release();
          } catch (e) {}
          sentinel = null;
        }
      },
      isActive() {
        return sentinel !== null;
      }
    };
  }

  /**
   * Safe Notification Adapter
   */
  static async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }

  /**
   * Web Share or Clipboard Fallback
   */
  static async shareOrCopy({ title, text, url }) {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return { shared: true, method: 'web-share' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[Share] Web Share failed, falling back to clipboard:', err);
        } else {
          return { shared: false, method: 'aborted' };
        }
      }
    }

    // Fallback: Clipboard
    if (typeof window !== 'undefined' && navigator.clipboard) {
      try {
        const payload = [title, text, url].filter(Boolean).join('\n');
        await navigator.clipboard.writeText(payload);
        return { shared: true, method: 'clipboard' };
      } catch (e) {
        console.warn('[Share] Clipboard fallback failed:', e);
      }
    }

    return { shared: false, method: 'none' };
  }
}
