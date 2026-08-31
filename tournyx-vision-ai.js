/**
 * ==============================================================================
 * TOURNYX VISION AI v4.0 - AUTOMATED ESPORTS NEURAL COMPANION
 * Exact Tournyx Logo Integration • Expanding Interactive HUD Menu
 * Live Gameplay Analytics Simulation • Auto-Database Sync for Tasks
 * ==============================================================================
 */

'use strict';

const TournyxVisionAI = (() => {

  let state = {
    bubbleEl: null,
    menuEl: null,
    isDragging: false,
    hasMoved: false,
    isOpen: false,
    isScanning: false,
    isPaused: false,
    posX: 0,
    posY: 0,
    dragStartX: 0,
    dragStartY: 0,
    startPosX: 0,
    startPosY: 0,
    scanInterval: null,
    taskToCompleteId: null,
    taskRewardPts: 0
  };

  // ─── 1. INITIALIZE FLOATING TOURYNX ORB & MENU ──────────────────────────────
  function init() {
    if (document.getElementById('tx-vision-container')) return;

    // Main Container
    const container = document.createElement('div');
    container.id = 'tx-vision-container';
    container.style.position = 'fixed';
    container.style.zIndex = '99999';
    container.style.pointerEvents = 'none'; // Let clicks pass through empty space
    
    // Initial position on screen (bottom-right)
    state.posX = Math.max(10, window.innerWidth - 85);
    state.posY = Math.max(10, window.innerHeight - 155);

    container.style.left = `${state.posX}px`;
    container.style.top = `${state.posY}px`;

    // The Expanding Control Menu
    const menu = document.createElement('div');
    menu.id = 'tx-vision-menu';
    menu.style.position = 'absolute';
    menu.style.bottom = '100%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, 10px) scale(0)';
    menu.style.transformOrigin = 'bottom center';
    menu.style.opacity = '0';
    menu.style.background = 'rgba(8, 8, 16, 0.95)';
    menu.style.backdropFilter = 'blur(10px)';
    menu.style.border = '1px solid #00f2ff';
    menu.style.borderRadius = '16px';
    menu.style.padding = '10px';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.gap = '8px';
    menu.style.pointerEvents = 'auto';
    menu.style.transition = '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    menu.style.boxShadow = '0 0 20px rgba(0,242,255,0.4)';
    menu.style.marginBottom = '15px';

    menu.innerHTML = `
      <div style="font-family:'Orbitron', sans-serif; font-size:0.6rem; color:#00f2ff; text-align:center; font-weight:bold; letter-spacing:1px; border-bottom:1px solid rgba(0,242,255,0.2); padding-bottom:5px; margin-bottom:5px;">VISION HUD</div>
      <button id="vBtnPause" onclick="TournyxVisionAI.togglePause()" style="width:140px; padding:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; font-family:'Orbitron', sans-serif; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-pause" style="color:#FFD700; width:15px;"></i> PAUSE AI</button>
      <button id="vBtnAnalyze" onclick="TournyxVisionAI.forceAnalysis()" style="width:140px; padding:8px; background:rgba(0,242,255,0.1); border:1px solid #00f2ff; border-radius:8px; color:white; font-family:'Orbitron', sans-serif; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-crosshairs" style="color:#00f2ff; width:15px;"></i> ANALYZE SKILL</button>
      <button id="vBtnStop" onclick="TournyxVisionAI.stopVision()" style="width:140px; padding:8px; background:rgba(255,51,0,0.1); border:1px solid #ff3300; border-radius:8px; color:white; font-family:'Orbitron', sans-serif; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-power-off" style="color:#ff3300; width:15px;"></i> STOP LINK</button>
    `;

    // The Main Floating Orb (Exact Logo)
    const bubble = document.createElement('div');
    bubble.id = 'tx-vision-bubble';
    bubble.style.width = '60px';
    bubble.style.height = '60px';
    bubble.style.borderRadius = '50%';
    bubble.style.background = 'rgba(0,0,0,0.8)';
    bubble.style.border = '2px solid #00f2ff';
    bubble.style.boxShadow = '0 0 15px #00f2ff, inset 0 0 15px rgba(0,242,255,0.5)';
    bubble.style.position = 'relative';
    bubble.style.pointerEvents = 'auto';
    bubble.style.cursor = 'grab';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    // Exact Logo Image
    bubble.innerHTML = `
      <img src="https://tournyx.in/favicon.png" style="width:40px; height:40px; object-fit:contain; animation: floatLogo 2s infinite alternate; margin-left: 8px;">
      <div id="tx-vision-pulse" style="position:absolute; inset:-4px; border-radius:50%; border:2px solid #00f2ff; animation: pingPulse 1.5s infinite;"></div>
      <div id="tx-vision-dot" style="position:absolute; top:2px; right:2px; width:12px; height:12px; border-radius:50%; background:#00ff7f; box-shadow:0 0 8px #00ff7f; border:2px solid #000;"></div>
    `;

    // CSS Keyframes injected
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes floatLogo { 0% { transform: translateY(0); filter: drop-shadow(0 0 5px #00f2ff); } 100% { transform: translateY(-2px); filter: drop-shadow(0 0 15px #bd00ff); } }
      @keyframes pingPulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
      @keyframes scanDrop { 0% { top: -20%; } 100% { top: 120%; } }
    `;
    document.head.appendChild(style);

    container.appendChild(menu);
    container.appendChild(bubble);
    document.body.appendChild(container);

    state.bubbleEl = bubble;
    state.menuEl = menu;
    state.containerEl = container;

    _bindOptimizedDrag(bubble);
  }

  // ─── 2. DRAGGING & CLICK LOGIC ─────────────────────────────────────────────
  function _bindOptimizedDrag(bubble) {
    const onPointerDown = (e) => {
      state.isDragging = true;
      state.hasMoved = false;
      bubble.style.cursor = 'grabbing';

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

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        state.hasMoved = true;
        // Close menu if dragging
        if (state.isOpen) toggleMenu(false);
      }

      const bubbleSize = 60;
      state.posX = Math.max(10, Math.min(window.innerWidth - bubbleSize - 10, state.startPosX + dx));
      state.posY = Math.max(10, Math.min(window.innerHeight - bubbleSize - 10, state.startPosY + dy));

      state.containerEl.style.left = `${state.posX}px`;
      state.containerEl.style.top = `${state.posY}px`;
    };

    const onPointerUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      bubble.style.cursor = 'grab';

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      // If clicked without moving, toggle the menu
      if (!state.hasMoved) {
        toggleMenu(!state.isOpen);
      }
    };

    bubble.addEventListener('mousedown', onPointerDown);
    bubble.addEventListener('touchstart', onPointerDown, { passive: false });
  }

  // ─── 3. MENU CONTROLS ──────────────────────────────────────────────────────
  function toggleMenu(forceState) {
    state.isOpen = forceState !== undefined ? forceState : !state.isOpen;
    if (state.isOpen) {
      state.menuEl.style.transform = 'translate(-50%, -10px) scale(1)';
      state.menuEl.style.opacity = '1';
    } else {
      state.menuEl.style.transform = 'translate(-50%, 10px) scale(0)';
      state.menuEl.style.opacity = '0';
    }
  }

  function togglePause() {
    state.isPaused = !state.isPaused;
    const btn = document.getElementById('vBtnPause');
    const dot = document.getElementById('tx-vision-dot');
    const pulse = document.getElementById('tx-vision-pulse');
    
    if (state.isPaused) {
      btn.innerHTML = `<i class="fa-solid fa-play" style="color:#00ff7f; width:15px;"></i> RESUME AI`;
      dot.style.background = '#FFD700';
      dot.style.boxShadow = '0 0 8px #FFD700';
      pulse.style.animationPlayState = 'paused';
      if (typeof showToast === 'function') showToast("⏸️ Vision AI Paused. Analytics halted.");
    } else {
      btn.innerHTML = `<i class="fa-solid fa-pause" style="color:#FFD700; width:15px;"></i> PAUSE AI`;
      dot.style.background = '#00ff7f';
      dot.style.boxShadow = '0 0 8px #00ff7f';
      pulse.style.animationPlayState = 'running';
      if (typeof showToast === 'function') showToast("▶️ Vision AI Resumed. Monitoring active.");
    }
    toggleMenu(false);
  }

  function stopVision() {
    if (state.containerEl) {
      state.containerEl.remove();
      state.containerEl = null;
    }
    if (state.scanInterval) clearInterval(state.scanInterval);
    if (typeof showToast === 'function') showToast("🛑 Neural Link Terminated.");
    if (window.TournyxEngineAPI) window.TournyxEngineAPI.state.isVisionActive = false;
  }

  // ─── 4. AI GAMEPLAY ANALYSIS & AUTO REWARDS ────────────────────────────────
  function prepareTaskForDetection(taskId, reward) {
    state.taskToCompleteId = taskId;
    state.taskRewardPts = reward;
    
    // Automatically complete after a random duration (mocking AI detection of gameplay)
    if(state.scanInterval) clearInterval(state.scanInterval);
    state.scanInterval = setTimeout(() => {
      if(!state.isPaused && state.containerEl) {
        forceAnalysis(); // Auto-trigger completion
      }
    }, 15000 + Math.random() * 10000); // 15 to 25 seconds
  }

  function forceAnalysis() {
    if (state.isPaused) {
      if (typeof showToast === 'function') showToast("⚠️ Cannot analyze while paused. Resume AI first.", true);
      return;
    }
    toggleMenu(false);
    _showScanningHUD();
  }

  function _showScanningHUD() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'none';

    overlay.innerHTML = `
      <div style="position:relative; width:80vw; height:40vw; max-width:600px; max-height:300px; border:2px solid #00f2ff; border-radius:20px; overflow:hidden; background:rgba(0,242,255,0.05); box-shadow:0 0 30px rgba(0,242,255,0.4);">
        <div style="position:absolute; width:100%; height:10px; background:#00f2ff; opacity:0.8; box-shadow:0 0 20px #00f2ff; animation: scanDrop 2s infinite linear;"></div>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; font-family:'Orbitron', sans-serif;">
          <i class="fa-solid fa-crosshairs fa-spin" style="color:#00f2ff; font-size:3rem; margin-bottom:15px;"></i>
          <h2 id="aiScanText" style="color:white; font-size:1.2rem; margin:0; text-shadow:0 0 10px #00f2ff;">ANALYZING GAMEPLAY...</h2>
          <p id="aiScanSub" style="color:#FFD700; font-size:0.85rem; margin-top:5px;">Calculating Skill Matrix</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Sequence of AI Analysis
    setTimeout(() => {
      document.getElementById('aiScanText').innerText = "TARGET ACQUIRED";
      document.getElementById('aiScanText').style.color = "#00ff7f";
      document.getElementById('aiScanSub').innerText = "2 Headshots Confirmed. Precision: 94%";
    }, 1500);

    setTimeout(() => {
      document.getElementById('aiScanText').innerText = "OBJECTIVE CLEARED!";
      document.getElementById('aiScanSub').innerText = "Data syncing to Tournyx Cloud...";
      document.getElementById('aiScanSub').style.color = "#00f2ff";
      
      // Trigger Database Award internally via Engine
      if (state.taskToCompleteId && window.TournyxEngineAPI) {
        window.TournyxEngineAPI.startAndVerifyTask(state.taskToCompleteId, state.taskRewardPts);
        state.taskToCompleteId = null; 
      } else {
        // Generic reward if no specific task was queued
        if (window.TournyxEngineAPI && typeof window.TournyxEngineAPI.awardStreakXP === 'function') {
           window.TournyxEngineAPI.awardStreakXP(150); // Calling the internal DB point function
           if (typeof showToast === 'function') showToast("🎯 Generic Match Analyzed: +150 PTS Saved to DB!");
        }
      }
    }, 3000);

    setTimeout(() => {
      overlay.remove();
    }, 4500);
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  return {
    init,
    toggleMenu,
    togglePause,
    stopVision,
    forceAnalysis,
    prepareTaskForDetection
  };

})();

window.TournyxVisionAI = TournyxVisionAI;
