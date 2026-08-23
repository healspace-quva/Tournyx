/**
 * ==============================================================================
 * TOURNYX VISION AI v2.0 - LIVE GAMEPLAY HUD & NEURAL LINK
 * Floating Bubble • Picture-in-Picture Multi-Window • Frame Analyzer
 * ==============================================================================
 */

'use strict';

const TournyxVisionAI = (() => {

  let state = {
    bubbleEl: null,
    isExpanded: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    elemStartX: 0,
    elemStartY: 0,
    currentQuest: null,
    activeStream: null,
    scanInterval: null,
    pipVideo: null,
    pipCanvas: null,
    pipCtx: null,
  };

  // ─── 1. INITIALIZE FLOATING BUBBLE ─────────────────────────────────────────
  function init() {
    if (document.getElementById('tx-vision-bubble')) return;

    const bubble = document.createElement('div');
    bubble.id = 'tx-vision-bubble';
    bubble.innerHTML = `
      <div id="tx-bubble-collapsed" style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%;">
        <div style="font-size:1.45rem; filter:drop-shadow(0 0 8px #00f2ff);">👁️</div>
        <div style="font-size:0.52rem; font-family:var(--font-head); color:#00f2ff; letter-spacing:1px; margin-top:2px; font-weight:bold;">VISION</div>
        <div id="tx-bubble-xp-tag" style="font-size:0.58rem; font-family:var(--font-head); color:#FFD700; font-weight:900;">+0 XP</div>
      </div>

      <div id="tx-bubble-expanded" style="display:none; width:100%;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(0,242,255,0.2); padding-bottom:6px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-eye fa-fade" style="color:var(--accent-cyan); font-size:0.85rem;"></i>
            <span style="font-family:var(--font-head); font-size:0.78rem; font-weight:bold; color:white; letter-spacing:1px;">VISION AI HUD</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button id="tx-pip-btn" onclick="TournyxVisionAI.togglePictureInPicture(event)" title="Open Multi-Window / PiP" style="background:none; border:none; color:var(--accent-cyan); cursor:pointer; font-size:0.85rem; padding:2px;">
              <i class="fa-solid fa-up-right-from-square"></i>
            </button>
            <button id="tx-bubble-close-btn" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; font-size:1.1rem; padding:0 4px;">✕</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px 4px; margin-bottom:10px;">
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

        <div style="background:rgba(0,0,0,0.4); border-left:3px solid var(--accent-cyan); border-radius:6px; padding:8px; margin-bottom:10px;">
          <div style="font-size:0.62rem; color:var(--accent-cyan); font-family:var(--font-head); margin-bottom:2px;">ACTIVE HUNTER MISSION</div>
          <div id="hudActiveMission" style="font-size:0.75rem; color:#eee; line-height:1.3;">Headshot Hunter: Deal 10 headshots in Ranked BR</div>
        </div>

        <div style="display:flex; gap:6px;">
          <button onclick="TournyxEngineAPI.openSystemPopup()" style="flex:1; padding:8px; background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border:none; border-radius:8px; color:white; font-family:var(--font-head); font-size:0.72rem; font-weight:bold; cursor:pointer; text-transform:uppercase;">
            OPEN ENGINE
          </button>
          <button onclick="TournyxVisionAI.startScreenScan()" style="padding:8px 10px; background:rgba(255,140,0,0.15); border:1px solid var(--accent-orange); border-radius:8px; color:var(--accent-orange); font-size:0.72rem; font-weight:bold; cursor:pointer;" title="Start Neural Link">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bubble);
    state.bubbleEl = bubble;

    _bindDragAndClick(bubble);
    _initPiPElements();

    // Sync initial state
    if (window.TournyxEngine && window.TournyxEngine.state.engineData) {
      updateBubble(window.TournyxEngine.state.engineData);
    }
  }

  // ─── 2. BIND DRAGGING & INTERACTIONS ───────────────────────────────────────
  function _bindDragAndClick(bubble) {
    const collapsed = document.getElementById('tx-bubble-collapsed');
    const closeBtn = document.getElementById('tx-bubble-close-btn');

    collapsed.addEventListener('click', (e) => {
      if (!state.isDragging) _expand();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _collapse();
    });

    const onPointerDown = (e) => {
      if (e.target.closest('#tx-bubble-expanded button')) return;
      state.isDragging = false;
      state.dragStartX = e.touches ? e.touches[0].clientX : e.clientX;
      state.dragStartY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const rect = bubble.getBoundingClientRect();
      state.elemStartX = rect.left;
      state.elemStartY = rect.top;

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    };

    const onPointerMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - state.dragStartX;
      const dy = cy - state.dragStartY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        state.isDragging = true;
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
        bubble.style.left = `${state.elemStartX + dx}px`;
        bubble.style.top = `${state.elemStartY + dy}px`;
      }
    };

    const onPointerUp = () => {
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', onPointerUp);
      setTimeout(() => { state.isDragging = false; }, 80);
    };

    bubble.addEventListener('mousedown', onPointerDown);
    bubble.addEventListener('touchstart', onPointerDown, { passive: true });
  }

  function _expand() {
    state.isExpanded = true;
    state.bubbleEl.classList.add('expanded');
    document.getElementById('tx-bubble-collapsed').style.display = 'none';
    document.getElementById('tx-bubble-expanded').style.display = 'block';
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
    setTxt('hudActiveMission', `${dna} Focus: Complete daily drills & climb to SSS-Rank!`);
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
      if (typeof showToast === 'function') showToast('Picture-in-Picture not supported in this browser.', true);
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        _renderPiPFrame();
        await state.pipVideo.play();
        await state.pipVideo.requestPictureInPicture();
        if (typeof showToast === 'function') showToast('🎮 Tournyx HUD Floating Overlay Active!');
      }
    } catch(err) {
      console.warn('PiP launch exception:', err);
    }
  }

  function _renderPiPFrame() {
    if (!state.pipCtx) return;
    const ctx = state.pipCtx;
    const d = (window.TournyxEngine && window.TournyxEngine.state.engineData) || { power_level: 1200, rank_tier: 'A-RANK', daily_xp: 420 };

    // Background
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, 400, 250);

    // Neon Border
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 388, 238);

    // Header
    ctx.fillStyle = '#00f2ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('TOURNYX VISION AI HUD', 20, 36);

    // Power
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`POWER: ${d.power_level.toLocaleString()}`, 20, 85);

    // Rank Tier
    ctx.fillStyle = '#00ff7f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`TIER: ${d.rank_tier}`, 20, 125);

    // XP
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Daily XP Gained: +${d.daily_xp} XP`, 20, 165);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px sans-serif';
    ctx.fillText('⚡ Monitoring Live Esports Matrix • Bharat Gaming', 20, 215);

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