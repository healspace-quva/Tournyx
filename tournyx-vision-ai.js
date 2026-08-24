/**
 * ==============================================================================
 * TOURNYX VISION AI v3.5 - MASTER COMPANION & NEURAL LINK
 * Indestructible Floating Cyber Orb • Localized Docked Assistant HUD
 * Multi-Window PiP • Live Speech Synthesis & Waveform • Mobile Native APK Push
 * ==============================================================================
 */

'use strict';

const TournyxVisionAI = (() => {

  let state = {
    bubbleEl: null,
    dockEl: null,
    isDragging: false,
    hasMoved: false,
    isOpen: false,
    posX: 0,
    posY: 0,
    dragStartX: 0,
    dragStartY: 0,
    startPosX: 0,
    startPosY: 0,
    pipVideo: null,
    pipCanvas: null,
    pipCtx: null,
  };

  // ─── 1. INITIALIZE FLOATING CYBER ORB ──────────────────────────────────────
  function init() {
    if (document.getElementById('tx-vision-bubble')) return;

    // 1. Create Floating Orb
    const bubble = document.createElement('div');
    bubble.id = 'tx-vision-bubble';
    bubble.style.position = 'fixed';
    bubble.style.zIndex = '99999';
    bubble.style.cursor = 'grab';
    bubble.style.userSelect = 'none';
    bubble.style.touchAction = 'none';
    
    // Initial position on screen (bottom-right)
    state.posX = Math.max(10, window.innerWidth - 75);
    state.posY = Math.max(10, window.innerHeight - 145);

    bubble.style.left = `${state.posX}px`;
    bubble.style.top = `${state.posY}px`;

    bubble.innerHTML = `
      <div class="tx-cyber-crest" style="width:44px; height:44px; pointer-events:none;">
        <svg width="44" height="44" viewBox="0 0 100 100" class="tx-crest-svg">
          <defs>
            <linearGradient id="txOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00f2ff" />
              <stop offset="50%" stop-color="#bd00ff" />
              <stop offset="100%" stop-color="#ff3300" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#txOrbGrad)" stroke-width="3" stroke-dasharray="18 8 36 8" class="tx-ring-spin" />
          <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="rgba(8,8,16,0.95)" stroke="#00f2ff" stroke-width="2" />
          <circle cx="50" cy="50" r="14" fill="url(#txOrbGrad)" class="tx-core-pulse" />
          <path d="M40,42 L60,42 M50,42 L50,60 M56,48 L64,60 M44,48 L36,60" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
        </svg>
      </div>
      <div id="tx-bubble-pulse-dot" style="position:absolute; top:2px; right:2px; width:10px; height:10px; border-radius:50%; background:#00ff7f; box-shadow:0 0 8px #00ff7f;"></div>
    `;

    document.body.appendChild(bubble);
    state.bubbleEl = bubble;

    _injectDockedHUD();
    _bindOptimizedDrag(bubble);
    _initPiPElements();

    if (window.TournyxEngine && window.TournyxEngine.state.engineData) {
      updateBubble(window.TournyxEngine.state.engineData);
    }
  }


  function downloadAppPrompt() {
    if (typeof showToast === 'function') {
      showToast('📲 Tournyx Native Mobile App APK Download link copied to clipboard!');
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://tournyx.in/download/tournyx-esports.apk');
    }
  }

  // ─── 3. DRAGGING LOGIC ─────────────────────────────────────────────────────
  function _bindOptimizedDrag(bubble) {
    const onPointerDown = (e) => {
      state.isDragging = true;
      state.hasMoved = false;
      bubble.classList.add('is-dragging');

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      state.dragStartX = clientX;
      state.dragStartY = clientY;
      state.startPosX = state.posX;
      state.startPosY = state.posY;

      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: false });
    };

    const onPointerMove = (e) => {
      if (!state.isDragging) return;
      e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - state.dragStartX;
      const dy = clientY - state.dragStartY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        state.hasMoved = true;
      }

      const bubbleSize = 66;
      state.posX = Math.max(10, Math.min(window.innerWidth - bubbleSize - 10, state.startPosX + dx));
      state.posY = Math.max(10, Math.min(window.innerHeight - bubbleSize - 10, state.startPosY + dy));

      bubble.style.left = `${state.posX}px`;
      bubble.style.top = `${state.posY}px`;
    };

    const onPointerUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      bubble.classList.remove('is-dragging');

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // If user tapped without dragging, open Vision AI HUD Modal
      if (!state.hasMoved) {
        openVisionModal();
      }
    };

    bubble.addEventListener('mousedown', onPointerDown);
    bubble.addEventListener('touchstart', onPointerDown, { passive: false });
  }

  // ─── 4. UPDATE BUBBLE STATS ────────────────────────────────────────────────
  function updateBubble(engineData) {
    if (!engineData) return;
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    setTxt('tx-bubble-xp-tag', `+${engineData.daily_xp || 0} XP`);
    setTxt('vmPower', (engineData.power_level || 100).toLocaleString());
    setTxt('vmRank', engineData.rank_tier || 'E-RANK');
    setTxt('vmDailyXP', `+${engineData.daily_xp || 0}`);
    
    const dna = engineData.player_dna || 'Rusher';
    setTxt('vmActiveMission', `${dna} Protocol: Complete daily drills & climb to SSS-Rank!`);
  }

  // ─── 5. PICTURE-IN-PICTURE (MULTI-WINDOW HUD) ──────────────────────────────
  function _initPiPElements() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    state.pipCanvas = canvas;
    state.pipCtx = canvas.getContext('2d');

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = canvas.captureStream(30);
    state.pipVideo = video;
  }

  async function togglePictureInPicture(e) {
    if (e) e.stopPropagation();
    if (!document.pictureInPictureEnabled) {
      if (typeof showToast === 'function') showToast('Picture-in-Picture not supported on this browser.', true);
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        _renderPiPFrame();
        await state.pipVideo.play();
        await state.pipVideo.requestPictureInPicture();
        if (typeof showToast === 'function') showToast('🎮 Tournyx Vision HUD Floating Multi-Window Active!');
      }
    } catch(err) {
      console.warn('PiP launch exception:', err);
    }
  }

  function _renderPiPFrame() {
    if (!state.pipCtx) return;
    const ctx = state.pipCtx;
    const d = (window.TournyxEngine && window.TournyxEngine.state.engineData) || { power_level: 1200, rank_tier: 'A-RANK', daily_xp: 420 };

    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, 400, 250);

    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 388, 238);

    ctx.fillStyle = '#00f2ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('TOURNYX VISION AI HUD', 20, 36);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`POWER: ${d.power_level.toLocaleString()}`, 20, 85);

    ctx.fillStyle = '#00ff7f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`TIER: ${d.rank_tier}`, 20, 125);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Daily XP Gained: +${d.daily_xp} XP`, 20, 165);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.fillText('⚡ Real-time Esports HUD Matrix • Tournyx India', 20, 215);

    requestAnimationFrame(_renderPiPFrame);
  }

  // ─── 6. SCREEN SCANNER / NEURAL LINK ───────────────────────────────────────
  async function startScreenScan() {
    closeVisionModal();
    if (window.TournyxEngine && typeof window.TournyxEngine.startVisionScreenCapture === 'function') {
      window.TournyxEngine.startVisionScreenCapture();
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  return {
    init,
    openVisionModal,
    closeVisionModal,
    openScreenshotScanner,
    downloadAppPrompt,
    updateBubble,
    togglePictureInPicture,
    startScreenScan
  };

})();

window.TournyxVisionAI = TournyxVisionAI;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    TournyxVisionAI.init();
  }, 300);
});
