import { randomBetween, randomBetweenInt, randomChoice, getDevice } from './stormUtils';

export function getRandomTopStart(w, h, xRange) {
  if (xRange) {
    return { x: randomBetween(xRange.min, xRange.max), y: randomBetween(-100, 10) };
  }

  const zones = [
    () => ({ x: randomBetween(0, w), y: randomBetween(-100, 10) }),
    () => ({ x: randomBetween(-80, w * 0.2), y: randomBetween(-100, 0) }),
    () => ({ x: randomBetween(w * 0.8, w + 80), y: randomBetween(-100, 0) }),
    () => ({ x: randomBetween(w * 0.15, w * 0.85), y: randomBetween(-140, -20) }),
  ];

  return randomChoice(zones)();
}

function getEndForZone(zone, w, h, xRange) {
  let pos;
  switch (zone) {
    case 'center':
      pos = { x: randomBetween(w * 0.35, w * 0.65), y: randomBetween(h * 0.35, h * 0.65) };
      break;
    case 'lowerMiddle':
      pos = { x: randomBetween(w * 0.25, w * 0.75), y: randomBetween(h * 0.6, h * 0.9) };
      break;
    case 'lowerLeft':
      pos = { x: randomBetween(w * 0.05, w * 0.35), y: randomBetween(h * 0.55, h * 0.9) };
      break;
    case 'lowerRight':
      pos = { x: randomBetween(w * 0.65, w * 0.95), y: randomBetween(h * 0.55, h * 0.9) };
      break;
    case 'middleLeft':
      pos = { x: randomBetween(w * 0.05, w * 0.3), y: randomBetween(h * 0.25, h * 0.6) };
      break;
    case 'middleRight':
      pos = { x: randomBetween(w * 0.7, w * 0.95), y: randomBetween(h * 0.25, h * 0.6) };
      break;
    case 'bottom':
      pos = { x: randomBetween(w * 0.15, w * 0.85), y: randomBetween(h * 0.8, h + 50) };
      break;
    default:
      pos = { x: randomBetween(w * 0.25, w * 0.75), y: randomBetween(h * 0.4, h * 0.85) };
  }
  if (xRange) {
    pos.x = randomBetween(xRange.min, xRange.max);
  }
  return pos;
}

function getRandomLightningEnd(w, h, startPos, xRange) {
  const zones = [
    'center', 'lowerMiddle', 'lowerLeft', 'lowerRight',
    'middleLeft', 'middleRight', 'bottom',
  ];
  const minDist = w * 0.4;
  let endPos, attempts = 0;
  do {
    endPos = getEndForZone(randomChoice(zones), w, h, xRange);
    if (startPos) {
      const dx = endPos.x - startPos.x;
      const dy = endPos.y - startPos.y;
      if (Math.sqrt(dx * dx + dy * dy) >= minDist) break;
    } else {
      break;
    }
    attempts++;
  } while (attempts < 20);
  return endPos;
}

function generateBoltPath(w, h, startX, startY, endX, endY, jitterMul, numSeg) {
  const dx = endX - startX;
  const dy = endY - startY;
  const totalDist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / totalDist;
  const dirY = dy / totalDist;
  const perpX = -dirY;
  const perpY = dirX;

  const numSegments = numSeg || randomBetweenInt(14, 22);
  const segLen = totalDist / numSegments;
  const jitterScale = (10 + Math.random() * 24) * (jitterMul || 1);

  const points = [];
  let x = startX;
  let y = startY;

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const targetX = startX + dx * t;
    const targetY = startY + dy * t;

    const taper = Math.sin(t * Math.PI);
    const jitter = (Math.random() - 0.5) * jitterScale * taper;

    if (i > 0) {
      x += dirX * segLen + perpX * jitter;
      y += dirY * segLen + perpY * jitter;
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
    }

    x = Math.max(-15, Math.min(w + 15, x));
    y = Math.max(-15, Math.min(h + 15, y));

    let wMul, bMul;
    if (t < 0.1) {
      const fadeIn = t / 0.1;
      wMul = 0.35 + fadeIn * 0.65;
      bMul = 0.55 + fadeIn * 0.45;
    } else if (t > 0.75) {
      const fadeOut = (1 - t) / 0.25;
      wMul = Math.max(0.15, fadeOut);
      bMul = Math.max(0.1, fadeOut);
    } else {
      wMul = 0.85 + Math.random() * 0.3;
      bMul = 0.9 + Math.random() * 0.25;
    }

    points.push({ x, y, w: wMul, b: bMul });
  }

  points[points.length - 1].w = 0.1;
  points[points.length - 1].b = 0.08;

  return points;
}

function generateBranchPoints(w, h, startX, startY, pdx, pdy, segCount, step) {
  const pts = [{ x: startX, y: startY, w: 0.9, b: 0.95 }];
  let bx = startX;
  let by = startY;
  for (let j = 0; j < segCount; j++) {
    bx += pdx * step + (Math.random() - 0.5) * 12;
    by += pdy * step + randomBetween(-4, 8);
    bx = Math.max(w * 0.02, Math.min(w * 0.98, bx));
    by = Math.max(h * 0.02, Math.min(h * 0.98, by));
    const t = (j + 1) / segCount;
    const fadeOut = Math.max(0.15, 1 - t * 0.7);
    pts.push({ x: bx, y: by, w: fadeOut, b: fadeOut * 0.8 });
  }
  return pts;
}

function generateBranches(w, h, points, count) {
  const branches = [];
  const usedIdx = new Set();
  const minIdx = Math.floor(points.length * 0.2);
  const maxIdx = Math.max(minIdx + 1, Math.floor(points.length * 0.85) - 2);

  for (let i = 0; i < count && usedIdx.size < (maxIdx - minIdx); i++) {
    let idx;
    do {
      idx = randomBetweenInt(minIdx, maxIdx);
    } while (usedIdx.has(idx));
    usedIdx.add(idx);

    const bp = points[idx];
    const pIdx = Math.max(0, idx - 2);
    const nIdx = Math.min(points.length - 1, idx + 2);
    const bdx = points[nIdx].x - points[pIdx].x;
    const bdy = points[nIdx].y - points[pIdx].y;
    const blen = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
    const ldx = bdx / blen;
    const ldy = bdy / blen;
    const side = Math.random() > 0.5 ? 1 : -1;

    let pdx = -ldy * side;
    let pdy = ldx * side;

    const angleOffset = randomBetween(-65, 65) * (Math.PI / 180);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const rx = pdx * cos - pdy * sin;
    const ry = pdx * sin + pdy * cos;
    pdx = rx;
    pdy = ry;

    const lengthRoll = Math.random();
    let segCount, step;
    if (lengthRoll < 0.4) {
      segCount = randomBetweenInt(2, 3);
      step = randomBetween(6, 14);
    } else if (lengthRoll < 0.8) {
      segCount = randomBetweenInt(3, 5);
      step = randomBetween(10, 20);
    } else {
      segCount = randomBetweenInt(5, 7);
      step = randomBetween(16, 26);
    }

    const bpts = generateBranchPoints(w, h, bp.x, bp.y, pdx, pdy, segCount, step);
    branches.push({ points: bpts, brightness: randomBetween(0.55, 0.85) });
  }
  return branches;
}

function generateMicroBranchPoints(w, h, startX, startY, pdx, pdy, segCount, step) {
  const pts = [{ x: startX, y: startY, w: 0.8, b: 0.85 }];
  let bx = startX;
  let by = startY;
  for (let j = 0; j < segCount; j++) {
    bx += pdx * step + (Math.random() - 0.5) * 6;
    by += pdy * step + randomBetween(-3, 5);
    bx = Math.max(w * 0.02, Math.min(w * 0.98, bx));
    by = Math.max(h * 0.02, Math.min(h * 0.98, by));
    const t = (j + 1) / segCount;
    const fadeOut = Math.max(0.1, 1 - t * 0.8);
    pts.push({ x: bx, y: by, w: fadeOut, b: fadeOut });
  }
  return pts;
}

function generateMicroBranches(w, h, points, count) {
  const branches = [];
  const usedIdx = new Set();
  const minIdx = Math.floor(points.length * 0.15);
  const maxIdx = Math.max(minIdx + 1, Math.floor(points.length * 0.75) - 2);

  for (let i = 0; i < count && usedIdx.size < (maxIdx - minIdx); i++) {
    let idx;
    do {
      idx = randomBetweenInt(minIdx, maxIdx);
    } while (usedIdx.has(idx));
    usedIdx.add(idx);

    const bp = points[idx];
    const pIdx = Math.max(0, idx - 2);
    const nIdx = Math.min(points.length - 1, idx + 2);
    const bdx = points[nIdx].x - points[pIdx].x;
    const bdy = points[nIdx].y - points[pIdx].y;
    const blen = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
    const side = Math.random() > 0.5 ? 1 : -1;
    const pdx = (-bdy / blen) * side;
    const pdy = (bdx / blen) * side;

    const angleOffset = randomBetween(-80, 80) * (Math.PI / 180);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const rx = pdx * cos - pdy * sin;
    const ry = pdx * sin + pdy * cos;

    const segCount = randomBetweenInt(1, 2);
    const step = randomBetween(4, 10);

    const mpts = generateMicroBranchPoints(w, h, bp.x, bp.y, rx, ry, segCount, step);
    branches.push({ points: mpts, brightness: randomBetween(0.2, 0.4) });
  }
  return branches;
}

const PATTERN_STYLES = {
  verticalLong: { jitterRange: [0.7, 1.5], segMul: 1.0 },
  diagonalLeft: { jitterRange: [0.8, 1.6], segMul: 1.1 },
  diagonalRight: { jitterRange: [0.8, 1.6], segMul: 1.1 },
  forkedStrike: { jitterRange: [0.7, 1.4], segMul: 1.2 },
  cornerStrike: { jitterRange: [0.8, 1.5], segMul: 0.85 },
};

export function generateLightningPattern(w, h, branchMin = 3, branchMax = 6, microMin = 4, microMax = 10, constraints) {
  const device = getDevice(w);

  const patternNames = Object.keys(PATTERN_STYLES);
  const pattern = randomChoice(patternNames);
  const style = PATTERN_STYLES[pattern];

  const startPos = getRandomTopStart(w, h, constraints?.startX);
  const endPos = getRandomLightningEnd(w, h, startPos, constraints?.endX);

  const jitterMul = randomBetween(style.jitterRange[0], style.jitterRange[1]);
  const numSegments = Math.round(randomBetweenInt(14, 22) * style.segMul);

  const points = generateBoltPath(w, h, startPos.x, startPos.y, endPos.x, endPos.y, jitterMul, numSegments);

  const branchCount = randomBetweenInt(branchMin, branchMax);
  const branches = generateBranches(w, h, points, branchCount);

  const microCount = randomBetweenInt(microMin, microMax);
  const microBranches = generateMicroBranches(w, h, points, microCount);

  const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);

  return {
    points,
    branches,
    microBranches,
    startPos,
    endPos,
    pattern,
    device,
    angle,
  };
}

export function generateCrossPatterns(w, h, branchMin, branchMax, microMin, microMax) {
  const boltA = generateLightningPattern(w, h, branchMin, branchMax, microMin, microMax, {
    startX: { min: w * 0.05, max: w * 0.4 },
    endX: { min: w * 0.55, max: w * 0.9 },
  });

  const boltB = generateLightningPattern(w, h, branchMin, branchMax, microMin, microMax, {
    startX: { min: w * 0.6, max: w * 0.95 },
    endX: { min: w * 0.1, max: w * 0.45 },
  });

  return [boltA, boltB];
}
