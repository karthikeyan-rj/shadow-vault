import { randomBetween, randomBetweenInt, randomChoice, getDevice } from './stormUtils';

function getTopStart(w) {
  return {
    x: randomBetween(w * 0.05, w * 0.95),
    y: randomBetween(-150, 5),
  };
}

function getDownwardEnd(w, h, startX) {
  const endZones = [
    { xMin: 0.18, xMax: 0.42, yMin: 0.62, yMax: 0.95 },
    { xMin: 0.40, xMax: 0.62, yMin: 0.58, yMax: 0.98 },
    { xMin: 0.58, xMax: 0.88, yMin: 0.62, yMax: 1.04 },
    { xMin: 0.10, xMax: 0.90, yMin: 0.72, yMax: 1.02 },
  ];

  const zone = randomChoice(endZones);

  return {
    x: randomBetween(w * zone.xMin, w * zone.xMax),
    y: randomBetween(h * zone.yMin, h * zone.yMax),
  };
}

function generateBoltPath(w, h, startX, startY, endX, endY, jitterMul, numSeg) {
  const dx = endX - startX;
  const dy = endY - startY;
  const totalDist = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / totalDist;
  const dirY = dy / totalDist;
  const perpX = -dirY;
  const perpY = dirX;

  const numSegments = numSeg || randomBetweenInt(16, 24);
  const segLen = totalDist / numSegments;
  const jitterScale = (12 + Math.random() * 28) * (jitterMul || 1);

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
      x += (targetX - x) * 0.10;
      y += (targetY - y) * 0.10;
    }

    x = Math.max(-15, Math.min(w + 15, x));
    y = Math.max(-15, Math.min(h + 15, y));

    let wMul, bMul;
    if (t < 0.08) {
      const fadeIn = t / 0.08;
      wMul = 0.30 + fadeIn * 0.70;
      bMul = 0.50 + fadeIn * 0.50;
    } else if (t > 0.78) {
      const fadeOut = (1 - t) / 0.22;
      wMul = Math.max(0.08, fadeOut);
      bMul = Math.max(0.06, fadeOut);
    } else {
      wMul = 0.80 + Math.random() * 0.35;
      bMul = 0.85 + Math.random() * 0.30;
    }

    points.push({ x, y, w: wMul, b: bMul });
  }

  points[points.length - 1].w = 0.08;
  points[points.length - 1].b = 0.06;

  return points;
}

function generateBranchPoints(w, h, startX, startY, pdx, pdy, segCount, step) {
  const pts = [{ x: startX, y: startY, w: 0.9, b: 0.95 }];
  let bx = startX;
  let by = startY;
  for (let j = 0; j < segCount; j++) {
    bx += pdx * step + (Math.random() - 0.5) * 10;
    by += pdy * step + randomBetween(-3, 6);
    bx = Math.max(w * 0.02, Math.min(w * 0.98, bx));
    by = Math.max(h * 0.02, Math.min(h * 0.98, by));
    const t = (j + 1) / segCount;
    const fadeOut = Math.max(0.10, 1 - t * 0.75);
    pts.push({ x: bx, y: by, w: fadeOut, b: fadeOut * 0.75 });
  }
  return pts;
}

function generateBranches(w, h, points, count) {
  const branches = [];
  const usedIdx = new Set();
  const minIdx = Math.floor(points.length * 0.15);
  const maxIdx = Math.max(minIdx + 1, Math.floor(points.length * 0.82) - 2);

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

    const angleOffset = randomBetween(-55, 55) * (Math.PI / 180);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const rx = pdx * cos - pdy * sin;
    const ry = pdx * sin + pdy * cos;
    pdx = rx;
    pdy = ry;

    if (pdy < 0) {
      pdy *= -1;
      pdx *= -1;
    }

    const lengthRoll = Math.random();
    let segCount, step;
    if (lengthRoll < 0.35) {
      segCount = randomBetweenInt(2, 3);
      step = randomBetween(8, 16);
    } else if (lengthRoll < 0.75) {
      segCount = randomBetweenInt(3, 5);
      step = randomBetween(12, 22);
    } else {
      segCount = randomBetweenInt(5, 8);
      step = randomBetween(18, 28);
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
    bx += pdx * step + (Math.random() - 0.5) * 5;
    by += pdy * step + randomBetween(-2, 4);
    bx = Math.max(w * 0.02, Math.min(w * 0.98, bx));
    by = Math.max(h * 0.02, Math.min(h * 0.98, by));
    const t = (j + 1) / segCount;
    const fadeOut = Math.max(0.08, 1 - t * 0.82);
    pts.push({ x: bx, y: by, w: fadeOut, b: fadeOut });
  }
  return pts;
}

function generateMicroBranches(w, h, points, count) {
  const branches = [];
  const usedIdx = new Set();
  const minIdx = Math.floor(points.length * 0.12);
  const maxIdx = Math.max(minIdx + 1, Math.floor(points.length * 0.70) - 2);

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
    let pdx = (-bdy / blen) * side;
    let pdy = (bdx / blen) * side;

    if (pdy < 0) {
      pdy *= -1;
      pdx *= -1;
    }

    const angleOffset = randomBetween(-70, 70) * (Math.PI / 180);
    const cos = Math.cos(angleOffset);
    const sin = Math.sin(angleOffset);
    const rx = pdx * cos - pdy * sin;
    const ry = pdx * sin + pdy * cos;

    const segCount = randomBetweenInt(1, 3);
    const step = randomBetween(5, 12);

    const mpts = generateMicroBranchPoints(w, h, bp.x, bp.y, rx, ry, segCount, step);
    branches.push({ points: mpts, brightness: randomBetween(0.2, 0.45) });
  }
  return branches;
}

export function generateLightningPattern(w, h, branchMin = 5, branchMax = 8, microMin = 6, microMax = 12) {
  const device = getDevice(w);

  const startPos = getTopStart(w);
  const endPos = getDownwardEnd(w, h, startPos.x);

  const jitterMul = randomBetween(0.8, 1.6);
  const numSegments = randomBetweenInt(16, 24);

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
    device,
    angle,
  };
}

export function generateCrossPatterns(w, h, branchMin, branchMax, microMin, microMax) {
  const boltA = generateLightningPattern(w, h, branchMin, branchMax, microMin, microMax);

  const boltB = generateLightningPattern(w, h, branchMin, branchMax, microMin, microMax);

  return [boltA, boltB];
}
