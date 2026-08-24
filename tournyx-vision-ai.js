/**
 * ==============================================================================
 * TOURNYX VISION AI v3.0 - MASTER HUD & NEURAL LINK
 * Indestructible Floating Orb • Full Mobile/Desktop Drag • Cyber Crest
 * Standalone Vision AI Modal • Multi-Window PiP • Mobile App Native Push
 * ==============================================================================
 */

'use strict';

const TournyxVisionAI = (() => {

  let state = {
    bubbleEl: null,
    modalEl: null,
    isDragging: false,
    hasMoved: false,
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

  // ─── 1. INITIALIZE FLOATING ORB & VISION MODAL ─────────────────────────────
  function init() {
    if (document.getElementById('tx-vision-bubble')) return;

    // 1. Create Floating Orb
    const bubble = document.createElement('div');
    bubble.id = 'tx-vision-bubble';
    
    // Initial position on screen (bottom-right)
    state.posX = Math.max(10, window.innerWidth - 76);
    state.posY = Math.max(10, window.innerHeight - 150);

    bubble.style.left = `${state.posX}px`;
    bubble.style.top = `${state.posY}px`;

    bubble.innerHTML = `
      <div id="tx-bubble-collapsed" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; pointer-events:none;">
        <div class="tx-cyber-crest">
          <svg width="40" height="40" viewBox="0 0 100 100" class="tx-crest-svg">
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
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#txCrestGrad)" stroke-width="2.5" stroke-dasharray="18 8 36 8" class="tx-ring-spin" />
            <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="rgba(8,8,16,0.95)" stroke="#00f2ff" stroke-width="2" filter="url(#txGlow)" />
            <circle cx="50" cy="50" r="14" fill="url(#txCrestGrad)" class="tx-core-pulse" />
            <path d="M40,42 L60,42 M50,42 L50,60 M56,48 L64,60 M44,48 L36,60" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
          </svg>
        </div>
        <div style="font-size:0.52rem; font-family:var(--eng-font-head, sans-serif); color:#00f2ff; letter-spacing:1px; margin-top:2px; font-weight:900; text-shadow:0 0 8px #00f2ff;">VISION</div>
        <div id="tx-bubble-xp-tag" style="font-size:0.56rem; font-family:var(--eng-font-head, sans-serif); color:#FFD700; font-weight:900; line-height:1;">+0 XP</div>
      </div>
    `;

    document.body.appendChild(bubble);
    state.bubbleEl = bubble;

    // 2. Create Standalone Vision AI Modal
    _injectVisionModal();
    _bindOptimizedDrag(bubble);
    _initPiPElements();

    if (window.TournyxEngine && window.TournyxEngine.state.engineData) {
      updateBubble(window.TournyxEngine.state.engineData);
    }
  }

  // ─── 2. VISION MODAL INJECTION ─────────────────────────────────────────────
  function _injectVisionModal() {
    if (document.getElementById('txVisionModalOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'txVisionModalOverlay';
    overlay.className = 'auth-popup-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeVisionModal(); };

    overlay.innerHTML = `
      <div class="auth-popup-box glass-panel" style="max-width:440px; width:92%; max-height:90vh; overflow-y:auto; border-radius:20px; padding:24px; position:relative;">
        <i class="fa-solid fa-xmark auth-close" onclick="TournyxVisionAI.closeVisionModal()" style="position:absolute; top:18px; right:20px; cursor:pointer; font-size:1.3rem; color:rgba(255,255,255,0.7);"></i>
        
        <!-- HEADER -->
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
          <div style="width:36px; height:36px; border-radius:50%; background:rgba(0,242,255,0.1); border:1.5px solid #00f2ff; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-eye fa-fade" style="color:#00f2ff; font-size:1.1rem;"></i>
          </div>
          <div>
            <h3 style="font-family:var(--eng-font-head, sans-serif); color:white; font-size:1.1rem; margin:0; letter-spacing:1px;">TOURNYX VISION AI HUD</h3>
            <span style="font-size:0.72rem; color:var(--accent-cyan, #00f2ff);">Neural Matrix Live Game Monitor</span>
          </div>
        </div>

        <!-- STATS BAR -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:rgba(255,255,255,0.03); border-radius:12px; padding:10px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
          <div>
            <div id="vmPower" style="font-family:var(--eng-font-head, sans-serif); font-size:1.1rem; font-weight:900; color:#FFD700;">100</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Power</div>
          </div>
          <div style="border-left:1px solid rgba(255,255,255,0.08); border-right:1px solid rgba(255,255,255,0.08);">
            <div id="vmRank" style="font-family:var(--eng-font-head, sans-serif); font-size:1.1rem; font-weight:900; color:#00f2ff;">E-RANK</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Tier</div>
          </div>
          <div>
            <div id="vmDailyXP" style="font-family:var(--eng-font-head, sans-serif); font-size:1.1rem; font-weight:900; color:#00ff7f;">+420</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.5); text-transform:uppercase;">Today XP</div>
          </div>
        </div>

        <!-- ACTIVE MISSION -->
        <div style="background:rgba(0,0,0,0.5); border-left:3px solid #00f2ff; border-radius:8px; padding:10px; margin-bottom:16px;">
          <div style="font-size:0.62rem; color:#00f2ff; font-family:var(--eng-font-head, sans-serif); font-weight:bold; margin-bottom:2px;">RECOMMENDED HUNTER OBJECTIVE</div>
          <div id="vmActiveMission" style="font-size:0.8rem; color:#eee; line-height:1.4;">Complete 3 ranked matches to surge power and unlock next tier!</div>
        </div>

        <!-- ACTIONS -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          
          <!-- MOBILE/PC SCREENSHOT OCR -->
          <button onclick="TournyxVisionAI.openScreenshotScanner()" style="width:100%; padding:12px; background:linear-gradient(90deg, #ff8c00, #ff3300); border:none; border-radius:10px; color:white; font-family:var(--eng-font-head, sans-serif); font-weight:bold; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 15px rgba(255,51,0,0.35);">
            <i class="fa-solid fa-camera"></i> 📸 SCAN MATCH SCREENSHOT (OCR)
          </button>

          <!-- LIVE SCREEN / CAMERA MONITOR -->
          <button onclick="TournyxVisionAI.startScreenScan()" style="width:100%; padding:11px; background:rgba(0,242,255,0.12); border:1px solid #00f2ff; border-radius:10px; color:#00f2ff; font-family:var(--eng-font-head, sans-serif); font-weight:bold; font-size:0.82rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fa-solid fa-desktop"></i> INITIALIZE LIVE NEURAL LINK
          </button>

          <!-- FLOATING MULTI-WINDOW PiP -->
          <button onclick="TournyxVisionAI.togglePictureInPicture(event)" style="width:100%; padding:10px; background:rgba(189,0,255,0.1); border:1px solid #bd00ff; border-radius:10px; color:#bd00ff; font-family:var(--eng-font-head, sans-serif); font-weight:bold; font-size:0.8rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fa-solid fa-up-right-from-square"></i> OPEN FLOATING OVERLAY (PiP)
          </button>

          <!-- NATIVE APP DOWNLOAD PROMPT -->
          <div style="background:rgba(255,215,0,0.06); border:1px dashed #FFD700; border-radius:10px; padding:12px; margin-top:4px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <i class="fa-solid fa-mobile-screen-button" style="color:#FFD700;"></i>
              <b style="color:#FFD700; font-family:var(--eng-font-head, sans-serif); font-size:0.82rem;">TOURNYX MOBILE APP (ANDROID / IOS)</b>
            </div>
            <p style="font-size:0.72rem; color:#ccc; margin:0 0 8px; line-height:1.3;">
              Get in-game floating bubbles directly inside BGMI & Free Fire with automatic background screen recognition!
            </p>
            <button onclick="TournyxVisionAI.downloadAppPrompt()" style="width:100%; padding:8px; background:rgba(255,215,0,0.2); border:1px solid #FFD700; border-radius:6px; color:#FFD700; font-size:0.75rem; font-family:var(--eng-font-head, sans-serif); font-weight:bold; cursor:pointer;">
              <i class="fa-brands fa-google-play"></i> DOWNLOAD NATIVE APK
            </button>
          </div>

          <!-- OPEN SYSTEM ENGINE -->
          <button onclick="TournyxVisionAI.closeVisionModal(); TournyxEngineAPI.openSystemPopup();" style="width:100%; margin-top:6px; padding:12px; background:linear-gradient(90deg, var(--accent-purple, #bd00ff), var(--accent-cyan, #00f2ff)); border:none; border-radius:10px; color:white; font-family:var(--eng-font-head, sans-serif); font-weight:bold; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
            ⚡ LAUNCH FULL ENGINE OS
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    state.modalEl = overlay;
  }

  function openVisionModal() {
    _injectVisionModal();
    const modal = document.getElementById('txVisionModalOverlay');
    if (modal) {
      modal.classList.add('active');
      if (window.TournyxEngine && window.TournyxEngine.state.engineData) {
        updateBubble(window.TournyxEngine.state.engineData);
      }
    }
  }

  function closeVisionModal() {
    const modal = document.getElementById('txVisionModalOverlay');
    if (modal) modal.classList.remove('active');
  }

  function openScreenshotScanner() {
    closeVisionModal();
    if (window.TournyxEngine && typeof window.TournyxEngine.openSystemPopup === 'function') {
      window.TournyxEngine.openSystemPopup();
      window.TournyxEngine.switchEngineTab('vision-ai');
      setTimeout(() => {
        document.getElementById('vas-screenshot-input')?.click();
      }, 300);
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
