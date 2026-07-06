import { easeInOut, getSegmentStrength } from './stormUtils';

export function clearCanvas(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
}

export function resizeCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function drawRain(ctx, drops) {
  for (const drop of drops) {
    const angleOffset = drop.wind * 5;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + angleOffset * drop.windSensitivity, drop.y + drop.len);
    if (drop.bright) {
      ctx.strokeStyle = `rgba(175, 235, 255, ${drop.opacity})`;
      ctx.shadowColor = 'rgba(0, 234, 255, 0.45)';
      ctx.shadowBlur = drop.bright ? 5 : 3;
      ctx.lineWidth = drop.width;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = 'rgba(0, 234, 255, 0.3)';
      ctx.shadowBlur = 2;
      ctx.strokeStyle = `rgba(175, 235, 255, ${drop.opacity})`;
      ctx.lineWidth = drop.width;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

function drawFullPathGlow(ctx, points, alpha, getColor, baseWidth, baseBlur, getShadow, revealProgress = 1) {
  if (points.length < 2) return;
  const total = points.length - 1;
  const revealIdx = Math.max(1, Math.min(Math.floor(total * revealProgress), total));
  const midIdx = Math.max(1, Math.floor(Math.min(revealIdx, total) * 0.5));
  const s = getSegmentStrength(midIdx, total);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i <= revealIdx; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  const sa = alpha * s;
  ctx.strokeStyle = getColor(sa);
  ctx.lineWidth = baseWidth;
  ctx.shadowBlur = baseBlur;
  if (getShadow) ctx.shadowColor = getShadow(sa);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawSegmentedCore(ctx, points, alpha, getColor, baseWidth, baseBlur, getShadow, revealProgress = 1) {
  const total = points.length - 1;
  const revealIdx = Math.max(1, Math.min(Math.floor(total * revealProgress), total));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  for (let i = 0; i < revealIdx; i++) {
    const s = getSegmentStrength(i, total);
    const p = points[i];
    const wMul = p.w !== undefined ? p.w : 1;
    const bMul = p.b !== undefined ? p.b : 1;
    const nextWMul = points[i + 1].w !== undefined ? points[i + 1].w : 1;
    const avgWMul = (wMul + nextWMul) / 2;
    const sa = alpha * s * bMul;
    ctx.shadowBlur = baseBlur * s * avgWMul;
    if (getShadow) ctx.shadowColor = getShadow(sa);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.strokeStyle = getColor(sa);
    ctx.lineWidth = baseWidth * s * avgWMul;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawBoltCore(ctx, points, alpha, isMobile, drawCfg, revealProgress = 1) {
  const w = isMobile ? 'mobile' : 'desktop';
  const cfg = BOLT_CONFIG[w];
  const bp = drawCfg.blurPower;

  drawFullPathGlow(ctx, points, alpha,
    (a) => `rgba(124, 58, 237, ${a * 0.18})`,
    cfg.outerWidth * bp, cfg.outerBlur * bp,
    (a) => `rgba(124, 58, 237, ${a * 0.4})`,
    revealProgress
  );

  drawFullPathGlow(ctx, points, alpha,
    (a) => `rgba(0, 234, 255, ${a * 0.50})`,
    cfg.cyanWidth * bp, 0, null,
    revealProgress
  );

  drawSegmentedCore(ctx, points, alpha,
    (a) => `rgba(235, 252, 255, ${a * 0.95})`,
    cfg.coreWidth, cfg.coreBlur * bp,
    (a) => `rgba(235, 252, 255, ${a * 0.3})`,
    revealProgress
  );
}

const BOLT_CONFIG = {
  mobile: { outerWidth: 7, outerBlur: 22, cyanWidth: 3, coreWidth: 1.1, coreBlur: 5 },
  desktop: { outerWidth: 10, outerBlur: 35, cyanWidth: 4, coreWidth: 1.5, coreBlur: 8 },
};

const BRANCH_GLOW_CONFIG = {
  mobile: { outerWidth: 4, outerBlur: 10, cyanWidth: 2, cyanBlur: 3, coreWidth: 0.7, coreBlur: 2 },
  desktop: { outerWidth: 6, outerBlur: 16, cyanWidth: 3, cyanBlur: 5, coreWidth: 1.0, coreBlur: 4 },
};

const MICRO_BRANCH_CONFIG = {
  mobile: { outerWidth: 2, outerBlur: 5, cyanWidth: 1, cyanBlur: 2, coreWidth: 0.4, coreBlur: 1 },
  desktop: { outerWidth: 3, outerBlur: 8, cyanWidth: 1.5, cyanBlur: 3, coreWidth: 0.6, coreBlur: 2 },
};

function drawBranch(ctx, branch, alpha, isMobile, drawCfg, revealProgress = 1) {
  const ba = alpha * branch.brightness;
  if (ba <= 0.01) return;
  const cfg = BRANCH_GLOW_CONFIG[isMobile ? 'mobile' : 'desktop'];
  const bp = drawCfg.blurPower;
  const bgMul = drawCfg.branchGlowMul || 1;

  drawFullPathGlow(ctx, branch.points, ba * 0.35,
    (a) => `rgba(124, 58, 237, ${a * 0.35})`,
    cfg.outerWidth * bp * bgMul, cfg.outerBlur * bp * bgMul,
    (a) => `rgba(0, 234, 255, ${a * 0.45})`,
    revealProgress
  );

  drawFullPathGlow(ctx, branch.points, ba * 0.55,
    (a) => `rgba(0, 234, 255, ${a * 0.55})`,
    cfg.cyanWidth * bp * bgMul, cfg.cyanBlur * bp * bgMul,
    null,
    revealProgress
  );

  drawSegmentedCore(ctx, branch.points, ba * 0.75,
    (a) => `rgba(235, 255, 255, ${a * 0.8})`,
    cfg.coreWidth, cfg.coreBlur * bp * bgMul,
    (a) => `rgba(190, 245, 255, ${a * 0.35})`,
    revealProgress
  );
}

function drawMicroBranch(ctx, branch, alpha, isMobile, drawCfg, revealProgress = 1) {
  const ba = alpha * branch.brightness;
  if (ba <= 0.005) return;
  const cfg = MICRO_BRANCH_CONFIG[isMobile ? 'mobile' : 'desktop'];
  const bp = drawCfg.blurPower;
  const bgMul = drawCfg.branchGlowMul || 1;

  drawFullPathGlow(ctx, branch.points, ba * 0.25,
    (a) => `rgba(0, 234, 255, ${a * 0.30})`,
    cfg.cyanWidth * bp * bgMul, cfg.cyanBlur * bp * bgMul,
    null,
    revealProgress
  );

  drawSegmentedCore(ctx, branch.points, ba * 0.40,
    (a) => `rgba(200, 245, 255, ${a * 0.50})`,
    cfg.coreWidth, cfg.coreBlur * bp * bgMul,
    (a) => `rgba(170, 240, 255, ${a * 0.2})`,
    revealProgress
  );
}

export function drawSkyCharge(ctx, startPos, progress, power, w, h) {
  const alpha = Math.pow(Math.sin(progress * Math.PI * 0.5), 1.2) * 0.40 * power;
  const gradient = ctx.createRadialGradient(
    startPos.x, 0, 0,
    startPos.x, h * 0.12,
    Math.max(w, h) * 0.7
  );
  gradient.addColorStop(0, `rgba(180, 245, 255, ${alpha})`);
  gradient.addColorStop(0.25, `rgba(0, 234, 255, ${alpha * 0.50})`);
  gradient.addColorStop(0.55, `rgba(124, 58, 237, ${alpha * 0.28})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function drawDirectionalSkyGradient(ctx, event, skyAlpha, w, h) {
  const { startPos, endPos } = event;
  const grad = ctx.createLinearGradient(startPos.x, startPos.y, endPos.x, endPos.y);
  grad.addColorStop(0, `rgba(180, 245, 255, ${skyAlpha})`);
  grad.addColorStop(0.2, `rgba(0, 234, 255, ${skyAlpha * 0.75})`);
  grad.addColorStop(0.5, `rgba(80, 180, 255, ${skyAlpha * 0.45})`);
  grad.addColorStop(0.75, `rgba(124, 58, 237, ${skyAlpha * 0.25})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawPathChargeGlow(ctx, points, chargeAlpha, isMobile) {
  if (chargeAlpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = chargeAlpha;
  ctx.shadowColor = 'rgba(0, 234, 255, 0.5)';
  ctx.shadowBlur = isMobile ? 25 : 40;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = 'rgba(0, 234, 255, 0.08)';
  ctx.lineWidth = isMobile ? 12 : 20;
  ctx.stroke();
  ctx.restore();
}

export function drawCinematicPreGlow(ctx, event, progress, intensity, w, h) {
  const { device } = event;
  const isMobile = device === 'mobile';
  const eased = easeInOut(progress);
  drawDirectionalSkyGradient(ctx, event, eased * intensity * 0.20, w, h);
  ctx.fillStyle = `rgba(110, 210, 255, ${eased * intensity * 0.08})`;
  ctx.fillRect(0, 0, w, h);
  drawPathChargeGlow(ctx, event.points, Math.min(eased * intensity * 0.30, 0.35), isMobile);
}

export function drawLightningBolt(ctx, event, alpha, drawCfg, revealProgress = 1, branchAlpha = 1) {
  const { points, branches, microBranches, device } = event;
  const isMobile = device === 'mobile';

  drawBoltCore(ctx, points, alpha, isMobile, drawCfg, revealProgress);

  const branchMul = branchAlpha * 0.65;
  for (const branch of branches) {
    const ba = alpha * branchMul * branch.brightness;
    if (ba > 0.01) {
      drawBranch(ctx, branch, ba, isMobile, drawCfg, revealProgress);
    }
  }

  if (microBranches) {
    const mbMul = branchAlpha * 0.35;
    for (const mb of microBranches) {
      const ba = alpha * mbMul * (mb.brightness || 0.3);
      if (ba > 0.005) {
        drawMicroBranch(ctx, mb, ba, isMobile, drawCfg, revealProgress);
      }
    }
  }
}

export function drawFlashWash(ctx, alpha, w, h, event, power = 1) {
  if (alpha <= 0.01) return;
  const { startPos } = event;
  const maxDim = Math.max(w, h);
  const g = ctx.createRadialGradient(
    startPos.x, startPos.y, 0,
    startPos.x, startPos.y, maxDim * 0.75
  );
  g.addColorStop(0, `rgba(190, 235, 255, ${alpha * power})`);
  g.addColorStop(0.25, `rgba(140, 210, 255, ${alpha * power * 0.55})`);
  g.addColorStop(0.55, `rgba(70, 180, 255, ${alpha * power * 0.22})`);
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function drawStrikeIllumination(ctx, alpha, w, h, power = 1) {
  if (alpha > 0.01) {
    ctx.fillStyle = `rgba(160, 230, 255, ${alpha * power})`;
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawAfterGlow(ctx, endPos, progress, alpha, isMobile, blurPower = 1) {
  const fadeAlpha = (1 - progress) * alpha;
  const baseR = isMobile ? 80 : 120;
  const r = baseR * blurPower;
  const g = ctx.createRadialGradient(endPos.x, endPos.y, 0, endPos.x, endPos.y, r);
  g.addColorStop(0, `rgba(0, 234, 255, ${fadeAlpha * 0.06})`);
  g.addColorStop(0.6, `rgba(124, 58, 237, ${fadeAlpha * 0.03})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(endPos.x - r, endPos.y - r, r * 2, r * 2);
}
