/**
 * ==============================================================================
 * TOURNYX VISION AI v2.5 - MASTER HUD & NEURAL LINK
 * Hardware-Accelerated Mobile Dragging • Magnetic Docking • Tournyx Cyber Crest
 * Multi-Window Picture-in-Picture • Live Frame & Screenshot Scanner
 * ==============================================================================
 */

'use strict';

const TournyxVisionAI = (() => {

  let state = {
    bubbleEl: null,
    isExpanded: false,
    isDragging: false,
    hasMoved: false,
    posX: 0,
    posY: 0,
    dragStartX: 0,
    dragStartY: 0,
    startPosX: 0,
    startPosY: 0,
    rafId: null,
    pipVideo: null,
    pipCanvas: null,
    pipCtx: null,
  };

  // ─── 1. INITIALIZE FLOATING BUBBLE ─────────────────────────────────────────
  function init() {
    if (document.getElementById('tx-vision-bubble')) return;

    const bubble = document.createElement('div');
    bubble.id = 'tx-vision-bubble';
    
    // Initial position on screen (bottom-right)
    const initRight = 16;
    const initBottom = 90;
    state.posX = window.innerWidth - 76 - initRight;
    state.posY = window.innerHeight - 76 - initBottom;

    bubble.style.transform = `translate3d(${state.posX}px, ${state.posY}px, 0)`;

    bubble.innerHTML = `
      <div id="tx-bubble-collapsed" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; pointer-events:none;">
        <!-- TOURNYX CYBER CREST LOGO SVG -->
        <div class="tx-cyber-crest">
          <svg width="42" height="42" viewBox="0 0 100 100" class="tx-crest-svg">
            <defs>
              <linearGradient id="txCrestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f2ff" />
                <stop offset="50%" stop-color="#bd00ff" />
                <stop offset="100%" stop-color="#ff3300" />
              </linearGradient>
              <filter id="txGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <!-- Rotating Outer Cyber Ring -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#txCrestGrad)" stroke-width="2.5" stroke-dasharray="18 8 36 8" class="tx-ring-spin" />
            <!-- Hexagonal Armor Plate -->
            <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="rgba(8,8,16,0.9)" stroke="#00f2ff" stroke-width="2" filter="url(#txGlow)" />
            <!-- Inner Pulsing Core -->
            <circle cx="50" cy="50" r="14" fill="url(#txCrestGrad)" class="tx-core-pulse" />
            <!-- TX Monogram Symbol -->
            <path d="M40,42 L60,42 M50,42 L50,60 M56,48 L64,60 M44,48 L36,60" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
          </svg>
        </div>
        <div style="font-size:0.52rem; font-family:var(--font-head); color:#00f2ff; letter-spacing:1px; margin-top:2px; font-weight:900; text-shadow:0 0 8px #00f2ff;">VISION</div>
        <div id="tx-bubble-xp-tag" style="font-size:0.56rem; font-family:var(--font-head); color:#FFD700; font-weight:900; line-height:1;">+0 XP</div>
      </div>

      <div id="tx-bubble-expanded" style="display:none; width:100%;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(0,242,255,0.25); padding-bottom:6px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:10px; height:10px; border-radius:50%; background:#00f2ff; box-shadow:0 0 10px #00f2ff; animation:pulse 1.5s infinite;"></div>
            <span style="font-family:var(--font-head); font-size:0.8rem; font-weight:900; color:white; letter-spacing:1px;">TOURNYX VISION AI</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="tx-pip-btn" onclick="TournyxVisionAI.togglePictureInPicture(event)" title="Open Floating Overlay (PiP)" style="background:none; border:none; color:var(--accent-cyan); cursor:pointer; font-size:0.85rem; padding:4px;">
              <i class="fa-solid fa-up-right-from-square"></i>
            </button>
            <button id="tx-bubble-close-btn" style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:1.1rem; padding:0 6px;">✕</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px 4px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.06);">
          <div style="text-align:center;">
            <div id="hudPower" style="font-family:var(--font-head); font-size:0.85rem; font-weight:bold; color:#FFD700;">100</div>
            <div style="font-size:0.55rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Power</div>
          </div>
          <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.08); border-right:1px solid rgba(255,255,255,0.08);">
            <div id="hudRank" style="font-family:var(--font-head); font-size:0.85rem; font-weight:bold; color:#00f2ff;">E-RANK</div>
            <div style="font-size:0.55rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Tier</div>
          </div>
          <div style="text-align:center;">
            <div id="hudDailyXP" style="font-family:var(--font-head); font-size:0.85rem; font-weight:bold; color:#00ff7f;">+420</div>
            <div style="font-size:0.55rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Today XP</div>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.5); border-left:3px solid var(--accent-cyan); border-radius:6px; padding:8px; margin-bottom:10px;">
          <div style="font-size:0.6rem; color:var(--accent-cyan); font-family:var(--font-head); font-weight:bold; margin-bottom:2px;">ACTIVE HUNTER MISSION</div>
          <div id="hudActiveMission" style="font-size:0.75rem; color:#eee; line-height:1.3;">Headshot Hunter: Deal 10 headshots in Ranked BR</div>
        </div>

        <div style="display:flex; gap:6px;">
          <button onclick="TournyxEngineAPI.openSystemPopup()" style="flex:1; padding:9px; background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border:none; border-radius:8px; color:white; font-family:var(--font-head); font-size:0.72rem; font-weight:bold; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
            OPEN SYSTEM OS
          </button>
          <button onclick="TournyxVisionAI.startScreenScan()" style="padding:9px 12px; background:rgba(255,140,0,0.15); border:1px solid var(--accent-orange); border-radius:8px; color:var(--accent-orange); font-size:0.75rem; font-weight:bold; cursor:pointer;" title="Start Neural Link / Screenshot Upload">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bubble);
    state.bubbleEl = bubble;

    _bindOptimizedDrag(bubble);
    _initPiPElements();

    // Sync initial state
    if (window.TournyxEngine && window.TournyxEngine.state.engineData) {
      updateBubble(window.TournyxEngine.state.engineData);
    }
  }

  // ─── 2. ZERO-LAG HARDWARE-ACCELERATED DRAGGING ─────────────────────────────
  function _bindOptimizedDrag(bubble) {
    const closeBtn = document.getElementById('tx-bubble-close-btn');

    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      _collapse();
    });

    const onPointerDown = (e) => {
      if (state.isExpanded) {
        // If expanded, don't drag unless on header
        if (!e.target.closest('#tx-bubble-expanded > div:first-child')) return;
      }

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

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        state.hasMoved = true;
      }

      const bubbleW = state.isExpanded ? 280 : 66;
      const bubbleH = state.isExpanded ? 220 : 66;

      // Bound within screen viewport
      state.posX = Math.max(8, Math.min(window.innerWidth - bubbleW - 8, state.startPosX + dx));
      state.posY = Math.max(8, Math.min(window.innerHeight - bubbleH - 8, state.startPosY + dy));

      if (!state.rafId) {
        state.rafId = requestAnimationFrame(() => {
          bubble.style.transform = `translate3d(${state.posX}px, ${state.posY}px, 0)`;
          state.rafId = null;
        });
      }
    };

    const onPointerUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      bubble.classList.remove('is-dragging');

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (!state.hasMoved && !state.isExpanded) {
        _expand();
        return;
      }

      // Magnetic snap to closest horizontal edge when collapsed
      if (!state.isExpanded) {
        const bubbleW = 66;
        const screenMid = window.innerWidth / 2;
        const snapX = (state.posX + bubbleW / 2 < screenMid) ? 12 : (window.innerWidth - bubbleW - 12);
        state.posX = snapX;
        
        bubble.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.2)';
        bubble.style.transform = `translate3d(${state.posX}px, ${state.posY}px, 0)`;
        setTimeout(() => { bubble.style.transition = ''; }, 300);
      }
    };

    bubble.addEventListener('mousedown', onPointerDown);
    bubble.addEventListener('touchstart', onPointerDown, { passive: false });
  }

  function _expand() {
    state.isExpanded = true;
    state.bubbleEl.classList.add('expanded');
    document.getElementById('tx-bubble-collapsed').style.display = 'none';
    document.getElementById('tx-bubble-expanded').style.display = 'block';
    
    // Reposition safely if expanded element overflows right/bottom
    const bubbleW = 280;
    const bubbleH = 220;
    if (state.posX + bubbleW > window.innerWidth - 8) {
      state.posX = window.innerWidth - bubbleW - 8;
    }
    if (state.posY + bubbleH > window.innerHeight - 8) {
      state.posY = window.innerHeight - bubbleH - 8;
    }
    state.bubbleEl.style.transform = `translate3d(${state.posX}px, ${state.posY}px, 0)`;
  }

  function _collapse() {
    state.isExpanded = false;
    state.bubbleEl.classList.remove('expanded');
    document.getElementById('tx-bubble-collapsed').style.display = 'flex';
    document.getElementById('tx-bubble-expanded').style.display = 'none';
  }

  // ─── 3. UPDATE BUBBLE STATS ────────────────────────────────────────────────
  function updateBubble(engineData) {
    if (!engineData) return;
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    setTxt('tx-bubble-xp-tag', `+${engineData.daily_xp || 0} XP`);
    setTxt('hudPower', (engineData.power_level || 100).toLocaleString());
    setTxt('hudRank', engineData.rank_tier || 'E-RANK');
    setTxt('hudDailyXP', `+${engineData.daily_xp || 0}`);
    
    const dna = engineData.player_dna || 'Rusher';
    setTxt('hudActiveMission', `${dna} Program: Complete ranked matches & boost power!`);
  }

  // ─── 4. PICTURE-IN-PICTURE (MULTI-WINDOW HUD) ──────────────────────────────
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
      if (typeof showToast === 'function') showToast('Multi-window PiP not supported on this browser.', true);
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

  // ─── 5. SCREEN SCANNER / NEURAL LINK ───────────────────────────────────────
  async function startScreenScan() {
    if (window.TournyxEngine && typeof window.TournyxEngine.startVisionScreenCapture === 'function') {
      window.TournyxEngine.startVisionScreenCapture();
    }
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  return {
    init,
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
