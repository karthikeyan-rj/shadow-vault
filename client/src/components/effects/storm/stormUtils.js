export const randomBetween = (min, max) => min + Math.random() * (max - min);

export const randomBetweenInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

export const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const getDevice = (w) => w < 500 ? 'mobile' : w < 768 ? 'tablet' : 'desktop';

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function getLightningOpacity(progress) {
  if (progress < 0.1) return progress / 0.1;
  if (progress < 0.4) return 1;
  if (progress < 0.7) return 1 - (progress - 0.4) * 1.67;
  return Math.max(0, 0.5 * (1 - (progress - 0.7) / 0.3));
}

export function getCinematicLightningOpacity(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const firstPeak = Math.exp(-Math.pow((p - 0.14) / 0.10, 2));
  const secondPeak = 0.50 * Math.exp(-Math.pow((p - 0.40) / 0.12, 2));
  const tail = Math.max(0, 1 - p) * 0.30;
  return Math.min(1, firstPeak + secondPeak + tail);
}

export function getImpactAlpha(t) {
  if (t < 0.12) return t / 0.12;
  if (t < 0.35) return 1;
  if (t < 0.75) return 1 - (t - 0.35) * 1.4;
  return Math.max(0, 0.35 * (1 - (t - 0.75) / 0.25));
}

export function getSegmentStrength(index, total) {
  if (total <= 1) return 1;
  const t = index / (total - 1);
  if (t < 0.08) return 0.45 + (t / 0.08) * 0.55;
  if (t > 0.72) {
    const fade = (1 - t) / 0.28;
    return Math.max(0.06, fade);
  }
  return 1;
}
