/**
 * notificationSound.js
 * Generates a pleasant soft chime using the Web Audio API.
 * No audio file needed — synthesized entirely in-browser.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * Play a soft 2-note chime notification sound.
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = [
      { freq: 880, startTime: 0,    duration: 0.18 },   // A5 — high note
      { freq: 659, startTime: 0.15, duration: 0.28 },   // E5 — resolve note
    ];

    notes.forEach(({ freq, startTime, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      // Smooth attack + quick decay envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      oscillator.start(ctx.currentTime + startTime);
      oscillator.stop(ctx.currentTime + startTime + duration + 0.05);
    });
  } catch (err) {
    // Silently fail — audio is non-critical
    console.warn('Notification sound failed:', err);
  }
};

/**
 * Request browser desktop notification permission.
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

/**
 * Show a browser desktop push notification.
 */
export const showBrowserNotification = (title, body, icon = '/vite.svg') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: 'mailflow-email',   // replaces previous instead of stacking
      silent: true              // we handle sound ourselves
    });
    // Auto-close after 6 seconds
    setTimeout(() => notif.close(), 6000);
    return notif;
  }
  return null;
};
