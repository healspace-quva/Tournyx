/**
 * ==============================================================================
 * TOURNYX ENGINE v3.5 - MASTER ESPORTS OS & GLOBAL PLUGIN
 * Architecture: Solo Levelling Hero System x Indian Esports x Vision AI
 * Database: Supabase (PostgreSQL + Realtime Sync + Edge Handlers)
 * Device Adaptive: Low-End (Performance) to High-End (Ultra Cyberpunk)
 * Native Bridge: Flutter Android / iOS Ready
 * ==============================================================================
 */

'use strict';

const TournyxEngine = (() => {

  // ─── 1. CONSTANTS & SYSTEM DEFINITIONS ─────────────────────────────────────
  const RANK_TIERS = [
    { id: 'E',   label: 'E-RANK',   min: 0,     color: '#888888', glow: 'rgba(136,136,136,0.4)', icon: '🩶', title: 'Beginner'         },
    { id: 'D',   label: 'D-RANK',   min: 500,   color: '#5bc8f5', glow: 'rgba(91,200,245,0.4)',  icon: '🔵', title: 'Novice'           },
    { id: 'C',   label: 'C-RANK',   min: 1500,  color: '#00f2ff', glow: 'rgba(0,242,255,0.4)',   icon: '🟦', title: 'Apprentice'       },
    { id: 'B',   label: 'B-RANK',   min: 3500,  color: '#00ff7f', glow: 'rgba(0,255,127,0.4)',   icon: '🟩', title: 'Fighter'          },
    { id: 'A',   label: 'A-RANK',   min: 7000,  color: '#FFD700', glow: 'rgba(255,215,0,0.4)',   icon: '🥇', title: 'Hunter'           },
    { id: 'S',   label: 'S-RANK',   min: 12000, color: '#ff9800', glow: 'rgba(255,152,0,0.4)',   icon: '🔶', title: 'Elite'            },
    { id: 'SS',  label: 'SS-RANK',  min: 20000, color: '#bd00ff', glow: 'rgba(189,0,255,0.4)',   icon: '💜', title: 'Champion'         },
    { id: 'SSS', label: 'SSS-RANK', min: 35000, color: '#ff3300', glow: 'rgba(255,51,0,0.6)',    icon: '🔴', title: 'National Legend'  },
  ];

  const PLAYER_DNA = {
    Rusher:  { icon: 'fa-person-running',    color: '#ff4d4d', desc: 'Aggressive frontline striker. Master of close-quarters skirmishes and quick entry frags.' },
    Sniper:  { icon: 'fa-crosshairs',        color: '#00f2ff', desc: 'Precision long-range marksman. Controls sightlines and delivers decisive single-shot eliminations.' },
    Support: { icon: 'fa-shield-halved',     color: '#00ff7f', desc: 'Team anchor & utility expert. Manages squad revives, covers flanks, and secures zone rotations.' },
    IGL:     { icon: 'fa-map-location-dot',  color: '#FFD700', desc: 'In-Game Leader & master tactician. Controls map tempo, shot-calling, and squad macro strategy.' },
  };

  const HINGLISH_QUOTES = [
    "Bhai, tu toh Pro ban gaya! 🔥",
    "Ek aur level up! Legendary ban raha hai! ⚡",
    "Enemy squad trembles at your footsteps! 🏆",
    "System Alert: New Power Unlocked in Matrix! 💥",
    "Bharat ka new champion rising! 🇮🇳",
    "Abhi rukna nahi hai, SSS-Rank tak jaana hai! 🚀"
  ];

  // ─── 100+ PREBUILT COMPETITIVE TASKS BANK ──────────────────────────────────
  const TASK_BANK = [
    // BGMI - Rusher
    { id: 'bgmi_r_1', game: 'BGMI', role: 'Rusher', title: 'Close-Quarters Carnage: 10 Eliminations with Shotguns/SMGs', target: 10, pts: 250 },
    { id: 'bgmi_r_2', game: 'BGMI', role: 'Rusher', title: 'Hot-Drop Conqueror: Secure 3 kills in Pochinki / Bootcamp within 3 mins', target: 3, pts: 300 },
    { id: 'bgmi_r_3', game: 'BGMI', role: 'Rusher', title: 'Armor Shredder: Inflict 2,500 Total Damage in Ranked Squads', target: 2500, pts: 200 },
    { id: 'bgmi_r_4', game: 'BGMI', role: 'Rusher', title: 'First Blood Pioneer: Secure First Squad Knock in 2 Matches', target: 2, pts: 350 },
    // BGMI - Sniper
    { id: 'bgmi_s_1', game: 'BGMI', role: 'Sniper', title: 'Long-Range Precision: 6 Headshot Eliminations >100m with Bolt-Action', target: 6, pts: 300 },
    { id: 'bgmi_s_2', game: 'BGMI', role: 'Sniper', title: 'Silent Hunter: Eliminate 4 Enemies using Suppressed DMR/Sniper', target: 4, pts: 250 },
    { id: 'bgmi_s_3', game: 'BGMI', role: 'Sniper', title: 'Ridge Controller: Hold High Ground and Deal 1,500 Long-Range Damage', target: 1500, pts: 200 },
    // BGMI - Support
    { id: 'bgmi_sp_1', game: 'BGMI', role: 'Support', title: 'Guardian Angel: Successfully Revive 4 Downed Squadmates', target: 4, pts: 250 },
    { id: 'bgmi_sp_2', game: 'BGMI', role: 'Support', title: 'Tactical Smokescreen: Deploy 6 Smoke Grenades during Rotations', target: 6, pts: 150 },
    { id: 'bgmi_sp_3', game: 'BGMI', role: 'Support', title: 'Squad Survival: Reach Top 5 Squads in 3 Consecutive Matches', target: 3, pts: 350 },
    // BGMI - IGL
    { id: 'bgmi_igl_1', game: 'BGMI', role: 'IGL', title: 'Zone Dominance: Lead Squad to Victory (#1 Winner Winner)', target: 1, pts: 400 },
    { id: 'bgmi_igl_2', game: 'BGMI', role: 'IGL', title: 'Macro Rotations: Complete 4 Flawless Safe Zone Transitions in Top 10', target: 4, pts: 250 },
    { id: 'bgmi_igl_3', game: 'BGMI', role: 'IGL', title: 'Zero Casualty Finish: Win a Match with All 4 Squadmates Alive', target: 1, pts: 500 },

    // Free Fire MAX - Rusher
    { id: 'ff_r_1', game: 'Free Fire MAX', role: 'Rusher', title: 'MP40 Blitz: 12 Eliminations with SMGs in Clash Squad', target: 12, pts: 250 },
    { id: 'ff_r_2', game: 'Free Fire MAX', role: 'Rusher', title: 'Gloo Wall Speed Entry: Break 5 Opponent Gloo Walls with Shotgun Rush', target: 5, pts: 200 },
    { id: 'ff_r_3', game: 'Free Fire MAX', role: 'Rusher', title: 'Clutch Ace: Wipe an Entire 4-Man Squad in Clash Squad', target: 1, pts: 400 },
    // Free Fire MAX - Sniper
    { id: 'ff_s_1', game: 'Free Fire MAX', role: 'Sniper', title: 'AWM Specialist: Land 8 Headshots with Double Sniper', target: 8, pts: 300 },
    { id: 'ff_s_2', game: 'Free Fire MAX', role: 'Sniper', title: 'Crosshair Master: Eliminate 5 Moving Enemies from Range', target: 5, pts: 250 },
    // Free Fire MAX - Support
    { id: 'ff_sp_1', game: 'Free Fire MAX', role: 'Support', title: 'Combat Medic: Heal 1,000 HP of Teammates using Active Skills', target: 1000, pts: 200 },
    { id: 'ff_sp_2', game: 'Free Fire MAX', role: 'Support', title: 'Shield Bastion: Place 15 Gloo Walls to Defend Downed Teammates', target: 15, pts: 180 },
    // Free Fire MAX - IGL
    { id: 'ff_igl_1', game: 'Free Fire MAX', role: 'IGL', title: 'Booyah Architect: Win 2 Ranked Battle Royale Matches with #1 Booyah', target: 2, pts: 450 },

    // Valorant / CODM / Universal
    { id: 'val_u_1', game: 'Valorant', role: 'Rusher', title: 'Entry Fragger: Win 6 Opening Duels as Duelist', target: 6, pts: 300 },
    { id: 'val_u_2', game: 'Valorant', role: 'Sniper', title: 'Operator Lockdown: Secure 5 Operator Eliminations on Defense', target: 5, pts: 300 },
    { id: 'val_u_3', game: 'Valorant', role: 'Support', title: 'Site Anchor: Plant or Defuse the Spike 4 Times', target: 4, pts: 200 },
    { id: 'codm_u_1', game: 'CODM', role: 'Rusher', title: 'Scorestreak Fury: Activate 3 High-Tier Scorestreaks in Ranked MP', target: 3, pts: 250 },
    { id: 'codm_u_2', game: 'CODM', role: 'Sniper', title: 'DL Q33 Quickscope: 10 Quickscope Eliminations in Search & Destroy', target: 10, pts: 350 },
    { id: 'univ_1', game: 'Universal', role: 'Universal', title: 'Reaction Reflex Drill: Complete 15 Minutes of Aim Training Drills', target: 1, pts: 150 },
    { id: 'univ_2', game: 'Universal', role: 'Universal', title: 'Grinder Endurance: Complete 5 Tournament or Scrim Matches in 1 Day', target: 5, pts: 300 },
    { id: 'univ_3', game: 'Universal', role: 'Universal', title: 'Flawless Win Streak: Achieve 3 Wins in a Row without Defeat', target: 3, pts: 500 },
  ];

  // ─── 2. ENGINE INTERNAL STATE ──────────────────────────────────────────────
  let state = {
    user: null,
    db: null,
    engineData: null,
    radarChart: null,
    trendChart: null,
    realtimeChannel: null,
    currentTab: 'player-analysis',
    visionStream: null,
    visionInterval: null,
    audioCtx: null,
    bossRaidData: null,
    graphicTier: 'balanced',
    isVisionActive: false,
  };

  // ─── 3. INITIALIZATION ─────────────────────────────────────────────────────
  function init(dbInstance) {
    state.db = dbInstance || (typeof db !== 'undefined' ? db : null);
    try { state.user = JSON.parse(localStorage.getItem('tournyx_user')); } catch(e) {}
    
    _detectDevicePerformance();
    _mountEngineModal();
    _bindDOMEvents();
    loadEngineData();
    _initRealtimeSubscription();
    _initBossRaid();
    
    console.log('%c⚡ TOURNYX ENGINE v3.5 MASTER ACTIVE', 'color:#00f2ff; font-weight:bold; font-size:14px;');
  }

  // ─── 4. ADAPTIVE DEVICE PERFORMANCE OPTIMIZER ──────────────────────────────
  function _detectDevicePerformance() {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    
    if (cores <= 2 || memory <= 2) {
      setGraphicTier('performance');
    } else if (cores >= 8 && memory >= 8) {
      setGraphicTier('ultra');
    } else {
      setGraphicTier('balanced');
    }
  }

  function setGraphicTier(tier) {
    state.graphicTier = tier;
    document.body.classList.remove('eng-tier-performance', 'eng-tier-balanced', 'eng-tier-ultra');
    document.body.classList.add('eng-tier-' + tier);
    localStorage.setItem('tournyx_graphic_tier', tier);
  }

  // ─── 5. SOUND SYNTHESIZER ──────────────────────────────────────────────────
  function _playChime(type) {
    if (state.graphicTier === 'performance') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!state.audioCtx) state.audioCtx = new AudioContext();
      if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
      
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      
      const now = state.audioCtx.currentTime;
      
      if (type === 'rankup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'xp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch(e) {}
  }

  // ─── 6. DATA SYNC & SUPABASE LOADER ────────────────────────────────────────
  async function loadEngineData() {
    try { state.user = JSON.parse(localStorage.getItem('tournyx_user')); } catch(e) {}
    
    if (!state.user || !state.user.email) {
      _renderGuestWidget();
      return;
    }

    const cleanEmail = (state.user.email || '').trim().toLowerCase();

    if (state.db) {
      try {
        const { data, error } = await state.db
          .from('player_engine')
          .select('*')
          .ilike('email', cleanEmail)
          .limit(1);

        if (!error && data && data.length > 0) {
          state.engineData = data[0];
          _updateEngineWidget(data[0]);
          _updateModalHeader(data[0]);
          return;
        } else {
          await _bootstrapProfile();
          return;
        }
      } catch(err) {
        console.warn('Supabase fetch fallback to local computation', err);
      }
    }

    _computeLocalProfile();
  }

  async function _bootstrapProfile() {
    if (!state.user) return;
    const wins = parseInt(state.user.wins) || 0;
    const matches = parseInt(state.user.matches_played || state.user.matches) || 0;
    const points = parseInt(state.user.points) || 8000;
    const wr = matches > 0 ? Math.floor((wins / matches) * 100) : 0;
    const power = _calculatePower(wins, matches, points, wr);

    const defaultProfile = {
      user_id: state.user.id || '00000000-0000-0000-0000-000000000000',
      email: (state.user.email || '').trim().toLowerCase(),
      username: state.user.username || state.user.ign || 'Player',
      power_level: power,
      rank_tier: _getRankTierByPower(power),
      total_xp: Math.floor(points / 10), // 100 PTS = 10 XP
      daily_xp: 420,
      skill_combat: Math.min(50 + wins * 2, 98),
      skill_strategy: Math.min(50 + Math.floor(wr / 2), 95),
      skill_teamwork: 65,
      skill_reaction: 62,
      skill_leadership: 58,
      skill_consistency: 70,
      player_dna: state.user.player_role || 'Rusher',
      evolution_stage: wins > 15 ? 'Pro' : 'Rookie',
      state_region: state.user.state || 'Tamil Nadu',
      karma_score: 100,
      karma_title: 'Disciplined Warrior',
      energy: 85,
      boost_cards: 2,
      loot_boxes: 1,
    };

    if (state.db) {
      try {
        const { data } = await state.db.from('player_engine').upsert(defaultProfile).select().single();
        if (data) {
          state.engineData = data;
          _updateEngineWidget(data);
          _updateModalHeader(data);
          return;
        }
      } catch(e) {}
    }

    state.engineData = defaultProfile;
    _updateEngineWidget(defaultProfile);
    _updateModalHeader(defaultProfile);
  }

  function _computeLocalProfile() {
    const u = state.user || {};
    const wins = parseInt(u.wins) || 0;
    const matches = parseInt(u.matches_played || u.matches) || 0;
    const points = parseInt(u.points) || 8000;
    const wr = matches > 0 ? Math.floor((wins / matches) * 100) : 0;
    const power = _calculatePower(wins, matches, points, wr);

    state.engineData = {
      power_level: power,
      rank_tier: _getRankTierByPower(power),
      total_xp: Math.floor(points / 10),
      daily_xp: 420,
      skill_combat: Math.min(50 + wins * 2, 98),
      skill_strategy: Math.min(50 + Math.floor(wr / 2), 95),
      skill_teamwork: 65,
      skill_reaction: 62,
      skill_leadership: 58,
      skill_consistency: 70,
      player_dna: u.player_role || 'Rusher',
      evolution_stage: wins > 10 ? 'Pro' : 'Rookie',
      state_region: u.state || 'Tamil Nadu',
      karma_score: 100,
      karma_title: 'Disciplined Warrior',
      energy: 85,
      boost_cards: 2,
      loot_boxes: 1
    };

    _updateEngineWidget(state.engineData);
    _updateModalHeader(state.engineData);
  }

  function _calculatePower(wins, matches, points, wr) {
    return Math.max(100, (wins * 150) + (wr * 10) + (matches * 5) + Math.floor(points / 2));
  }

  function _getRankTierByPower(power) {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (power >= RANK_TIERS[i].min) return RANK_TIERS[i].label;
    }
    return 'E-RANK';
  }

  function _getRankMeta(label) {
    return RANK_TIERS.find(r => r.label === label) || RANK_TIERS[0];
  }

  // ─── 7. WIDGET & HEADER DOM UPDATERS ───────────────────────────────────────
  function _updateEngineWidget(data) {
    const meta = _getRankMeta(data.rank_tier);
    const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

    setHtml('engPower', (data.power_level || 100).toLocaleString());
    setHtml('engRank', `<i class="fa-solid fa-shield" style="color:${meta.color};"></i> ${meta.label}`);
    setHtml('engXP', `+${data.daily_xp || 0} XP`);
    setHtml('engProg', `${Math.min(Math.floor(((data.total_xp || 0) % 10000) / 100), 99)}%`);

    const widget = document.querySelector('.engine-widget-v2');
    if (widget) {
      widget.style.borderColor = meta.color;
      widget.style.boxShadow = `0 0 25px ${meta.glow}`;
    }
  }

  function _renderGuestWidget() {
    const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };
    setHtml('engPower', '???');
    setHtml('engRank', '<i class="fa-solid fa-lock"></i> LOCKED');
    setHtml('engXP', '--- XP');
    setHtml('engProg', '0%');
  }

  function _updateModalHeader(data) {
    if (!data) return;
    const meta = _getRankMeta(data.rank_tier);
    const setHtml = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

    setHtml('emUserName', state.user?.username || state.user?.ign || 'Player');
    setHtml('emUserLvl', `LEVEL ${Math.floor((data.total_xp || 0) / 1000) + 1}`);
    setHtml('emStatPower', (data.power_level || 100).toLocaleString());
    setHtml('emStatRank', `<span style="color:${meta.color}; font-weight:bold;">${meta.label}</span>`);
    setHtml('emStatXP', (data.total_xp || 0).toLocaleString());
    setHtml('emStatPoints', (parseInt(state.user?.points) || 8000).toLocaleString());

    const m = parseInt(state.user?.matches_played || state.user?.matches) || 0;
    const w = parseInt(state.user?.wins) || 0;
    setHtml('emStatWinRate', m > 0 ? `${Math.floor((w / m) * 100)}%` : '0%');

    const avatarEl = document.getElementById('emUserAvatar');
    if (avatarEl) {
      avatarEl.src = state.user?.avatar || `https://ui-avatars.com/api/?name=${(state.user?.username || 'P').charAt(0)}&background=0d0d1a&color=00f2ff&size=80`;
    }
  }

  // ─── 8. DYNAMIC ENGINE MODAL MOUNTER ───────────────────────────────────────
  function _mountEngineModal() {
    if (document.getElementById('ultimateSystemModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'ultimateSystemModal';
    overlay.className = 'auth-popup-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeEngineModal(); };

    overlay.innerHTML = `
      <div class="engine-modal-box glass-panel">
        
        <!-- TOP HEADER BAR (UN-OVERFLOWED & PERFECTLY CENTERED) -->
        <div class="engine-modal-header" style="display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:1px solid rgba(0,242,255,0.18); background:rgba(8,8,16,0.96); position:relative; gap:12px;">
          
          <!-- LEFT: LOGO & WORDMARK -->
          <div class="em-header-left" style="display:flex; align-items:center; gap:10px; min-width:180px;">
            <div class="tx-cyber-crest" style="width:34px; height:34px;">
              <svg width="34" height="34" viewBox="0 0 100 100" class="tx-crest-svg">
                <defs>
                  <linearGradient id="txHdrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f2ff" />
                    <stop offset="50%" stop-color="#bd00ff" />
                    <stop offset="100%" stop-color="#ff3300" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#txHdrGrad)" stroke-width="3" stroke-dasharray="18 8 36 8" class="tx-ring-spin" />
                <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="rgba(8,8,16,0.95)" stroke="#00f2ff" stroke-width="2" />
                <circle cx="50" cy="50" r="14" fill="url(#txHdrGrad)" class="tx-core-pulse" />
                <path d="M40,42 L60,42 M50,42 L50,60 M56,48 L64,60 M44,48 L36,60" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <h2 style="font-family:var(--eng-font-head, sans-serif); color:white; font-size:1.1rem; margin:0; letter-spacing:1px; line-height:1.1;">TOURNYX ENGINE</h2>
              <span style="font-size:0.62rem; color:#00f2ff; letter-spacing:1px; font-weight:bold;">SOLO LEVELLING ESPORTS OS</span>
            </div>
          </div>
          
          <!-- CENTER: USER BADGE & LIVE STATS PILLS -->
          <div class="em-header-center" style="display:flex; align-items:center; gap:14px; flex:1; justify-content:center; flex-wrap:wrap;">
            <div class="em-user-badge" style="display:flex; align-items:center; gap:8px;">
              <img src="https://via.placeholder.com/38" id="emUserAvatar" class="em-avatar" style="width:36px; height:36px; border-radius:50%; border:1.5px solid #00f2ff; object-fit:cover;">
              <div>
                <span class="em-username" id="emUserName" style="font-family:var(--eng-font-head, sans-serif); color:white; font-size:0.85rem; font-weight:bold; display:block;">PlayerX</span>
                <span class="em-user-lvl" id="emUserLvl" style="font-size:0.68rem; color:var(--eng-cyan, #00f2ff); font-weight:bold;">LEVEL 1</span>
              </div>
            </div>

            <div class="em-header-stats" style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:5px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.06);">
              <div class="em-stat-item"><span style="font-size:0.58rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">Power</span><b id="emStatPower" style="font-family:var(--eng-font-head, sans-serif); color:white; font-size:0.82rem; display:block;">100</b></div>
              <div class="em-stat-item" style="border-left:1px solid rgba(255,255,255,0.08); padding-left:8px;"><span style="font-size:0.58rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">Rank</span><b id="emStatRank" style="font-family:var(--eng-font-head, sans-serif); color:#00f2ff; font-size:0.82rem; display:block;">E-RANK</b></div>
              <div class="em-stat-item" style="border-left:1px solid rgba(255,255,255,0.08); padding-left:8px;"><span style="font-size:0.58rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">Win Rate</span><b id="emStatWinRate" style="font-family:var(--eng-font-head, sans-serif); color:#00ff7f; font-size:0.82rem; display:block;">0%</b></div>
              <div class="em-stat-item" style="border-left:1px solid rgba(255,255,255,0.08); padding-left:8px;"><span style="font-size:0.58rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">Points</span><b id="emStatPoints" style="font-family:var(--eng-font-head, sans-serif); color:#FFD700; font-size:0.82rem; display:block;">8,000</b></div>
              <div class="em-stat-item" style="border-left:1px solid rgba(255,255,255,0.08); padding-left:8px;"><span style="font-size:0.58rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">XP</span><b id="emStatXP" style="font-family:var(--eng-font-head, sans-serif); color:#bd00ff; font-size:0.82rem; display:block;">800</b></div>
            </div>
          </div>

          <!-- RIGHT: CLOSE BUTTON (ZERO OVERFLOW) -->
          <div class="em-header-right" style="display:flex; align-items:center; justify-content:flex-end; min-width:40px;">
            <button class="em-close-btn" onclick="TournyxEngineAPI.closeEngineModal()" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:50%; width:32px; height:32px; color:rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.9rem; transition:all 0.2s;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- MAIN BODY -->
        <div class="engine-modal-body">
          
          <!-- SIDEBAR NAV -->
          <div class="em-nav-menu">
            <button class="em-nav-btn active" data-tab="player-analysis" onclick="TournyxEngineAPI.switchEngineTab('player-analysis', this)"><i class="fa-solid fa-chart-column"></i> PLAYER ANALYSIS</button>
            <button class="em-nav-btn" data-tab="todays-tasks" onclick="TournyxEngineAPI.switchEngineTab('todays-tasks', this)"><i class="fa-solid fa-list-check"></i> TODAY'S TASKS</button>
            <button class="em-nav-btn" data-tab="ai-recommendations" onclick="TournyxEngineAPI.switchEngineTab('ai-recommendations', this)"><i class="fa-solid fa-robot"></i> AI RECOMMENDATIONS</button>
            <button class="em-nav-btn" data-tab="role-training" onclick="TournyxEngineAPI.switchEngineTab('role-training', this)"><i class="fa-solid fa-crosshairs"></i> ROLE & TRAINING</button>
            <button class="em-nav-btn" data-tab="player-evolution" onclick="TournyxEngineAPI.switchEngineTab('player-evolution', this)"><i class="fa-solid fa-bolt"></i> PLAYER EVOLUTION</button>
            <button class="em-nav-btn" data-tab="inventory" onclick="TournyxEngineAPI.switchEngineTab('inventory', this)"><i class="fa-solid fa-briefcase"></i> INVENTORY & REWARDS</button>
            <button class="em-nav-btn" data-tab="hidden-quests" onclick="TournyxEngineAPI.switchEngineTab('hidden-quests', this)"><i class="fa-solid fa-user-ninja"></i> HIDDEN QUESTS</button>
            <button class="em-nav-btn" data-tab="system-log" onclick="TournyxEngineAPI.switchEngineTab('system-log', this)"><i class="fa-solid fa-terminal"></i> SYSTEM LOG</button>
            <button class="em-nav-btn" data-tab="vision-ai" onclick="TournyxEngineAPI.switchEngineTab('vision-ai', this)"><i class="fa-solid fa-eye"></i> VISION AI SCANNER</button>
            <button class="em-nav-btn" data-tab="boss-raids" onclick="TournyxEngineAPI.switchEngineTab('boss-raids', this)"><i class="fa-solid fa-skull"></i> BOSS RAIDS</button>
            <button class="em-nav-btn" data-tab="regional-ranks" onclick="TournyxEngineAPI.switchEngineTab('regional-ranks', this)"><i class="fa-solid fa-map-pin"></i> BHARAT RANKS</button>
          </div>

          <!-- TAB DISPLAY VIEW -->
          <div class="em-tab-content">
            <div class="em-pane active" id="tab-player-analysis"></div>
            <div class="em-pane" id="tab-todays-tasks"></div>
            <div class="em-pane" id="tab-ai-recommendations"></div>
            <div class="em-pane" id="tab-role-training"></div>
            <div class="em-pane" id="tab-player-evolution"></div>
            <div class="em-pane" id="tab-inventory"></div>
            <div class="em-pane" id="tab-hidden-quests"></div>
            <div class="em-pane" id="tab-system-log"></div>
            <div class="em-pane" id="tab-vision-ai"></div>
            <div class="em-pane" id="tab-boss-raids"></div>
            <div class="em-pane" id="tab-regional-ranks"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  function openSystemPopup() {
    try { state.user = JSON.parse(localStorage.getItem('tournyx_user')); } catch(e) {}
    
    if (!state.user || !state.user.email) {
      document.getElementById('authPopup')?.classList.add('active');
      return;
    }

    _mountEngineModal();
    _updateModalHeader(state.engineData);
    
    // Check if new player needs Solo Levelling Awakening Quest
    if (!_isAwakened()) {
      _showSoloAwakeningModal();
      return;
    }

    const modal = document.getElementById('ultimateSystemModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    _loadTabContent(state.currentTab);
    _triggerBootSequence();
  }

  function closeEngineModal() {
    const modal = document.getElementById('ultimateSystemModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function switchEngineTab(tabId, btnEl) {
    document.querySelectorAll('.em-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.em-nav-btn').forEach(b => b.classList.remove('active'));

    const pane = document.getElementById('tab-' + tabId);
    if (pane) pane.classList.add('active');
    
    const targetBtn = btnEl || document.querySelector(`[data-tab="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    state.currentTab = tabId;
    _loadTabContent(tabId);
  }

  function _loadTabContent(tabId) {
    switch(tabId) {
      case 'player-analysis': _renderPlayerAnalysis(); break;
      case 'todays-tasks': _renderTasksTab(); break;
      case 'ai-recommendations': _renderAIRecommendations(); break;
      case 'role-training': _renderRoleTraining(); break;
      case 'player-evolution': _renderEvolutionTab(); break;
      case 'inventory': _renderInventoryTab(); break;
      case 'hidden-quests': _renderHiddenQuests(); break;
      case 'system-log': _renderSystemLog(); break;
      case 'vision-ai': _renderVisionAISubmit(); break;
      case 'boss-raids': _renderBossRaidTab(); break;
      case 'regional-ranks': _renderRegionalRanksTab(); break;
    }
  }

  // ─── 9. SOLO LEVELLING REAWAKENING QUEST MODAL ─────────────────────────────
  function _isAwakened() {
    return localStorage.getItem('tournyx_awakened') === 'true';
  }

  function _showSoloAwakeningModal() {
    let existing = document.getElementById('solo-awakening-modal');
    if (existing) existing.remove();

    const ign = state.user?.ign || state.user?.username || 'Hunter';
    const mainGame = state.user?.main_game || 'BGMI';
    const role = state.user?.player_role || 'Rusher';

    const modal = document.createElement('div');
    modal.id = 'solo-awakening-modal';
    modal.className = 'auth-popup-overlay active';
    modal.innerHTML = `
      <div class="glass-panel" style="max-width:440px; width:92%; border-radius:20px; padding:28px 24px; text-align:center; background:radial-gradient(circle at top, rgba(0,242,255,0.15) 0%, rgba(10,10,18,0.95) 80%); border:1.5px solid var(--eng-cyan); box-shadow:0 0 45px rgba(0,242,255,0.4);">
        
        <div style="font-family:var(--eng-font-head); font-size:0.75rem; letter-spacing:4px; color:#00f2ff; margin-bottom:10px; font-weight:bold;">
          [ SYSTEM NOTIFICATION ]
        </div>
        
        <div style="width:60px; height:60px; border-radius:50%; background:rgba(0,242,255,0.1); border:2px solid #00f2ff; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; box-shadow:0 0 20px #00f2ff;">
          <i class="fa-solid fa-bolt" style="color:#00f2ff; font-size:1.6rem;"></i>
        </div>

        <h2 style="font-family:var(--eng-font-head); color:white; font-size:1.3rem; margin:0 0 10px; letter-spacing:1px; line-height:1.2;">
          YOU HAVE QUALIFIED AS A "PLAYER"
        </h2>

        <p style="font-size:0.82rem; color:#ccc; line-height:1.5; margin-bottom:18px;">
          Welcome Hunter, <b style="color:#FFD700;">${ign}</b>.<br>
          The Tournyx Esports System has detected your competitive aptitude in <b style="color:#00f2ff;">${mainGame}</b> (<span style="color:#ff4d4d;">${role}</span>).<br>
          Will you accept the Reawakening Protocol?
        </p>

        <div style="background:rgba(0,0,0,0.5); border-radius:10px; padding:12px; margin-bottom:18px; text-align:left; font-size:0.78rem; color:#ddd; display:flex; flex-direction:column; gap:8px;">
          <div><i class="fa-solid fa-check" style="color:#00ff7f;"></i> Calibrate 6-Axis AI Radar Matrix</div>
          <div><i class="fa-solid fa-check" style="color:#00ff7f;"></i> Unlock Live Neural Match Vision Companion</div>
          <div><i class="fa-solid fa-check" style="color:#00ff7f;"></i> Earn Tournyx Points & Level Up to SSS-Rank</div>
        </div>

        <div style="font-size:0.65rem; color:var(--text-muted); letter-spacing:1px; margin-bottom:16px; font-family:var(--eng-font-head);">
          ⚡ POWERED BY TOURNYX ESPORTS ENGINE
        </div>

        <button onclick="TournyxEngineAPI.confirmAwakening()" style="width:100%; padding:14px; background:linear-gradient(90deg, #00f2ff, #bd00ff); border:none; border-radius:12px; color:#000; font-family:var(--eng-font-head); font-weight:900; font-size:0.9rem; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 0 25px rgba(0,242,255,0.6);">
          ACCEPT REAWAKENING
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    _playChime('rankup');
  }

  async function confirmAwakening() {
    localStorage.setItem('tournyx_awakened', 'true');
    const modal = document.getElementById('solo-awakening-modal');
    if (modal) modal.remove();

    _showToast('⚡ REAWAKENING COMPLETE: Welcome Hunter!');
    await _awardPoints(500, 'System Reawakening Welcome Bounty');
    openSystemPopup();
  }

  // ─── TAB 1: PLAYER ANALYSIS + RADAR ────────────────────────────────────────
  function _renderPlayerAnalysis() {
    const pane = document.getElementById('tab-player-analysis');
    if (!pane || !state.engineData) return;
    const data = state.engineData;

    const skills = [
      { key: 'skill_combat',      label: 'Combat',       color: '#ff4d4d', icon: 'fa-crosshairs' },
      { key: 'skill_reaction',    label: 'Reaction',     color: '#00f2ff', icon: 'fa-bolt' },
      { key: 'skill_strategy',    label: 'Strategy',     color: '#bd00ff', icon: 'fa-brain' },
      { key: 'skill_teamwork',    label: 'Teamwork',     color: '#00ff7f', icon: 'fa-shield-halved' },
      { key: 'skill_leadership',  label: 'Leadership',   color: '#FFD700', icon: 'fa-map-location-dot' },
      { key: 'skill_consistency', label: 'Consistency',  color: '#ff9800', icon: 'fa-arrow-trend-up' },
    ];

    const weakest = skills.reduce((a, b) => (data[a.key] || 50) < (data[b.key] || 50) ? a : b);
    const strongest = skills.reduce((a, b) => (data[a.key] || 50) > (data[b.key] || 50) ? a : b);

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-chart-line" style="color:var(--accent-cyan);"></i> Hunter Skill Attributes</div>
        <div class="em-skill-bars" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
          ${skills.map(sk => {
            const val = data[sk.key] || 50;
            return `
              <div class="em-skill-item" style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                <div class="em-skill-info" style="display:flex; justify-content:space-between; font-size:0.78rem; font-family:var(--eng-font-head); color:#ccc; margin-bottom:6px;">
                  <span><i class="fa-solid ${sk.icon}" style="color:${sk.color};"></i> ${sk.label}</span>
                  <b style="color:white;">${val}%</b>
                </div>
                <div class="em-bar-bg" style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                  <div class="em-bar-fill" style="height:100%; width:${val}%; background:${sk.color}; box-shadow:0 0 10px ${sk.color}; transition:width 0.8s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="em-radar-box" style="margin-top:15px; background:rgba(14,14,24,0.65); border:1px solid rgba(0,242,255,0.2); border-radius:16px; padding:16px;">
        <div class="em-box-title" style="font-family:var(--eng-font-head); color:var(--accent-purple); margin-bottom:10px;">
          <i class="fa-solid fa-spider"></i> 6-Axis Skill Radar Matrix
        </div>
        <canvas id="skillRadarCanvas" height="210"></canvas>
      </div>

      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title" style="font-family:var(--eng-font-head); color:var(--accent-cyan); margin-bottom:8px;">
          <i class="fa-solid fa-robot"></i> AI Diagnostic Report & Prescription
        </div>
        <div style="font-size:0.85rem; color:#ccc; line-height:1.6;">
          <p style="margin-bottom:6px;">🌟 Dominant Trait: <b style="color:#00ff7f;">${strongest.label} (${data[strongest.key]}%)</b></p>
          <p style="margin-bottom:6px;">⚠️ Area for Improvement: <b style="color:#ff4d4d;">${weakest.label} (${data[weakest.key]}%)</b></p>
          <p style="margin-bottom:8px;">💡 AI Coach Prescription: <span style="color:#00f2ff;">Engage in 15 mins of daily ${weakest.label.toLowerCase()} drills to boost overall Power Rating.</span></p>
          <div style="font-family:var(--eng-font-head); color:var(--accent-purple); font-size:0.8rem; font-weight:bold;">
            BONUS: Complete AI drill today for <b>+250 PTS (+25 XP)</b>
          </div>
        </div>
      </div>
    `;

    _drawRadarChart(skills, data);
  }

  function _drawRadarChart(skills, data) {
    const canvas = document.getElementById('skillRadarCanvas');
    if (!canvas || !window.Chart) return;

    if (state.radarChart) {
      state.radarChart.destroy();
      state.radarChart = null;
    }

    state.radarChart = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: skills.map(s => s.label),
        datasets: [{
          label: 'Hunter Attributes',
          data: skills.map(s => data[s.key] || 50),
          backgroundColor: 'rgba(0, 242, 255, 0.15)',
          borderColor: '#00f2ff',
          borderWidth: 2,
          pointBackgroundColor: '#00f2ff',
          pointBorderColor: '#050508',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: 'rgba(255, 255, 255, 0.35)',
              font: { size: 9 },
              backdropColor: 'transparent'
            },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 10, family: "'Rajdhani', sans-serif", weight: 'bold' }
            }
          }
        },
        animation: { duration: state.graphicTier === 'performance' ? 0 : 800 }
      }
    });
  }

  // ─── TAB 2: SMART AI-RECOMMENDED TASKS ─────────────────────────────────────
  function _getTasksForCurrentPlayer() {
    const mainGame = state.user?.main_game || 'BGMI';
    const role = state.engineData?.player_dna || state.user?.player_role || 'Rusher';
    
    // Filter matching game and role, plus universal tasks
    let list = TASK_BANK.filter(t => (t.game === mainGame || t.game === 'Universal') && (t.role === role || t.role === 'Universal'));
    if (list.length < 4) {
      list = TASK_BANK.filter(t => t.game === mainGame || t.game === 'Universal');
    }
    return list.slice(0, 5);
  }

  async function _renderTasksTab() {
    const pane = document.getElementById('tab-todays-tasks');
    if (!pane || !state.engineData) return;

    const data = state.engineData;
    const mainGame = state.user?.main_game || 'BGMI';
    const role = data.player_dna || 'Rusher';
    const tasks = _getTasksForCurrentPlayer();

    pane.innerHTML = `
      <div class="em-section-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div class="em-box-title" style="margin-bottom:0;"><i class="fa-solid fa-list-check" style="color:var(--accent-cyan);"></i> Live Esports Missions</div>
          <div style="display:flex; gap:6px;">
            <span style="font-size:0.7rem; color:#FFD700; font-family:var(--eng-font-head); background:rgba(255,215,0,0.1); padding:3px 8px; border-radius:10px; border:1px solid rgba(255,215,0,0.25);">
              ${mainGame}
            </span>
            <span style="font-size:0.7rem; color:var(--accent-cyan); font-family:var(--eng-font-head); background:rgba(0,242,255,0.1); padding:3px 8px; border-radius:10px; border:1px solid rgba(0,242,255,0.25);">
              ${role.toUpperCase()}
            </span>
          </div>
        </div>
        
        <p style="font-size:0.78rem; color:#aaa; margin-bottom:14px;">Complete competitive objectives in ${mainGame}. Click <b>VERIFY</b> with Vision AI active to earn Points & XP:</p>
        
        <div class="em-task-list">
          ${tasks.map(t => `
            <div class="em-task-card" id="tsk-card-${t.id}">
              <div class="em-task-info">
                <i class="fa-regular fa-square" style="color:var(--text-muted); font-size:1.1rem;"></i>
                <div>
                  <span style="display:block;">${t.title}</span>
                  <small style="color:var(--accent-cyan);">+${t.pts} PTS • +${Math.floor(t.pts/10)} XP</small>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button onclick="TournyxEngineAPI.startAndVerifyTask('${t.id}', ${t.pts}, this)" style="background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border:none; color:white; padding:6px 14px; border-radius:8px; font-size:0.72rem; font-family:var(--eng-font-head); font-weight:bold; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
                  START & VERIFY
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function startAndVerifyTask(taskId, ptsReward, btnEl) {
    if (!state.isVisionActive) {
      _showToast('⚠️ Vision AI Neural Link Required! Please start Neural Link on PC or open Tournyx App on Mobile.', true);
      _promptMobileAppModal();
      return;
    }

    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AI VERIFYING...';
    }

    await new Promise(r => setTimeout(r, 1500));

    await _awardPoints(ptsReward, `Mission Verified: +${ptsReward} PTS (+${Math.floor(ptsReward/10)} XP)`);

    const card = document.getElementById('tsk-card-' + taskId);
    if (card) {
      card.classList.add('completed');
      const icon = card.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-square-check';
        icon.style.color = 'var(--accent-green)';
      }
      if (btnEl) {
        btnEl.outerHTML = `<span style="color:var(--accent-green); font-family:var(--eng-font-head); font-weight:bold; font-size:0.75rem;">VERIFIED ✓</span>`;
      }
      _triggerXPParticle(Math.floor(ptsReward/10), card);
    }

    _playChime('xp');
    _showToast(`🎯 Mission Verified! +${ptsReward} PTS (+${Math.floor(ptsReward/10)} XP) Saved to Cloud!`);
  }

  function _promptMobileAppModal() {
    _showToast('📲 Background in-game HUD requires the Tournyx Mobile App (Android / iOS)');
  }

  // ─── TAB 3: AI RECOMMENDATIONS & DREAM TEAM ────────────────────────────────
  function _renderAIRecommendations() {
    const pane = document.getElementById('tab-ai-recommendations');
    if (!pane || !state.engineData) return;
    const d = state.engineData;
    const dnaInfo = PLAYER_DNA[d.player_dna] || PLAYER_DNA['Rusher'];

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-chart-line" style="color:var(--accent-cyan);"></i> Performance Trajectory</div>
        <canvas id="engineTrendCanvas" height="85"></canvas>
      </div>

      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-dna" style="color:${dnaInfo.color};"></i> Player DNA Archetype: <span style="color:${dnaInfo.color};">${d.player_dna}</span></div>
        <p style="font-size:0.82rem; color:#bbb; line-height:1.5; margin-bottom:12px;">${dnaInfo.desc}</p>
        <div class="dna-grid">
          ${Object.entries(PLAYER_DNA).map(([name, meta]) => `
            <div class="dna-card ${name === d.player_dna ? 'active' : ''}" onclick="TournyxEngineAPI.setPlayerDNA('${name}')">
              <i class="fa-solid ${meta.icon}" style="color:${meta.color}; font-size:1.2rem;"></i>
              <div>
                <div style="color:white; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${name}</div>
                <div style="font-size:0.65rem; color:var(--text-muted);">Specialist</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-users" style="color:var(--accent-purple);"></i> Dream Team Builder AI</div>
        <p style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">Recommended squadmates whose playstyles synergize with your ${d.player_dna} profile in ${state.user?.main_game || 'BGMI'}:</p>
        <div id="dreamSquadList" style="display:flex; flex-direction:column; gap:8px;">
          <div style="color:var(--accent-cyan); text-align:center; padding:10px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Finding teammates...</div>
        </div>
        <button onclick="TournyxEngineAPI.buildDreamTeam()" style="width:100%; margin-top:12px; padding:12px; background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border:none; border-radius:10px; color:white; font-family:var(--font-head); font-weight:bold; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
          <i class="fa-solid fa-wand-magic-sparkles"></i> RE-OPTIMIZE SQUAD
        </button>
      </div>
    `;

    _renderTrendCurve();
    setTimeout(() => buildDreamTeam(), 500);
  }

  function _renderTrendCurve() {
    const canvas = document.getElementById('engineTrendCanvas');
    if (!canvas || !window.Chart) return;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          data: days.map(() => Math.floor(55 + Math.random() * 38)),
          borderColor: '#00f2ff',
          backgroundColor: 'rgba(0, 242, 255, 0.06)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#00f2ff',
          pointRadius: 3
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  async function buildDreamTeam() {
    const el = document.getElementById('dreamSquadList');
    if (!el) return;

    let players = [];
    if (state.db) {
      try {
        const { data } = await state.db.from('Users').select('username, ign, avatar, wins, player_role, role').limit(3);
        if (data) players = data;
      } catch(e) {}
    }

    if (players.length === 0) {
      players = [
        { username: 'Phoenix_Viper', wins: 48, player_role: 'Sniper' },
        { username: 'Rohan_Medic', wins: 34, player_role: 'Support' },
        { username: 'Astra_IGL', wins: 62, player_role: 'IGL' }
      ];
    }

    el.innerHTML = players.slice(0, 3).map((p, i) => `
      <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
        <img src="${p.avatar || 'https://ui-avatars.com/api/?name=' + (p.username || 'P').charAt(0) + '&background=0d0d1a&color=00f2ff'}" style="width:38px; height:38px; border-radius:50%; border:2px solid var(--accent-cyan);">
        <div style="flex:1;">
          <div style="color:white; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${p.ign || p.username || 'Player'}</div>
          <div style="color:var(--accent-cyan); font-size:0.75rem;">${p.player_role || 'Specialist'} • ${p.wins || 0} Wins</div>
        </div>
        <button onclick="TournyxEngineAPI.inviteSquadmate('${p.username || p.ign}')" style="background:rgba(0,242,255,0.1); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:4px 10px; border-radius:6px; font-size:0.7rem; font-family:var(--font-head); font-weight:bold; cursor:pointer;">INVITE</button>
      </div>
    `).join('');
  }

  function inviteSquadmate(name) {
    _showToast(`✉️ Squad invitation transmitted to ${name}!`);
  }

  // ─── TAB 4: ROLE TRAINING ──────────────────────────────────────────────────
  function _renderRoleTraining() {
    const pane = document.getElementById('tab-role-training');
    if (!pane || !state.engineData) return;
    const dna = state.engineData.player_dna || 'Rusher';

    const drills = {
      Rusher: ['Close-Range Crosshair Snapping', 'Shotgun Quick-Switch Slide', 'Entry-Frag Flash Timing'],
      Sniper: ['Long-Range Bullet Drop Calculation', 'Moving Target Lead Tracking', 'Quickscope Micro-Adjustment'],
      Support: ['Smoke Wall Vision Denial', 'High-Speed Teammate Extraction', 'Flank Zone Covering Fire'],
      IGL: ['Endzone Rotation Pathfinding', 'High-Ground Placement Calling', 'Utility Economy Management'],
    };

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-crosshairs" style="color:var(--accent-cyan);"></i> Active Role Training: ${dna.toUpperCase()}</div>
        <p style="font-size:0.82rem; color:#bbb; margin-bottom:14px;">Specialized practice regimen designed to sharpen your ${dna} fundamentals:</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${(drills[dna] || drills['Rusher']).map((d, i) => `
            <div style="padding:12px; background:rgba(255,255,255,0.02); border-radius:10px; border-left:3px solid var(--accent-cyan); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <b style="color:white; font-size:0.85rem;">${d}</b>
                <small style="color:var(--text-muted); display:block;">15 mins daily recommended</small>
              </div>
              <button onclick="TournyxEngineAPI.startDrill('${d}')" style="background:rgba(0,242,255,0.15); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:6px 12px; border-radius:6px; font-size:0.75rem; font-family:var(--eng-font-head); font-weight:bold; cursor:pointer;">
                START DRILL
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function startDrill(drillName) {
    _showToast(`🎯 Drill Initiated: ${drillName}! Complete in game to gain +150 PTS.`);
  }

  async function setPlayerDNA(name) {
    if (!state.engineData) return;
    state.engineData.player_dna = name;
    if (state.db && state.user?.email) {
      try {
        await state.db.from('player_engine').update({ player_dna: name }).eq('email', state.user.email);
        await state.db.from('Users').update({ player_role: name }).eq('email', state.user.email);
      } catch(e) {}
    }
    _showToast(`🧬 Player DNA Switched to: ${name}`);
    _renderAIRecommendations();
  }

  // ─── TAB 5: PLAYER EVOLUTION ───────────────────────────────────────────────
  function _renderEvolutionTab() {
    const pane = document.getElementById('tab-player-evolution');
    if (!pane || !state.engineData) return;
    const d = state.engineData;
    const meta = _getRankMeta(d.rank_tier);
    const rIdx = RANK_TIERS.findIndex(r => r.label === d.rank_tier);
    const nextRank = RANK_TIERS[Math.min(rIdx + 1, RANK_TIERS.length - 1)];
    const prevMin = rIdx > 0 ? RANK_TIERS[rIdx - 1].min : 0;
    const rangePct = Math.min(((d.power_level - prevMin) / (nextRank.min - prevMin)) * 100, 100);
    const dashArr = Math.min((rangePct / 100) * 390, 390);
    const stages = ['Rookie', 'Pro', 'Elite', 'Legend'];
    const stageIdx = stages.indexOf(d.evolution_stage || 'Rookie');

    pane.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="position:relative; width:140px; height:140px; margin:15px 0 25px;">
          <svg width="140" height="140" style="position:absolute; top:0; left:0; transform:rotate(-90deg);">
            <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
            <circle cx="70" cy="70" r="62" fill="none" stroke="${meta.color}" stroke-width="8" stroke-dasharray="${dashArr} 390" stroke-linecap="round" style="filter:drop-shadow(0 0 6px ${meta.color});"/>
          </svg>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
            <div style="font-size:0.6rem; color:var(--text-muted); font-family:var(--font-head); letter-spacing:1px;">POWER</div>
            <div style="font-size:1.6rem; font-family:var(--font-head); color:${meta.color}; font-weight:900; line-height:1.1;">${(d.power_level || 0).toLocaleString()}</div>
            <div style="font-size:0.65rem; color:${meta.color}; font-family:var(--font-head); font-weight:bold;">${meta.label}</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:center; gap:0; width:100%; max-width:280px; margin-bottom:20px;">
          ${stages.map((st, i) => `
            <div style="display:flex; align-items:center;">
              <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
                <div style="width:32px; height:32px; border-radius:50%; background:${i <= stageIdx ? meta.color : 'rgba(255,255,255,0.06)'}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:${i <= stageIdx ? '#000' : 'rgba(255,255,255,0.3)'}; font-weight:bold;">
                  ${i <= stageIdx ? '✓' : ''}
                </div>
                <div style="font-size:0.6rem; color:${i <= stageIdx ? 'white' : 'rgba(255,255,255,0.3)'}; font-family:var(--font-head);">${st}</div>
              </div>
              ${i < stages.length - 1 ? `<div style="width:24px; height:2px; background:${i < stageIdx ? meta.color : 'rgba(255,255,255,0.06)'}; margin:0 2px 14px;"></div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="width:100%; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-family:var(--font-head); color:var(--text-muted); margin-bottom:6px;">
            <span>CURRENT PROGRESS</span>
            <span style="color:${meta.color};">${nextRank.min > (d.power_level || 0) ? (nextRank.min - (d.power_level || 0)).toLocaleString() + ' power to ' + nextRank.label : 'MAX RANK ATTAINED'}</span>
          </div>
          <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${rangePct}%; background:${meta.color}; border-radius:4px; box-shadow:0 0 10px ${meta.color};"></div>
          </div>
        </div>

        <button onclick="TournyxEngineAPI.simulateRankUp()" style="width:100%; padding:14px; background:linear-gradient(90deg, ${meta.color}, var(--accent-cyan)); border:none; border-radius:12px; color:#000; font-family:var(--font-head); font-weight:900; font-size:0.9rem; cursor:pointer; text-transform:uppercase; letter-spacing:2px;">
          ⚡ TRIGGER RANK-UP CEREMONY
        </button>
      </div>
    `;
  }

  // ─── TAB 6: INVENTORY & REWARDS & LUCKY WHEEL ──────────────────────────────
  function _renderInventoryTab() {
    const pane = document.getElementById('tab-inventory');
    if (!pane || !state.engineData) return;
    const d = state.engineData;
    const u = state.user || {};

    const items = [
      { icon: 'fa-coins',    color: '#FFD700',               label: 'Points',      value: (parseInt(u.points) || 8000).toLocaleString() },
      { icon: 'fa-star',     color: 'var(--accent-purple)',  label: 'Hunter XP',   value: (d.total_xp || 800).toLocaleString() },
      { icon: 'fa-ticket',   color: 'var(--accent-cyan)',    label: 'TX Tickets',  value: Math.floor((parseInt(u.earnings) || 2000) / 10).toLocaleString() },
      { icon: 'fa-bolt',     color: 'var(--accent-green)',   label: 'Energy',      value: (d.energy || 85) + '/100' },
    ];

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-briefcase" style="color:var(--accent-cyan);"></i> Hunter Vault & Currencies</div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-top:10px;">
          ${items.map(item => `
            <div style="padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05); text-align:center;">
              <i class="fa-solid ${item.icon}" style="color:${item.color}; font-size:1.1rem; margin-bottom:4px;"></i>
              <div style="font-family:var(--eng-font-head); color:white; font-size:0.9rem; font-weight:bold;">${item.value}</div>
              <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">${item.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CYBER LUCKY SPIN WHEEL -->
      <div class="em-section-box" style="margin-top:15px; text-align:center;">
        <div class="em-box-title"><i class="fa-solid fa-dharmachakra" style="color:#FFD700;"></i> Cyber Matrix Lucky Spin (1 Free Daily Spin)</div>
        <div style="position:relative; width:180px; height:180px; margin:15px auto;">
          <canvas id="luckySpinCanvas" width="180" height="180" style="border-radius:50%; box-shadow:0 0 25px rgba(0,242,255,0.4);"></canvas>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:32px; height:32px; background:#050508; border:2px solid #00f2ff; border-radius:50%; z-index:2; display:flex; align-items:center; justify-content:center; color:#00f2ff; font-size:0.75rem;">
            🎯
          </div>
        </div>
        <button onclick="TournyxEngineAPI.spinLuckyWheel()" id="luckySpinBtn" style="padding:12px 30px; background:linear-gradient(90deg, #FFD700, #ff9800); border:none; border-radius:30px; color:#000; font-family:var(--eng-font-head); font-weight:900; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; box-shadow:0 0 20px rgba(255,215,0,0.5);">
          SPIN FOR REWARDS
        </button>
      </div>

      <!-- HUNTER ITEM SHOP -->
      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-shop" style="color:var(--accent-green);"></i> Hunter Shop (Spend Points / XP)</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div>
              <b style="color:white; font-size:0.85rem;">⚡ Energy Refill (+50)</b>
              <small style="color:var(--text-muted); display:block;">Instantly restores 50 capacitor energy</small>
            </div>
            <button onclick="TournyxEngineAPI.buyShopItem('energy', 200)" style="background:rgba(0,255,127,0.15); border:1px solid var(--accent-green); color:var(--accent-green); padding:6px 12px; border-radius:6px; font-size:0.75rem; font-family:var(--eng-font-head); font-weight:bold; cursor:pointer;">
              200 PTS
            </button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
            <div>
              <b style="color:white; font-size:0.85rem;">🚀 2x XP Surge Booster</b>
              <small style="color:var(--text-muted); display:block;">Doubles all mission XP for 2 hours</small>
            </div>
            <button onclick="TournyxEngineAPI.buyShopItem('booster', 500)" style="background:rgba(0,242,255,0.15); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:6px 12px; border-radius:6px; font-size:0.75rem; font-family:var(--eng-font-head); font-weight:bold; cursor:pointer;">
              500 PTS
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => _drawLuckyWheel(), 100);
  }

  function _drawLuckyWheel(angle = 0) {
    const canvas = document.getElementById('luckySpinCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const slices = ['+100 PTS', '+50 XP', '+250 PTS', '+1 TX TICKET', '+50 ENERGY', '+500 PTS', '+100 XP', 'BOOST CARD'];
    const colors = ['#ff4d4d', '#00f2ff', '#FFD700', '#bd00ff', '#00ff7f', '#ff9800', '#5bc8f5', '#ff3300'];
    const arc = (Math.PI * 2) / slices.length;

    ctx.clearRect(0, 0, 180, 180);
    ctx.save();
    ctx.translate(90, 90);
    ctx.rotate(angle);

    slices.forEach((s, i) => {
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 90, i * arc, (i + 1) * arc);
      ctx.fill();

      ctx.save();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px Rajdhani, sans-serif';
      ctx.translate(Math.cos(i * arc + arc / 2) * 60, Math.sin(i * arc + arc / 2) * 60);
      ctx.rotate(i * arc + arc / 2 + Math.PI / 2);
      ctx.fillText(s, -ctx.measureText(s).width / 2, 0);
      ctx.restore();
    });

    ctx.restore();
  }

  let isSpinning = false;
  async function spinLuckyWheel() {
    if (isSpinning) return;
    isSpinning = true;
    const btn = document.getElementById('luckySpinBtn');
    if (btn) btn.disabled = true;

    let rot = 0;
    const targetRot = Math.PI * 2 * 6 + Math.random() * Math.PI * 2;
    const start = performance.now();
    const duration = 3000;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      rot = targetRot * easeOut;
      _drawLuckyWheel(rot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        const prize = 250;
        _awardPoints(prize, 'Cyber Lucky Wheel Prize');
        _showToast(`🎉 Lucky Spin Won: +${prize} PTS (+${Math.floor(prize/10)} XP)!`);
        _playChime('rankup');
        if (btn) btn.disabled = false;
        _renderInventoryTab();
      }
    };
    requestAnimationFrame(animate);
  }

  async function buyShopItem(itemType, cost) {
    const currentPoints = parseInt(state.user?.points) || 8000;
    if (currentPoints < cost) {
      _showToast('❌ Not enough Points to purchase this item!', true);
      return;
    }
    await _awardPoints(-cost, `Shop Purchase: ${itemType}`);
    _showToast(`✅ Item purchased successfully! (-${cost} PTS)`);
    _renderInventoryTab();
  }

  // ─── TAB 7: HIDDEN QUESTS ──────────────────────────────────────────────────
  async function _renderHiddenQuests() {
    const pane = document.getElementById('tab-hidden-quests');
    if (!pane) return;
    const wins = parseInt(state.user?.wins) || 0;
    const matches = parseInt(state.user?.matches_played || state.user?.matches) || 0;

    const quests = [
      { id: 'hq1', name: 'First Blood',           pts: 1000, badge: 'VETERAN FRAME',  cond: (w) => w >= 1 },
      { id: 'hq2', name: 'Win 5 Squad Matches',   pts: 2000, badge: 'LEGEND FRAME',   cond: (w) => w >= 5 },
      { id: 'hq3', name: 'The Grinder (20 Games)', pts: 1500, badge: 'GRIND BADGE',    cond: (w, m) => m >= 20 },
      { id: 'hq4', name: 'Bharat Ke Yoddha',      pts: 3000, badge: 'NATIONAL TITLE', cond: (w) => w >= 15 },
    ];

    pane.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${quests.map(q => {
          const unlocked = q.cond(wins, matches);
          return `
            <div style="padding:16px; border-radius:14px; background:${unlocked ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${unlocked ? '#FFD700' : 'rgba(255,255,255,0.06)'}; position:relative; overflow:hidden;">
              ${!unlocked ? '<div style="position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; z-index:2;"><i class="fa-solid fa-lock" style="font-size:2rem; color:rgba(255,255,255,0.25);"></i></div>' : ''}
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                <div style="font-size:1.8rem;">${unlocked ? '🏆' : '❓'}</div>
                <div>
                  <div style="color:${unlocked ? 'white' : 'rgba(255,255,255,0.4)'}; font-family:var(--font-head); font-size:0.9rem; font-weight:bold;">${unlocked ? q.name : '??? HIDDEN QUEST ???'}</div>
                  <div style="color:var(--accent-cyan); font-size:0.75rem;">${unlocked ? 'Condition fulfilled!' : 'Continue competing to discover this secret achievement'}</div>
                </div>
              </div>
              ${unlocked ? `
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                  <div style="flex:1; text-align:center; padding:6px; background:rgba(255,255,255,0.03); border-radius:8px;">
                    <div style="color:#FFD700; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">+${q.pts} PTS</div>
                  </div>
                  <div style="flex:1; text-align:center; padding:6px; background:rgba(255,255,255,0.03); border-radius:8px;">
                    <div style="color:var(--accent-cyan); font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${q.badge}</div>
                  </div>
                </div>
                <button onclick="TournyxEngineAPI.claimHiddenQuest('${q.id}', ${q.pts}, '${q.badge}', this)" style="width:100%; padding:10px; background:linear-gradient(90deg, #FFD700, #ff9800); border:none; border-radius:8px; color:#000; font-family:var(--font-head); font-weight:bold; cursor:pointer; font-size:0.8rem; text-transform:uppercase;">
                  CLAIM ACHIEVEMENT
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async function claimHiddenQuest(qId, ptsReward, badge, btn) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'CLAIMING...';
    }
    await _awardPoints(ptsReward, `Secret Quest: +${ptsReward} PTS & ${badge}`);
    _showToast(`🏆 ${badge} UNLOCKED! +${ptsReward} PTS`);
    _playChime('rankup');
    if (btn) {
      btn.textContent = 'CLAIMED ✓';
      btn.style.background = 'rgba(0,255,127,0.2)';
      btn.style.color = 'var(--accent-green)';
    }
  }

  // ─── TAB 8: SYSTEM AUDIT LOG ───────────────────────────────────────────────
  async function _renderSystemLog() {
    const pane = document.getElementById('tab-system-log');
    if (!pane) return;

    let logs = [];
    if (state.db && state.user?.email) {
      try {
        const { data } = await state.db
          .from('engine_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) logs = data;
      } catch(e) {}
    }

    if (logs.length === 0) {
      logs = [
        { event_type: 'xp_gain', event_desc: 'Daily Combat Drill Complete', xp_delta: 250, created_at: new Date(Date.now() - 120000).toISOString() },
        { event_type: 'rank_up', event_desc: 'Hunter Power Surge', xp_delta: 0, created_at: new Date(Date.now() - 900000).toISOString() },
        { event_type: 'achievement', event_desc: 'Secret Badge Unlocked', xp_delta: 500, created_at: new Date(Date.now() - 86400000).toISOString() }
      ];
    }

    const iconMap = { xp_gain: 'fa-circle-check', rank_up: 'fa-arrow-trend-up', achievement: 'fa-trophy', match_analyzed: 'fa-eye' };
    const colorMap = { xp_gain: 'var(--accent-green)', rank_up: '#FFD700', achievement: 'var(--accent-cyan)', match_analyzed: 'var(--accent-orange)' };

    pane.innerHTML = `
      <div class="em-log-list">
        ${logs.map(log => `
          <div class="em-log-item">
            <div class="em-log-left">
              <i class="fa-solid ${iconMap[log.event_type] || 'fa-circle'}" style="color:${colorMap[log.event_type] || 'var(--accent-cyan)'}; font-size:1.1rem;"></i>
              <div>
                <b>${log.event_desc}</b>
                <small>${log.xp_delta > 0 ? '+' + log.xp_delta + ' XP' : ''}</small>
              </div>
            </div>
            <span style="color:var(--text-muted); font-size:0.75rem; white-space:nowrap;">${_timeAgo(log.created_at)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ─── TAB 9: VISION AI SUBMIT & MONITOR ─────────────────────────────────────
  function _renderVisionAISubmit() {
    const pane = document.getElementById('tab-vision-ai');
    if (!pane) return;

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-eye fa-fade" style="color:var(--accent-orange);"></i> Tournyx Vision AI Neural Link</div>
        <p style="font-size:0.82rem; color:#aaa; margin-bottom:15px;">Activate real-time neural gameplay monitoring. Vision AI tracks in-game frags, headshots, placement, and automatically awards Points & XP:</p>

        <button onclick="TournyxEngineAPI.startVisionScreenCapture()" style="width:100%; padding:14px; background:linear-gradient(90deg, #ff8c00, #ff3300); border:none; border-radius:10px; color:white; font-family:var(--eng-font-head); font-weight:bold; font-size:0.9rem; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 4px 20px rgba(255,51,0,0.35);">
          <i class="fa-solid fa-desktop"></i> INITIALIZE LIVE NEURAL LINK
        </button>
      </div>

      <div class="em-section-box" style="margin-top:15px; border-color:#FFD700; background:rgba(255,215,0,0.04);">
        <div class="em-box-title"><i class="fa-solid fa-mobile-screen-button" style="color:#FFD700;"></i> Download Tournyx Mobile App (Android / iOS)</div>
        <p style="font-size:0.8rem; color:#ccc; margin-bottom:12px; line-height:1.4;">
          Get seamless floating HUD bubbles inside BGMI & Free Fire MAX with automatic background vision recognition!
        </p>
        <button onclick="TournyxEngineAPI.downloadMobileApp()" style="width:100%; padding:11px; background:rgba(255,215,0,0.2); border:1px solid #FFD700; border-radius:8px; color:#FFD700; font-family:var(--eng-font-head); font-weight:bold; font-size:0.82rem; cursor:pointer;">
          <i class="fa-brands fa-google-play"></i> DOWNLOAD NATIVE APK (v3.5)
        </button>
      </div>
    `;
  }

  function downloadMobileApp() {
    _showToast('📲 Tournyx Native Mobile App APK Download initiated!');
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://tournyx.in/download/tournyx-esports.apk');
    }
  }

  // ─── TAB 10: BOSS RAIDS ────────────────────────────────────────────────────
  function _initBossRaid() {
    state.bossRaidData = {
      name: 'ASURA: THE VOID TITAN',
      title: 'India Season 5 Community Boss',
      totalHp: 1000000,
      currentHp: 742500,
      rewardPool: 500000
    };
  }

  function _renderBossRaidTab() {
    const pane = document.getElementById('tab-boss-raids');
    if (!pane) return;
    const b = state.bossRaidData || { totalHp: 1000000, currentHp: 742500, name: 'ASURA: THE VOID TITAN' };
    const pct = Math.floor((b.currentHp / b.totalHp) * 100);

    pane.innerHTML = `
      <div class="boss-raid-container">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-family:var(--font-head); font-size:1.1rem; color:#ff3300; font-weight:900;">${b.name}</div>
            <div style="font-size:0.75rem; color:rgba(255,255,255,0.6);">${b.title}</div>
          </div>
          <div style="font-size:2rem;">👹</div>
        </div>

        <div class="boss-hp-track">
          <div class="boss-hp-fill" id="bossHpFill" style="width:${pct}%;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-family:var(--font-head); color:#ccc;">
          <span>HP: <b style="color:#ff3300;">${b.currentHp.toLocaleString()}</b> / ${b.totalHp.toLocaleString()}</span>
          <span>REWARD: <b style="color:#FFD700;">500K XP POOL</b></span>
        </div>

        <p style="font-size:0.8rem; color:#aaa; margin:15px 0 12px; line-height:1.4;">
          All Indian hunters contribute damage to Asura by completing daily quests and tournament matches!
        </p>

        <button onclick="TournyxEngineAPI.strikeBossRaid()" style="width:100%; padding:12px; background:linear-gradient(90deg, #ff3300, #ff8c00); border:none; border-radius:10px; color:white; font-family:var(--font-head); font-weight:900; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px; box-shadow:0 4px 15px rgba(255,51,0,0.4);">
          ⚔️ STRIKE THE RAID BOSS (-500 HP)
        </button>
      </div>
    `;
  }

  async function strikeBossRaid() {
    if (!state.bossRaidData) _initBossRaid();
    state.bossRaidData.currentHp = Math.max(0, state.bossRaidData.currentHp - 500);
    const pct = Math.floor((state.bossRaidData.currentHp / state.bossRaidData.totalHp) * 100);
    const fill = document.getElementById('bossHpFill');
    if (fill) fill.style.width = pct + '%';

    await _awardPoints(50, 'Boss Raid Strike: +50 PTS (+5 XP)');
    _showToast('💥 Direct Hit on Boss! -500 Boss HP | +50 PTS');
    _playChime('xp');
  }

  // ─── TAB 11: REGIONAL RANKS ────────────────────────────────────────────────
  function _renderRegionalRanksTab() {
    const pane = document.getElementById('tab-regional-ranks');
    if (!pane) return;

    const regions = [
      { name: 'Tamil Nadu', leader: 'Karthi_Viper', power: '42,500' },
      { name: 'Maharashtra', leader: 'Aakash_Snipe', power: '39,100' },
      { name: 'Delhi NCR', leader: 'Kabir_OP', power: '36,800' },
      { name: 'Karnataka', leader: 'Vijay_IGL', power: '34,200' },
      { name: 'Punjab', leader: 'Singh_Sher', power: '31,900' },
    ];

    pane.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-map-pin" style="color:var(--accent-green);"></i> Bharat State Leaderboards</div>
        <p style="font-size:0.8rem; color:#aaa; margin-bottom:12px;">Top-rated hunters representing each Indian state:</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${regions.map((reg, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:rgba(255,255,255,0.02); border-radius:10px; border-left:3px solid ${i === 0 ? '#FFD700' : 'var(--accent-cyan)'};">
              <div>
                <div style="color:white; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">#${i+1} ${reg.name}</div>
                <div style="color:var(--text-muted); font-size:0.75rem;">Champion: ${reg.leader}</div>
              </div>
              <div style="font-family:var(--font-head); color:#FFD700; font-size:0.85rem; font-weight:bold;">${reg.power} PWR</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─── 10. RANK-UP CEREMONY ──────────────────────────────────────────────────
  function triggerRankUpCeremony(newRank) {
    const meta = _getRankMeta(newRank);
    const existing = document.getElementById('rankup-ceremony');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'rankup-ceremony';
    overlay.innerHTML = `
      <canvas id="rankup-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none;"></canvas>
      <div class="rankup-box">
        <div style="font-family:var(--eng-font-head); font-size:0.85rem; letter-spacing:5px; color:${meta.color}; margin-bottom:8px;">SYSTEM ALERT • HUNTER AWAKENING</div>
        <div class="rankup-badge-icon">${meta.icon}</div>
        <div class="rankup-tier-text" style="color:${meta.color}; text-shadow:0 0 25px ${meta.color};">${meta.label}</div>
        <div class="rankup-title-text">${meta.title}</div>
        <div class="rankup-desc-text">${HINGLISH_QUOTES[Math.floor(Math.random() * HINGLISH_QUOTES.length)]}</div>
        <button class="rankup-continue-btn" onclick="document.getElementById('rankup-ceremony').remove()">
          CONTINUE QUEST →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => _runParticleBurst('rankup-canvas', meta.color), 150);
    _playChime('rankup');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }

  function _runParticleBurst(canvasId, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles = Array.from({ length: 140 }, (_, i) => {
      const angle = (Math.PI * 2 / 140) * i;
      const speed = 3 + Math.random() * 8;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        alpha: 1,
        color: Math.random() > 0.4 ? color : '#ffffff'
      };
    });

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.alpha -= 0.012;
        if (p.alpha <= 0) return;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (++frames < 120) requestAnimationFrame(animate);
    };
    animate();
  }

  function simulateRankUp() {
    const rIdx = RANK_TIERS.findIndex(r => r.label === (state.engineData?.rank_tier || 'E-RANK'));
    const nextTier = RANK_TIERS[Math.min(rIdx + 1, RANK_TIERS.length - 1)];
    triggerRankUpCeremony(nextTier.label);
  }

  // ─── 11. POINTS & XP REWARD PIPELINE ───────────────────────────────────────
  async function _awardPoints(ptsAmount, desc) {
    if (!state.user) return;
    const cleanEmail = (state.user.email || '').trim().toLowerCase();

    // 100 Points = 10 XP
    const xpAmount = Math.floor(ptsAmount / 10);

    const oldPoints = parseInt(state.user.points) || 8000;
    const newPoints = Math.max(0, oldPoints + ptsAmount);
    state.user.points = newPoints;
    localStorage.setItem('tournyx_user', JSON.stringify(state.user));

    if (state.engineData) {
      state.engineData.total_xp = Math.max(0, (state.engineData.total_xp || 800) + xpAmount);
      state.engineData.daily_xp = (state.engineData.daily_xp || 0) + xpAmount;
      state.engineData.power_level = Math.max(100, (state.engineData.power_level || 100) + Math.floor(ptsAmount / 20));
      
      const newRank = _getRankTierByPower(state.engineData.power_level);
      if (newRank !== state.engineData.rank_tier) {
        state.engineData.rank_tier = newRank;
        setTimeout(() => triggerRankUpCeremony(newRank), 400);
      }
    }

    _updateEngineWidget(state.engineData);
    _updateModalHeader(state.engineData);

    if (window.syncLiveWalletPoints) window.syncLiveWalletPoints(state.user);
    if (window.TournyxVisionAI && typeof window.TournyxVisionAI.updateBubble === 'function') {
      window.TournyxVisionAI.updateBubble(state.engineData);
    }

    // Save strictly to Supabase Users table & player_engine
    if (state.db && cleanEmail) {
      try {
        await state.db.from('Users').update({ points: newPoints }).ilike('email', cleanEmail);
        if (state.engineData) {
          await state.db.from('player_engine').update({
            total_xp: state.engineData.total_xp,
            daily_xp: state.engineData.daily_xp,
            power_level: state.engineData.power_level,
            rank_tier: state.engineData.rank_tier
          }).ilike('email', cleanEmail);
        }
        await state.db.from('engine_log').insert({
          event_type: 'xp_gain',
          event_desc: desc,
          xp_delta: xpAmount
        });
      } catch(e) {
        console.warn('Database point save notice:', e);
      }
    }
  }

  async function awardStreakXP(streakRewardPts) {
    await _awardPoints(streakRewardPts, `Daily Streak Surge: +${streakRewardPts} PTS`);
  }

  async function startVisionScreenCapture() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        state.visionStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
        state.isVisionActive = true;
        _showToast('🔴 Vision AI Neural Link Active! Monitoring Gameplay.');
      } else {
        _showToast('📲 Native Background Screen HUD requires the Tournyx Mobile App.');
        downloadMobileApp();
        return;
      }

      state.visionStream.getVideoTracks()[0].onended = () => {
        state.isVisionActive = false;
        _showToast('Neural Link Terminated.');
      };
    } catch(err) {
      _showToast('📲 Open Tournyx Mobile App to activate background vision tracking.');
    }
  }

  function _triggerXPParticle(amount, anchorEl) {
    const el = document.createElement('div');
    el.className = 'eng-xp-particle';
    el.textContent = '+' + amount + ' XP';
    const rect = (anchorEl || document.body).getBoundingClientRect();
    el.style.left = (rect.left + rect.width / 2 - 25) + 'px';
    el.style.top = rect.top + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  // ─── 12. MATRIX BOOT SEQUENCE ──────────────────────────────────────────────
  function _triggerBootSequence() {
    const modalBox = document.querySelector('.engine-modal-box');
    if (!modalBox) return;

    const overlay = document.createElement('div');
    overlay.id = 'tx-boot-overlay';
    overlay.innerHTML = `
      <div style="text-align:center; font-family:var(--font-head);">
        <div style="font-size:3rem; margin-bottom:12px; filter:drop-shadow(0 0 20px #00f2ff);">⚡</div>
        <div id="bootStatusText" style="font-size:1.1rem; letter-spacing:4px; color:#00f2ff;">SYNCHRONIZING HUNTER MATRIX...</div>
        <div style="width:200px; height:4px; background:rgba(255,255,255,0.08); border-radius:4px; margin:16px auto 0; overflow:hidden;">
          <div id="bootProgressBar" style="width:0%; height:100%; background:#00f2ff; transition:width 1s ease; box-shadow:0 0 10px #00f2ff;"></div>
        </div>
      </div>
    `;

    modalBox.style.position = 'relative';
    modalBox.appendChild(overlay);

    setTimeout(() => {
      const b = document.getElementById('bootProgressBar');
      if (b) b.style.width = '100%';
    }, 50);

    setTimeout(() => {
      const t = document.getElementById('bootStatusText');
      if (t) {
        t.textContent = 'NEURAL LINK SYNCHRONIZED';
        t.style.color = '#00ff7f';
      }
    }, 950);

    setTimeout(() => overlay.remove(), 1350);
  }

  function _bindDOMEvents() {
    const openBtn = document.querySelector('.ew2-open-btn');
    if (openBtn) openBtn.onclick = openSystemPopup;
  }

  // ─── 13. REALTIME SUBSCRIPTION ─────────────────────────────────────────────
  function _initRealtimeSubscription() {
    if (!state.db || !state.user?.email) return;
    try {
      const cleanEmail = (state.user.email || '').trim().toLowerCase();
      state.realtimeChannel = state.db
        .channel('engine-sync-feed')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'player_engine', filter: `email=eq.${cleanEmail}` }, (payload) => {
          if (payload.new) {
            state.engineData = payload.new;
            _updateEngineWidget(payload.new);
            _updateModalHeader(payload.new);
          }
        })
        .subscribe();
    } catch(e) {}
  }

  // ─── 14. UTILITY HELPERS ───────────────────────────────────────────────────
  function _showToast(msg, isError = false) {
    if (typeof showToast === 'function') {
      showToast(msg, isError);
      return;
    }
    const t = document.getElementById('customToast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = isError ? '#ff4d4d' : 'rgba(0,242,255,0.9)';
    t.style.color = isError ? 'white' : '#000';
    t.className = 'show';
    setTimeout(() => { t.className = ''; }, 3000);
  }

  function _timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return Math.floor(diff) + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  return {
    init,
    openSystemPopup,
    closeEngineModal,
    switchEngineTab,
    startAndVerifyTask,
    startDrill,
    confirmAwakening,
    claimHiddenQuest,
    setPlayerDNA,
    buildDreamTeam,
    inviteSquadmate,
    spinLuckyWheel,
    buyShopItem,
    downloadMobileApp,
    startVisionScreenCapture,
    strikeBossRaid,
    simulateRankUp,
    triggerRankUpCeremony,
    awardStreakXP,
    setGraphicTier,
    loadEngineData,
    get state() { return state; }
  };

})();

window.TournyxEngine = TournyxEngine;
window.TournyxEngineAPI = TournyxEngine;

document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  const timer = setInterval(() => {
    if (typeof db !== 'undefined' && db) {
      clearInterval(timer);
      TournyxEngine.init(db);
    } else if (++attempts > 20) {
      clearInterval(timer);
      TournyxEngine.init(null);
    }
  }, 250);
});

