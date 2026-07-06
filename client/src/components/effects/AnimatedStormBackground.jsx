import React, { useRef, useEffect } from 'react';
import useReducedMotion from './storm/useReducedMotion';
import { getDropCount, createRaindrops, updateRaindrops, updateSpawnWind } from './storm/rainPhysics';
import { generateLightningPattern, generateCrossPatterns } from './storm/lightningGenerator';
import { clearCanvas, resizeCanvas, drawRain, drawSkyCharge, drawCinematicPreGlow, drawLightningBolt, drawFlashWash, drawStrikeIllumination, drawAfterGlow } from './storm/canvasRenderer';
import { getCinematicLightningOpacity, getImpactAlpha, easeInOut, randomBetween, randomBetweenInt } from './storm/stormUtils';
import { SKY_CHARGE_DURATION, PRE_GLOW_DURATION, STRIKE_DURATION, AFTERGLOW_DURATION, WIND_CHANGE_MIN, WIND_CHANGE_MAX } from './storm/stormConstants';
import { STORM_VARIANTS } from './storm/stormVariants';

export default function AnimatedStormBackground({ variant = 'default' }) {
  const canvasRef = useRef(null);
  const flashRef = useRef(null);
  const dropsRef = useRef([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cfg = STORM_VARIANTS[variant] || STORM_VARIANTS.default;

    let animId;
    let windTimer;
    let spawnWind = 0;
    let spawnWindTarget = 0;

    let activeBolts = [];
    let isStrikeActive = false;
    let isBurstActive = false;
    let burstStrikesRemaining = 0;
    let normalTimer = null;
    let burstTimer = null;
    let burstGapTimer = null;

    const rainOpts = { opacityMul: cfg.rainOpacityMul, speedMul: cfg.rainSpeedMul };

    const setup = () => {
      resizeCanvas(canvas);
      dropsRef.current = createRaindrops(getDropCount(cfg.rainCountMul), canvas.width, canvas.height, spawnWind, rainOpts);
    };
    setup();
    window.addEventListener('resize', setup);

    const pushBolt = (boltPattern) => {
      const baseInten = randomBetween(0.7, 1.0);
      const inten = baseInten * cfg.lightningPower;
      activeBolts.push({ ...boltPattern, startTime: performance.now(), intensity: inten });
      isStrikeActive = true;

      const el = flashRef.current;
      if (el) {
        const ex = (boltPattern.endPos.x / canvas.width) * 100;
        const ey = (boltPattern.endPos.y / canvas.height) * 100;
        el.style.setProperty('--strike-x', `${ex}%`);
        el.style.setProperty('--strike-y', `${ey}%`);
        el.style.background = `radial-gradient(circle at ${ex}% ${ey}%, rgba(190,245,255,0.22) 0%, rgba(0,234,255,0.12) 28%, rgba(124,58,237,0.08) 48%, transparent 72%), linear-gradient(180deg, rgba(180,245,255,0.10) 0%, rgba(0,0,0,0) 100%)`;
        el.style.opacity = '0';
      }
    };

    const triggerSingleStrike = () => {
      const bolt = generateLightningPattern(
        canvas.width, canvas.height,
        cfg.branchMin, cfg.branchMax,
        cfg.microBranchMin, cfg.microBranchMax
      );
      pushBolt(bolt);
    };

    const triggerCrossStrike = () => {
      const [boltA, boltB] = generateCrossPatterns(
        canvas.width, canvas.height,
        cfg.branchMin, cfg.branchMax,
        cfg.microBranchMin, cfg.microBranchMax
      );
      pushBolt(boltA);
      setTimeout(() => pushBolt(boltB), randomBetween(80, 180));
    };

    const onStrikeFinished = () => {
      isStrikeActive = false;
      if (isBurstActive && burstStrikesRemaining > 0) {
        burstStrikesRemaining--;
        const isCross = Math.random() < cfg.crossChance;
        const gap = randomBetween(cfg.burstGapMin, cfg.burstGapMax);
        burstGapTimer = setTimeout(() => {
          if (isCross) triggerCrossStrike();
          else triggerSingleStrike();
        }, gap);
      } else {
        isBurstActive = false;
        scheduleNormal();
        scheduleBurst();
      }
    };

    const scheduleNormal = () => {
      clearTimeout(normalTimer);
      normalTimer = setTimeout(() => {
        if (!isStrikeActive && !isBurstActive) {
          triggerSingleStrike();
        }
      }, randomBetween(cfg.normalLightningMin, cfg.normalLightningMax));
    };

    const triggerBurst = () => {
      isBurstActive = true;
      const count = randomBetweenInt(cfg.burstStrikeMin, cfg.burstStrikeMax);
      burstStrikesRemaining = count - 1;
      const isCross = Math.random() < cfg.crossChance;
      if (isCross) triggerCrossStrike();
      else triggerSingleStrike();
    };

    const scheduleBurst = () => {
      clearTimeout(burstTimer);
      burstTimer = setTimeout(() => {
        if (!isStrikeActive && !isBurstActive) {
          triggerBurst();
        }
      }, randomBetween(cfg.burstLightningMin, cfg.burstLightningMax));
    };

    const scheduleWindChange = () => {
      windTimer = setTimeout(() => {
        spawnWindTarget = (Math.random() - 0.5) * 1.1;
        scheduleWindChange();
      }, WIND_CHANGE_MIN + Math.random() * (WIND_CHANGE_MAX - WIND_CHANGE_MIN));
    };

    scheduleNormal();
    scheduleBurst();
    scheduleWindChange();

    const drawCfg = {
      blurPower: cfg.lightningBlurPower,
      branchGlowMul: cfg.branchGlowMul,
    };

    const renderBolt = (bolt) => {
      const elapsed = performance.now() - bolt.startTime;
      const inten = bolt.intensity;
      const isMobile = bolt.device === 'mobile';
      const totalDuration = SKY_CHARGE_DURATION + PRE_GLOW_DURATION + STRIKE_DURATION + AFTERGLOW_DURATION;

      if (elapsed >= totalDuration) return;

      const chargeEnd = SKY_CHARGE_DURATION;
      const preGlowEnd = chargeEnd + PRE_GLOW_DURATION;
      const strikeEnd = preGlowEnd + STRIKE_DURATION;

      if (elapsed < chargeEnd) {
        const p = elapsed / chargeEnd;
        drawSkyCharge(ctx, bolt.startPos, p, cfg.skyChargePower, canvas.width, canvas.height);
        if (flashRef.current) flashRef.current.style.opacity = '' + (p * 0.06 * inten);
      } else if (elapsed < preGlowEnd) {
        const p = (elapsed - chargeEnd) / PRE_GLOW_DURATION;
        drawCinematicPreGlow(ctx, bolt, p, inten, canvas.width, canvas.height);
        if (flashRef.current) flashRef.current.style.opacity = '' + (easeInOut(p) * 0.12 * inten);
      } else if (elapsed < strikeEnd) {
        const sp = (elapsed - preGlowEnd) / STRIKE_DURATION;
        const cinematicAlpha = getCinematicLightningOpacity(sp) * inten;
        const flickerMul = cinematicAlpha * cfg.flickerPower;

        const revealProgress = Math.min(1, sp / cfg.revealSpeed);
        const branchDelayProgress = Math.max(0, Math.min(1, (sp - cfg.branchDelay) / (1 - cfg.branchDelay)));

        drawFlashWash(ctx, getImpactAlpha(sp) * 0.15 * inten, canvas.width, canvas.height, bolt, cfg.flashWashPower);
        drawStrikeIllumination(ctx, getImpactAlpha(sp) * 0.12 * inten, canvas.width, canvas.height, cfg.screenFlashPower);
        drawLightningBolt(ctx, bolt, flickerMul, drawCfg, revealProgress, branchDelayProgress);

        if (flashRef.current) {
          const flashOpacity = Math.min(
            (sp / 0.15) * 0.28 * inten * cfg.flickerPower,
            0.28
          );
          flashRef.current.style.opacity = '' + flashOpacity;
        }
      } else {
        const ap = (elapsed - strikeEnd) / AFTERGLOW_DURATION;
        drawAfterGlow(ctx, bolt.endPos, ap, inten * 0.08, isMobile, cfg.lightningBlurPower);
        if (flashRef.current) flashRef.current.style.opacity = '' + (Math.max(0, (1 - ap) * 0.08 * inten));
      }
    };

    const animate = () => {
      clearCanvas(ctx, canvas.width, canvas.height);
      spawnWind = updateSpawnWind(spawnWind, spawnWindTarget, 0.01);
      updateRaindrops(dropsRef.current, canvas.width, canvas.height, spawnWind, rainOpts);
      drawRain(ctx, dropsRef.current);

      let anyCompleted = false;
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        const bolt = activeBolts[i];
        const elapsed = performance.now() - bolt.startTime;

        if (elapsed >= SKY_CHARGE_DURATION + PRE_GLOW_DURATION + STRIKE_DURATION + AFTERGLOW_DURATION) {
          activeBolts.splice(i, 1);
          anyCompleted = true;
        } else {
          renderBolt(bolt);
        }
      }

      if (anyCompleted && activeBolts.length === 0) {
        if (flashRef.current) flashRef.current.style.opacity = '0';
        onStrikeFinished();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(normalTimer);
      clearTimeout(burstTimer);
      clearTimeout(burstGapTimer);
      clearTimeout(windTimer);
      window.removeEventListener('resize', setup);
    };
  }, [reduced, variant]);

  if (reduced) return null;

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', imageRendering: 'auto' }} />
      <div ref={flashRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0, mixBlendMode: 'screen' }} />
    </>
  );
}
