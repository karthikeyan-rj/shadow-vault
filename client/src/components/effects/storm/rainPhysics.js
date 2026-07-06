export function getDropCount(countMul = 1) {
  const w = window.innerWidth;
  let base;

  if (w < 500) base = 45;
  else if (w < 768) base = 70;
  else if (w < 1024) base = 95;
  else base = 115;

  return Math.round(base * countMul);
}

export function createDrop(w, h, spawnWind, opts = {}) {
  const { opacityMul = 1, speedMul = 1 } = opts;
  const bright = Math.random() < 0.14;

  return {
    x: Math.random() * w,
    y: Math.random() * h,

    len: bright ? 5 + Math.random() * 4 : 4 + Math.random() * 4,

    speed: (bright ? 0.45 + Math.random() * 0.65 : 0.38 + Math.random() * 0.58) * speedMul,

    opacity: (bright
      ? 0.44 + Math.random() * 0.18
      : 0.24 + Math.random() * 0.20) * opacityMul,

    width: bright
      ? 1.3 + Math.random() * 0.7
      : 0.9 + Math.random() * 0.6,

    wind: spawnWind || 0,
    windSensitivity: 0.7 + Math.random() * 0.5,
    bright,
  };
}

export function createRaindrops(count, w, h, spawnWind, opts) {
  const drops = [];

  for (let i = 0; i < count; i++) {
    drops.push(createDrop(w, h, spawnWind, opts));
  }

  return drops;
}

export function resetRaindrop(drop, w, h, spawnWind, opts = {}) {
  const { opacityMul = 1, speedMul = 1 } = opts;
  const bright = Math.random() < 0.14;

  drop.x = -30 + Math.random() * (w + 60);
  drop.y = -120 + Math.random() * 10;

  drop.len = bright ? 5 + Math.random() * 4 : 4 + Math.random() * 4;

  drop.speed = (bright ? 0.45 + Math.random() * 0.65 : 0.38 + Math.random() * 0.58) * speedMul;

  drop.bright = bright;

  drop.opacity = (bright
    ? 0.44 + Math.random() * 0.18
    : 0.24 + Math.random() * 0.20) * opacityMul;

  drop.width = bright
    ? 1.3 + Math.random() * 0.7
    : 0.9 + Math.random() * 0.6;

  drop.wind = spawnWind;
  drop.windSensitivity = 0.7 + Math.random() * 0.5;
}

export function updateRaindrops(drops, w, h, spawnWind, opts) {
  for (const drop of drops) {
    drop.y += drop.speed;
    drop.x += drop.wind * drop.windSensitivity * 0.4;

    if (drop.y > h + 20 || drop.x < -50 || drop.x > w + 50) {
      resetRaindrop(drop, w, h, spawnWind, opts);
    }
  }
}

export function updateSpawnWind(current, target, lerpFactor) {
  return current + (target - current) * lerpFactor;
}