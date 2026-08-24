/**
 * ==============================================================================
 * TOURNYX ENGINE v2.0 - MASTER ENGINE PLUGIN
 * Architecture: Solo Levelling Hero System x Indian Esports x Vision AI
 * Database: Supabase (PostgreSQL + Realtime Channel)
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
  };

  // ─── 3. INITIALIZATION ─────────────────────────────────────────────────────
  function init(dbInstance) {
    state.db = dbInstance;
    try { state.user = JSON.parse(localStorage.getItem('tournyx_user')); } catch(e) {}
    
    _injectDynamicTabs();
    _bindDOMEvents();
    loadEngineData();
    _initRealtimeSubscription();
    _initBossRaid();
    
    console.log('%c⚡ TOURNYX ENGINE v2.0 ACTIVE', 'color:#00f2ff; font-weight:bold; font-size:14px;');
  }

  // ─── 4. SOUND SYNTHESIZER (WEB AUDIO API) ──────────────────────────────────
  function _playChime(type) {
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

  // ─── 5. DATA SYNC & SUPABASE LOADER ────────────────────────────────────────
  async function loadEngineData() {
    if (!state.user || !state.user.email) {
      _renderGuestWidget();
      return;
    }

    if (state.db) {
      try {
        const { data, error } = await state.db
          .from('player_engine')
          .select('*')
          .eq('email', state.user.email)
          .single();

        if (!error && data) {
          state.engineData = data;
          _updateEngineWidget(data);
          _updateModalHeader(data);
          return;
        } else {
          // Create user engine record if not found
          await _bootstrapProfile();
          return;
        }
      } catch(err) {
        console.warn('Supabase fetch fallback to local computation', err);
      }
    }

    // Local / Offline fallback
    _computeLocalProfile();
  }

  async function _bootstrapProfile() {
    if (!state.user) return;
    const wins = parseInt(state.user.wins) || 0;
    const matches = parseInt(state.user.matches) || 0;
    const points = parseInt(state.user.points) || 0;
    const wr = matches > 0 ? Math.floor((wins / matches) * 100) : 0;
    const power = _calculatePower(wins, matches, points, wr);

    const defaultProfile = {
      user_id: state.user.id || '00000000-0000-0000-0000-000000000000',
      email: state.user.email,
      username: state.user.username || state.user.ign || 'Player',
      power_level: power,
      rank_tier: _getRankTierByPower(power),
      total_xp: points * 10 || 1200,
      daily_xp: 420,
      skill_combat: Math.min(50 + wins * 2, 98),
      skill_strategy: Math.min(50 + Math.floor(wr / 2), 95),
      skill_teamwork: 65,
      skill_reaction: 62,
      skill_leadership: 58,
      skill_consistency: 70,
      player_dna: 'Rusher',
      evolution_stage: wins > 15 ? 'Pro' : 'Rookie',
      state_region: 'Tamil Nadu',
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
    const matches = parseInt(u.matches) || 0;
    const points = parseInt(u.points) || 0;
    const wr = matches > 0 ? Math.floor((wins / matches) * 100) : 0;
    const power = _calculatePower(wins, matches, points, wr);

    state.engineData = {
      power_level: power,
      rank_tier: _getRankTierByPower(power),
      total_xp: (points * 10) || 1200,
      daily_xp: 420,
      skill_combat: Math.min(50 + wins * 2, 98),
      skill_strategy: Math.min(50 + Math.floor(wr / 2), 95),
      skill_teamwork: 65,
      skill_reaction: 62,
      skill_leadership: 58,
      skill_consistency: 70,
      player_dna: 'Rusher',
      evolution_stage: wins > 10 ? 'Pro' : 'Rookie',
      state_region: 'Tamil Nadu',
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

  // ─── 6. WIDGET & HEADER DOM UPDATERS ───────────────────────────────────────
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

    const m = parseInt(state.user?.matches) || 0;
    const w = parseInt(state.user?.wins) || 0;
    setHtml('emStatWinRate', m > 0 ? `${Math.floor((w / m) * 100)}%` : '0%');

    const avatarEl = document.getElementById('emUserAvatar');
    if (avatarEl) {
      avatarEl.src = state.user?.avatar || `https://ui-avatars.com/api/?name=${(state.user?.username || 'P').charAt(0)}&background=0d0d1a&color=00f2ff&size=80`;
    }
  }

  // ─── 7. MODAL LOGIC & TAB SWITCHER ─────────────────────────────────────────
  function openSystemPopup() {
    if (!state.user || !state.user.email) {
      document.getElementById('authPopup')?.classList.add('active');
      return;
    }

    _updateModalHeader(state.engineData);
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
    if (btnEl) btnEl.classList.add('active');

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

  // ─── TAB 1: PLAYER ANALYSIS + RADAR ────────────────────────────────────────
  function _renderPlayerAnalysis() {
    const data = state.engineData;
    if (!data) return;

    const skills = [
      { key: 'skill_combat',      label: 'Combat',       color: '#ff4d4d' },
      { key: 'skill_reaction',    label: 'Reaction',     color: '#00f2ff' },
      { key: 'skill_strategy',    label: 'Strategy',     color: '#bd00ff' },
      { key: 'skill_teamwork',    label: 'Teamwork',     color: '#00ff7f' },
      { key: 'skill_leadership',  label: 'Leadership',   color: '#FFD700' },
      { key: 'skill_consistency', label: 'Consistency',  color: '#ff9800' },
    ];

    skills.forEach(sk => {
      const val = data[sk.key] || 50;
      const item = document.querySelector(`[data-skill="${sk.key}"]`);
      if (item) {
        const b = item.querySelector('.em-skill-info b');
        if (b) b.textContent = val + '%';
        const bar = item.querySelector('.em-bar-fill');
        if (bar) {
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = val + '%';
            bar.style.background = sk.color;
            bar.style.boxShadow = `0 0 10px ${sk.color}`;
          }, 100);
        }
      }
    });

    const weakest = skills.reduce((a, b) => (data[a.key] || 50) < (data[b.key] || 50) ? a : b);
    const strongest = skills.reduce((a, b) => (data[a.key] || 50) > (data[b.key] || 50) ? a : b);

    const reportEl = document.getElementById('em-ai-report-text');
    if (reportEl) {
      reportEl.innerHTML = `
        <div style="font-size:0.85rem; color:#ccc; line-height:1.6;">
          <p style="margin-bottom:6px;">🌟 Dominant Trait: <b style="color:#00ff7f;">${strongest.label} (${data[strongest.key]}%)</b></p>
          <p style="margin-bottom:6px;">⚠️ Area for Improvement: <b style="color:#ff4d4d;">${weakest.label} (${data[weakest.key]}%)</b></p>
          <p style="margin-bottom:8px;">💡 AI Coach Prescription: <span style="color:#00f2ff;">Engage in 15 mins of daily ${weakest.label.toLowerCase()} drills to boost overall Power Rating.</span></p>
          <div style="font-family:var(--font-head); color:var(--accent-purple); font-size:0.8rem; font-weight:bold;">
            BONUS: Complete drill for <b>+250 XP</b>
          </div>
        </div>
      `;
    }

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
        animation: { duration: 800 }
      }
    });
  }

  // ─── TAB 2: SMART TASKS ────────────────────────────────────────────────────
  async function _renderTasksTab() {
    const container = document.getElementById('em-tasks-container');
    if (!container) return;

    container.innerHTML = `<div style="color:var(--accent-cyan); text-align:center; padding:25px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Syncing missions...</div>`;

    let tasks = [];
    if (state.db && state.user?.email) {
      try {
        const { data } = await state.db
          .from('engine_tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data && data.length > 0) tasks = data;
      } catch(e) {}
    }

    if (tasks.length === 0) {
      tasks = [
        { id: 'tsk1', task_title: 'Achieve 10 Headshots in Battle Royale', xp_reward: 200, progress: 0, target: 10, is_completed: false },
        { id: 'tsk2', task_title: 'Survive in Top 3 Squads for 2 Matches', xp_reward: 250, progress: 0, target: 2, is_completed: false },
        { id: 'tsk3', task_title: 'Deal 2500 Damage with Assault Rifles', xp_reward: 180, progress: 0, target: 2500, is_completed: false },
        { id: 'tsk4', task_title: 'Revive 3 Squadmates during Ranked Play', xp_reward: 150, progress: 0, target: 3, is_completed: false },
        { id: 'tsk5', task_title: 'Maintain 5-Kill Streak in TDM Mode', xp_reward: 300, progress: 0, target: 1, is_completed: false },
      ];
    }

    const doneCount = tasks.filter(t => t.is_completed).length;
    const progressPct = tasks.length > 0 ? Math.floor((doneCount / tasks.length) * 100) : 0;

    container.innerHTML = `
      <div class="em-task-list">
        ${tasks.map(t => `
          <div class="em-task-card ${t.is_completed ? 'completed' : ''}" id="tsk-card-${t.id}">
            <div class="em-task-info">
              <i class="${t.is_completed ? 'fa-solid fa-square-check' : 'fa-regular fa-square'}" style="color:${t.is_completed ? 'var(--accent-green)' : 'var(--text-muted)'}; font-size:1.1rem;"></i>
              <span>${t.task_title}</span>
              <small>${t.progress || 0}/${t.target || 1}</small>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="${t.is_completed ? 'em-task-status' : 'em-task-xp'}">
                ${t.is_completed ? 'COMPLETED ✓' : '+' + t.xp_reward + ' XP'}
              </span>
              ${!t.is_completed ? `<button class="em-task-claim-btn" onclick="TournyxEngineAPI.claimTask('${t.id}', ${t.xp_reward}, this)" style="background:rgba(0,242,255,0.1); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:5px 12px; border-radius:8px; font-size:0.72rem; font-family:var(--font-head); font-weight:bold; cursor:pointer;">CLAIM</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:18px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-family:var(--font-head); color:var(--text-muted); margin-bottom:6px;">
          <span>MISSION COMPLETION</span>
          <span style="color:var(--accent-cyan);">${progressPct}%</span>
        </div>
        <div style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
          <div id="em-task-bar-fill" style="height:100%; width:0%; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-purple)); transition:width 1s ease;"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const b = document.getElementById('em-task-bar-fill');
      if (b) b.style.width = progressPct + '%';
    }, 150);
  }

  async function claimTask(taskId, xpReward, btnEl) {
    if (!state.user?.email) return;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = 'VERIFYING...';
    }

    await _awardXP(xpReward, `Mission Completed: +${xpReward} XP`);

    const card = document.getElementById('tsk-card-' + taskId);
    if (card) {
      card.classList.add('completed');
      const icon = card.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-square-check';
        icon.style.color = 'var(--accent-green)';
      }
      const xpTag = card.querySelector('.em-task-xp');
      if (xpTag) {
        xpTag.className = 'em-task-status';
        xpTag.textContent = 'COMPLETED ✓';
      }
      if (btnEl) btnEl.remove();
      _triggerXPParticle(xpReward, card);
    }

    _playChime('xp');
    _showToast(`🎯 Mission Claimed: +${xpReward} XP!`);
  }

  // ─── TAB 3: AI RECOMMENDATIONS & DREAM TEAM ────────────────────────────────
  function _renderAIRecommendations() {
    const container = document.getElementById('em-ai-reco-container');
    if (!container || !state.engineData) return;
    const d = state.engineData;
    const dnaInfo = PLAYER_DNA[d.player_dna] || PLAYER_DNA['Rusher'];

    container.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-chart-line" style="color:var(--accent-cyan);"></i> Performance Trajectory</div>
        <canvas id="engineTrendCanvas" height="85"></canvas>
      </div>

      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-dna" style="color:${dnaInfo.color};"></i> Player DNA: <span style="color:${dnaInfo.color};">${d.player_dna}</span></div>
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
        <p style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">Recommended squadmates whose playstyles perfectly synergize with your ${d.player_dna} profile:</p>
        <div id="dreamSquadList" style="display:flex; flex-direction:column; gap:8px;">
          <div style="color:var(--accent-cyan); text-align:center; padding:10px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Finding teammates...</div>
        </div>
        <button onclick="TournyxEngineAPI.buildDreamTeam()" style="width:100%; margin-top:12px; padding:12px; background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border:none; border-radius:10px; color:white; font-family:var(--font-head); font-weight:bold; font-size:0.85rem; cursor:pointer; text-transform:uppercase; letter-spacing:1px;">
          <i class="fa-solid fa-wand-magic-sparkles"></i> RE-OPTIMIZE SQUAD
        </button>
      </div>
    `;

    _renderTrendCurve();
    setTimeout(() => buildDreamTeam(), 1000);
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
        const { data } = await state.db.from('Users').select('username, avatar, wins').limit(3);
        if (data) players = data;
      } catch(e) {}
    }

    if (players.length === 0) {
      players = [
        { username: 'Phoenix_Viper', wins: 48, role: 'Sniper' },
        { username: 'Rohan_Medic', wins: 34, role: 'Support' },
        { username: 'Astra_IGL', wins: 62, role: 'IGL' }
      ];
    }

    const complementRoles = ['Sniper', 'Support', 'IGL'];
    el.innerHTML = players.slice(0, 3).map((p, i) => `
      <div style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
        <img src="${p.avatar || 'https://ui-avatars.com/api/?name=' + (p.username || 'P').charAt(0) + '&background=0d0d1a&color=00f2ff'}" style="width:38px; height:38px; border-radius:50%; border:2px solid var(--accent-cyan);">
        <div style="flex:1;">
          <div style="color:white; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${p.username || 'Player'}</div>
          <div style="color:var(--accent-cyan); font-size:0.75rem;">${complementRoles[i] || 'Flex'} • ${p.wins || 0} Wins</div>
        </div>
        <button onclick="TournyxEngineAPI.inviteSquadmate('${p.username}')" style="background:rgba(0,242,255,0.1); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:4px 10px; border-radius:6px; font-size:0.7rem; font-family:var(--font-head); font-weight:bold; cursor:pointer;">INVITE</button>
      </div>
    `).join('');
  }

  function inviteSquadmate(name) {
    _showToast(`✉️ Squad invitation transmitted to ${name}!`);
  }

  // ─── TAB 4: ROLE TRAINING ──────────────────────────────────────────────────
  function _renderRoleTraining() {
    const dna = state.engineData?.player_dna || 'Rusher';
    document.querySelectorAll('.em-role-card').forEach(c => {
      c.classList.toggle('active', c.dataset.role === dna);
    });
    const h = document.getElementById('roleTrainingHeading');
    if (h) h.textContent = dna.toUpperCase() + ' TRAINING PROGRAM';
  }

  function selectRole(card, roleName) {
    document.querySelectorAll('.em-role-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const h = document.getElementById('roleTrainingHeading');
    if (h) h.textContent = roleName.toUpperCase() + ' TRAINING PROGRAM';
    setPlayerDNA(roleName);
  }

  async function setPlayerDNA(name) {
    if (!state.engineData) return;
    state.engineData.player_dna = name;
    if (state.db && state.user?.email) {
      try {
        await state.db.from('player_engine').update({ player_dna: name }).eq('email', state.user.email);
      } catch(e) {}
    }
    _showToast(`🧬 Player DNA Switched to: ${name}`);
    _renderAIRecommendations();
  }

  // ─── TAB 5: PLAYER EVOLUTION ───────────────────────────────────────────────
  function _renderEvolutionTab() {
    const container = document.getElementById('em-evolution-container');
    if (!container || !state.engineData) return;
    const d = state.engineData;
    const meta = _getRankMeta(d.rank_tier);
    const rIdx = RANK_TIERS.findIndex(r => r.label === d.rank_tier);
    const nextRank = RANK_TIERS[Math.min(rIdx + 1, RANK_TIERS.length - 1)];
    const prevMin = rIdx > 0 ? RANK_TIERS[rIdx - 1].min : 0;
    const rangePct = Math.min(((d.power_level - prevMin) / (nextRank.min - prevMin)) * 100, 100);
    const dashArr = Math.min((rangePct / 100) * 390, 390);
    const stages = ['Rookie', 'Pro', 'Elite', 'Legend'];
    const stageIdx = stages.indexOf(d.evolution_stage || 'Rookie');

    container.innerHTML = `
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

  // ─── TAB 6: INVENTORY & ENERGY BAR ─────────────────────────────────────────
  function _renderInventoryTab() {
    const d = state.engineData || {};
    const u = state.user || {};
    const container = document.getElementById('em-inventory-container');
    if (!container) return;

    const items = [
      { icon: 'fa-star',     color: 'var(--accent-green)',  label: 'Total XP',    value: (d.total_xp || 0).toLocaleString() },
      { icon: 'fa-coins',    color: '#FFD700',               label: 'Coins',       value: (parseInt(u.points) || 0).toLocaleString() },
      { icon: 'fa-ticket',   color: 'var(--accent-cyan)',    label: 'TX Tickets',  value: Math.floor((parseInt(u.earnings) || 0) / 10).toLocaleString() },
      { icon: 'fa-rocket',   color: 'var(--accent-orange)',  label: 'Boost Cards', value: d.boost_cards || 0 },
      { icon: 'fa-box-open', color: 'var(--accent-purple)',  label: 'Loot Boxes',  value: d.loot_boxes || 0 },
      { icon: 'fa-bolt',     color: 'var(--accent-cyan)',    label: 'Energy',      value: (d.energy || 85) + '/100' },
    ];

    container.innerHTML = `
      <div class="em-inventory-list">
        ${items.map(item => `
          <div class="em-inv-item">
            <span class="em-inv-name"><i class="fa-solid ${item.icon}" style="color:${item.color}; width:20px; text-align:center;"></i> ${item.label}</span>
            <b style="font-family:var(--font-head); color:white;">${item.value}</b>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:20px;">
        <div class="em-box-title"><i class="fa-solid fa-bolt" style="color:var(--accent-cyan);"></i> Hunter Energy Capacitor</div>
        <div style="position:relative; height:24px; background:rgba(255,255,255,0.05); border-radius:12px; overflow:hidden; margin-top:8px;">
          <div style="height:100%; width:${d.energy || 85}%; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-purple)); border-radius:12px; box-shadow:0 0 10px var(--accent-cyan);"></div>
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:var(--font-head); font-size:0.75rem; font-weight:bold; color:white;">${d.energy || 85}/100</div>
        </div>
        <button onclick="TournyxEngineAPI.refillEnergy()" style="width:100%; margin-top:10px; padding:10px; background:rgba(0,242,255,0.1); border:1px solid var(--accent-cyan); border-radius:10px; color:var(--accent-cyan); font-family:var(--font-head); font-weight:bold; cursor:pointer; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">
          ⚡ REFILL ENERGY (+30)
        </button>
      </div>
    `;
  }

  async function refillEnergy() {
    if (!state.engineData) return;
    state.engineData.energy = Math.min((state.engineData.energy || 85) + 30, 100);
    if (state.db && state.user?.email) {
      try {
        await state.db.from('player_engine').update({ energy: state.engineData.energy }).eq('email', state.user.email);
      } catch(e) {}
    }
    _showToast('⚡ Energy Capacitor Recharged! +30 Energy');
    _renderInventoryTab();
  }

  // ─── TAB 7: HIDDEN QUESTS ──────────────────────────────────────────────────
  async function _renderHiddenQuests() {
    const container = document.getElementById('em-hidden-quests-container');
    if (!container) return;
    const wins = parseInt(state.user?.wins) || 0;
    const matches = parseInt(state.user?.matches) || 0;

    const quests = [
      { id: 'hq1', name: 'First Blood',           xp_reward: 1000, badge: 'VETERAN FRAME',  cond: (w) => w >= 1 },
      { id: 'hq2', name: 'Win 5 Squad Matches',   xp_reward: 2000, badge: 'LEGEND FRAME',   cond: (w) => w >= 5 },
      { id: 'hq3', name: 'The Grinder (20 Games)', xp_reward: 1500, badge: 'GRIND BADGE',    cond: (w, m) => m >= 20 },
      { id: 'hq4', name: 'Bharat Ke Yoddha',      xp_reward: 3000, badge: 'NATIONAL TITLE', cond: (w) => w >= 15 },
    ];

    container.innerHTML = `
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
                    <div style="color:#FFD700; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${q.xp_reward} XP</div>
                  </div>
                  <div style="flex:1; text-align:center; padding:6px; background:rgba(255,255,255,0.03); border-radius:8px;">
                    <div style="color:var(--accent-cyan); font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">${q.badge}</div>
                  </div>
                </div>
                <button onclick="TournyxEngineAPI.claimHiddenQuest('${q.id}', ${q.xp_reward}, '${q.badge}', this)" style="width:100%; padding:10px; background:linear-gradient(90deg, #FFD700, #ff9800); border:none; border-radius:8px; color:#000; font-family:var(--font-head); font-weight:bold; cursor:pointer; font-size:0.8rem; text-transform:uppercase;">
                  CLAIM ACHIEVEMENT
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async function claimHiddenQuest(qId, xpReward, badge, btn) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'CLAIMING...';
    }
    await _awardXP(xpReward, `Secret Quest: +${xpReward} XP & ${badge}`);
    _showToast(`🏆 ${badge} UNLOCKED! +${xpReward} XP`);
    _playChime('rankup');
    if (btn) {
      btn.textContent = 'CLAIMED ✓';
      btn.style.background = 'rgba(0,255,127,0.2)';
      btn.style.color = 'var(--accent-green)';
    }
  }

  // ─── TAB 8: SYSTEM AUDIT LOG ───────────────────────────────────────────────
  async function _renderSystemLog() {
    const container = document.getElementById('em-system-log-container');
    if (!container) return;

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

    container.innerHTML = `
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
    const container = document.getElementById('em-vision-ai-container');
    if (!container) return;

    container.innerHTML = `
      <div class="em-section-box">
        <div class="em-box-title"><i class="fa-solid fa-eye fa-fade" style="color:var(--accent-orange);"></i> Tournyx Vision AI Scanner</div>
        <p style="font-size:0.82rem; color:#aaa; margin-bottom:15px;">Input your match results, upload your victory screenshot, or let our Neural Link screen monitor evaluate your gameplay stats in real-time.</p>
        
        <!-- MOBILE SCREENSHOT SCANNER (ALL DEVICES) -->
        <div style="background:rgba(0,242,255,0.06); border:1px dashed var(--accent-cyan); border-radius:12px; padding:14px; text-align:center; margin-bottom:16px;">
          <i class="fa-solid fa-cloud-arrow-up" style="color:var(--accent-cyan); font-size:1.6rem; margin-bottom:6px;"></i>
          <div style="color:white; font-family:var(--font-head); font-size:0.85rem; font-weight:bold;">📸 UPLOAD MATCH SCORECARD / SCREENSHOT</div>
          <div style="font-size:0.72rem; color:#aaa; margin:4px 0 10px;">Mobile & PC: AI will scan kills, placement, and damage directly from your image</div>
          <input type="file" id="vas-screenshot-input" accept="image/*" style="display:none;" onchange="TournyxEngineAPI.handleScreenshotUpload(event)">
          <button onclick="document.getElementById('vas-screenshot-input').click()" style="padding:8px 18px; background:rgba(0,242,255,0.15); border:1px solid var(--accent-cyan); border-radius:8px; color:var(--accent-cyan); font-family:var(--font-head); font-weight:bold; font-size:0.75rem; cursor:pointer;">
            SELECT SCREENSHOT FROM GALLERY / CAMERA
          </button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
          <div>
            <label style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-head);">GAME TITLE</label>
            <select id="vas-game" style="width:100%; padding:10px; background:#0a0a0d; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; font-family:var(--font-head); font-size:0.85rem; margin-top:4px;">
              <option value="BGMI">BGMI (Battlegrounds India)</option>
              <option value="Free Fire MAX">Free Fire MAX</option>
              <option value="CODM">Call of Duty Mobile</option>
              <option value="Valorant">Valorant Mobile</option>
            </select>
          </div>
          <div>
            <label style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-head);">FINAL PLACEMENT</label>
            <input id="vas-placement" type="number" min="1" max="100" placeholder="#1" style="width:100%; padding:10px; background:#0a0a0d; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; font-family:var(--font-head); font-size:0.85rem; margin-top:4px;">
          </div>
          <div>
            <label style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-head);">ELIMINATIONS</label>
            <input id="vas-kills" type="number" min="0" max="40" placeholder="0" style="width:100%; padding:10px; background:#0a0a0d; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; font-family:var(--font-head); font-size:0.85rem; margin-top:4px;">
          </div>
          <div>
            <label style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-head);">TOTAL DAMAGE</label>
            <input id="vas-damage" type="number" min="0" max="6000" placeholder="0" style="width:100%; padding:10px; background:#0a0a0d; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; font-family:var(--font-head); font-size:0.85rem; margin-top:4px;">
          </div>
        </div>

        <div id="vas-ai-result" style="display:none; padding:14px; background:rgba(0,242,255,0.05); border-radius:10px; border:1px solid rgba(0,242,255,0.2); margin-bottom:15px;">
          <div style="color:var(--accent-cyan); font-family:var(--font-head); font-size:0.85rem; margin-bottom:6px;"><i class="fa-solid fa-robot"></i> NEURAL EVALUATION COMPLETE</div>
          <div id="vas-ai-text" style="color:#ddd; font-size:0.82rem; line-height:1.5;"></div>
        </div>

        <button onclick="TournyxEngineAPI.submitMatchToVisionAI()" id="vas-submit-btn" style="width:100%; padding:14px; background:linear-gradient(90deg, #ff8c00, #ff3300); border:none; border-radius:10px; color:white; font-family:var(--font-head); font-weight:bold; font-size:0.9rem; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 4px 20px rgba(255,51,0,0.35);">
          <i class="fa-solid fa-bolt"></i> RUN VISION AI ANALYSIS
        </button>
      </div>

      <div class="em-section-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-desktop" style="color:var(--accent-orange);"></i> Live Neural Screen / Camera Monitor</div>
        <p style="font-size:0.82rem; color:#aaa; margin-bottom:12px;">Share your screen (Desktop) or activate camera monitor (Mobile) for automated HUD & kill tracking.</p>
        <button onclick="TournyxEngineAPI.startVisionScreenCapture()" style="width:100%; padding:12px; background:rgba(255,140,0,0.1); border:1px solid var(--accent-orange); border-radius:10px; color:var(--accent-orange); font-family:var(--font-head); font-weight:bold; cursor:pointer; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">
          <i class="fa-solid fa-video"></i> INITIALIZE LIVE NEURAL LINK
        </button>
      </div>

      <div class="em-section-box sharingan-box" style="margin-top:15px;">
        <div class="em-box-title"><i class="fa-solid fa-eye" style="color:#ff3300;"></i> <span style="color:#ff3300;">SHARINGAN MODE (5 MATCH INTENSIVE)</span></div>
        <p style="font-size:0.82rem; color:#ccc; margin-bottom:12px;">AI tracks your next 5 consecutive matches with microscopic accuracy to construct a custom esports masterclass program.</p>
        <button onclick="TournyxEngineAPI.activateSharinganMode()" style="width:100%; padding:12px; background:rgba(255,51,0,0.15); border:1px solid #ff3300; border-radius:10px; color:#ff3300; font-family:var(--font-head); font-weight:bold; cursor:pointer; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">
          👁️ ACTIVATE SHARINGAN PROTOCOL
        </button>
      </div>
    `;
  }

  async function handleScreenshotUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    _showToast('🔍 Vision AI Scanning Screenshot...');
    
    // Simulate Vision AI OCR parsing of screenshot
    setTimeout(async () => {
      const simulatedKills = Math.floor(4 + Math.random() * 9);
      const simulatedDamage = Math.floor(simulatedKills * 160 + Math.random() * 400);
      const simulatedPlacement = Math.random() > 0.4 ? 1 : Math.floor(2 + Math.random() * 5);

      const kEl = document.getElementById('vas-kills');
      const dEl = document.getElementById('vas-damage');
      const pEl = document.getElementById('vas-placement');

      if (kEl) kEl.value = simulatedKills;
      if (dEl) dEl.value = simulatedDamage;
      if (pEl) pEl.value = simulatedPlacement;

      _showToast(`✅ Screenshot Parsed: #${simulatedPlacement} | ${simulatedKills} Kills | ${simulatedDamage} DMG`);
      await submitMatchToVisionAI();
    }, 1200);
  }

  async function submitMatchToVisionAI() {
    const btn = document.getElementById('vas-submit-btn');
    const game = document.getElementById('vas-game')?.value || 'BGMI';
    const kills = parseInt(document.getElementById('vas-kills')?.value) || 0;
    const damage = parseInt(document.getElementById('vas-damage')?.value) || 0;
    const placement = parseInt(document.getElementById('vas-placement')?.value) || 10;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> PARSING NEURAL FRAMES...';
    }

    await new Promise(r => setTimeout(r, 1200));

    const xpEarned = Math.floor((kills * 50) + (damage * 0.1) + Math.max(0, (20 - placement) * 30));
    const deltas = {
      skill_combat: kills >= 8 ? 3 : kills >= 4 ? 2 : kills >= 1 ? 1 : -1,
      skill_strategy: placement <= 3 ? 3 : placement <= 10 ? 1 : -1,
      skill_consistency: damage >= 600 ? 2 : damage >= 300 ? 1 : 0
    };

    let report = `<b>${game} Match Report:</b> ${kills} Eliminations | ${damage} Damage | Placement #${placement}<br><br>`;
    if (placement <= 3) report += '🏆 <span style="color:#FFD700">Podium Finish! Stellar zone control detected.</span><br>';
    else if (kills === 0) report += '⚠️ <span style="color:var(--accent-orange)">0 Frags logged. Aggressive crosshair placement recommended.</span><br>';
    else report += '✅ <span style="color:var(--accent-green)">Solid performance! XP bonus granted.</span><br>';

    report += `<br><b>Skill Adjustments:</b> Combat ${deltas.skill_combat >= 0 ? '+' : ''}${deltas.skill_combat}%, Strategy ${deltas.skill_strategy >= 0 ? '+' : ''}${deltas.skill_strategy}%<br>`;
    report += `<b>Coach Note:</b> ${placement > 10 ? 'Avoid early mid-map rotations.' : 'Your peak tempo is optimal!'}`;

    const rEl = document.getElementById('vas-ai-result');
    const tEl = document.getElementById('vas-ai-text');
    if (rEl && tEl) {
      tEl.innerHTML = report;
      rEl.style.display = 'block';
    }

    await _awardXP(xpEarned, `Match Analyzed (${game}): +${xpEarned} XP`);

    if (state.engineData) {
      Object.entries(deltas).forEach(([k, v]) => {
        state.engineData[k] = Math.min(99, Math.max(1, (state.engineData[k] || 50) + v));
      });
      if (state.db && state.user?.email) {
        try {
          await state.db.from('player_engine').update(state.engineData).eq('email', state.user.email);
        } catch(e) {}
      }
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✓ ANALYSIS SAVED — SUBMIT ANOTHER MATCH';
    }

    _playChime('xp');
    _showToast(`💥 Vision AI: +${xpEarned} XP injected!`);
  }

  async function startVisionScreenCapture() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        state.visionStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
        _showToast('🔴 Neural Link Established! Screen scanning active.');
      } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Mobile fallback: camera stream
        state.visionStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        _showToast('📷 Mobile Camera Neural Link Established! Aim at game screen.');
      } else {
        // Open screenshot picker fallback
        document.getElementById('vas-screenshot-input')?.click();
        return;
      }

      let count = 0;
      state.visionInterval = setInterval(async () => {
        count++;
        if (count >= 5) {
          clearInterval(state.visionInterval);
          if (state.visionStream) state.visionStream.getTracks().forEach(t => t.stop());
          _showToast('✅ Live Match Session Parsed! +150 XP');
          await _awardXP(150, 'Neural Link Monitor: +150 XP');
        }
      }, 2000);

      state.visionStream.getVideoTracks()[0].onended = () => {
        clearInterval(state.visionInterval);
        _showToast('Neural Link Terminated.', true);
      };
    } catch(err) {
      // Fallback to screenshot upload on permission cancel or mobile block
      _showToast('📸 Switching to Screenshot Scanner...', false);
      document.getElementById('vas-screenshot-input')?.click();
    }
  }

  function activateSharinganMode() {
    _showToast('👁️ SHARINGAN MODE ACTIVATED: Next 5 Matches Tracked!');
    localStorage.setItem('tournyx_sharingan', JSON.stringify({ active: true, matchesLeft: 5, time: Date.now() }));
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
    const container = document.getElementById('em-boss-raids-container');
    if (!container) return;
    const b = state.bossRaidData || { totalHp: 1000000, currentHp: 742500, name: 'ASURA: THE VOID TITAN' };
    const pct = Math.floor((b.currentHp / b.totalHp) * 100);

    container.innerHTML = `
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

    await _awardXP(50, 'Boss Raid Strike: +50 XP');
    _showToast('💥 Direct Hit on Boss! -500 Boss HP | +50 XP');
    _playChime('xp');
  }

  // ─── TAB 11: REGIONAL RANKS ────────────────────────────────────────────────
  function _renderRegionalRanksTab() {
    const container = document.getElementById('em-regional-ranks-container');
    if (!container) return;

    const regions = [
      { name: 'Tamil Nadu', leader: 'Karthi_Viper', power: '42,500' },
      { name: 'Maharashtra', leader: 'Aakash_Snipe', power: '39,100' },
      { name: 'Delhi NCR', leader: 'Kabir_OP', power: '36,800' },
      { name: 'Karnataka', leader: 'Vijay_IGL', power: '34,200' },
      { name: 'Punjab', leader: 'Singh_Sher', power: '31,900' },
    ];

    container.innerHTML = `
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

  // ─── 8. RANK-UP CEREMONY ───────────────────────────────────────────────────
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

  // ─── 9. XP ENGINE & PARTICLES ──────────────────────────────────────────────
  async function _awardXP(amount, desc) {
    if (!state.engineData) return;
    const oldTier = state.engineData.rank_tier;

    state.engineData.total_xp = (state.engineData.total_xp || 0) + amount;
    state.engineData.daily_xp = (state.engineData.daily_xp || 0) + amount;
    state.engineData.power_level = (state.engineData.power_level || 100) + Math.floor(amount / 10);

    const newTier = _getRankTierByPower(state.engineData.power_level);
    if (newTier !== oldTier) {
      state.engineData.rank_tier = newTier;
      setTimeout(() => triggerRankUpCeremony(newTier), 400);
    }

    _updateEngineWidget(state.engineData);
    _updateModalHeader(state.engineData);

    if (window.TournyxVisionAI && typeof window.TournyxVisionAI.updateBubble === 'function') {
      window.TournyxVisionAI.updateBubble(state.engineData);
    }

    if (state.db && state.user?.email) {
      try {
        await state.db.from('player_engine').update({
          total_xp: state.engineData.total_xp,
          daily_xp: state.engineData.daily_xp,
          power_level: state.engineData.power_level,
          rank_tier: state.engineData.rank_tier,
          last_updated: new Date().toISOString()
        }).eq('email', state.user.email);

        await state.db.from('engine_log').insert({
          user_id: state.user.id || null,
          event_type: 'xp_gain',
          event_desc: desc,
          xp_delta: amount
        });
      } catch(e) {}
    }
  }

  async function awardStreakXP(streakPoints) {
    const xp = Math.floor((streakPoints || 50) * 2);
    await _awardXP(xp, `Daily Streak Surge: +${xp} XP`);
    _showToast(`⚡ Tournyx Engine: +${xp} XP Injected from Daily Streak!`);
  }

  function setGraphicTier(tier) {
    state.graphicTier = tier;
    document.body.classList.remove('eng-tier-performance', 'eng-tier-balanced', 'eng-tier-ultra');
    document.body.classList.add('eng-tier-' + tier);
    localStorage.setItem('tournyx_graphic_tier', tier);
    _showToast(`🖥️ Engine Graphics: ${tier.toUpperCase()} Mode`);
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

  // ─── 10. MATRIX BOOT SEQUENCE ──────────────────────────────────────────────
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

  // ─── 11. DYNAMIC TABS & DOM OVERLAYS ───────────────────────────────────────
  function _injectDynamicTabs() {
    const navMenu = document.querySelector('.em-nav-menu');
    if (navMenu && !document.querySelector('[data-tab="ai-recommendations"]')) {
      const extraTabs = [
        { id: 'ai-recommendations', icon: 'fa-robot',       label: 'AI RECO' },
        { id: 'vision-ai',          icon: 'fa-eye',         label: 'VISION AI' },
        { id: 'boss-raids',         icon: 'fa-skull',       label: 'BOSS RAIDS' },
        { id: 'regional-ranks',     icon: 'fa-map-pin',     label: 'BHARAT RANKS' },
      ];

      extraTabs.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'em-nav-btn';
        btn.dataset.tab = t.id;
        btn.innerHTML = `<i class="fa-solid ${t.icon}"></i> ${t.label}`;
        btn.onclick = function() { switchEngineTab(t.id, this); };
        navMenu.appendChild(btn);
      });
    }

    const tabContent = document.querySelector('.em-tab-content');
    if (tabContent) {
      const newPanes = [
        { id: 'ai-recommendations', cId: 'em-ai-reco-container' },
        { id: 'vision-ai',          cId: 'em-vision-ai-container' },
        { id: 'boss-raids',         cId: 'em-boss-raids-container' },
        { id: 'regional-ranks',     cId: 'em-regional-ranks-container' },
      ];

      newPanes.forEach(p => {
        if (!document.getElementById('tab-' + p.id)) {
          const pane = document.createElement('div');
          pane.className = 'em-pane';
          pane.id = 'tab-' + p.id;
          pane.innerHTML = `<div id="${p.cId}"><div style="color:var(--accent-cyan); text-align:center; padding:30px;"><i class="fa-solid fa-circle-notch fa-spin"></i></div></div>`;
          tabContent.appendChild(pane);
        }
      });

      const dynamicContainers = [
        ['tab-todays-tasks', 'em-tasks-container'],
        ['tab-inventory', 'em-inventory-container'],
        ['tab-hidden-quests', 'em-hidden-quests-container'],
        ['tab-system-log', 'em-system-log-container'],
        ['tab-player-evolution', 'em-evolution-container'],
      ];

      dynamicContainers.forEach(([paneId, cId]) => {
        const p = document.getElementById(paneId);
        if (p && !document.getElementById(cId)) {
          p.innerHTML = `<div id="${cId}"></div>`;
        }
      });
    }

    // Embed radar chart canvas in analysis tab if missing
    const analysisPane = document.getElementById('tab-player-analysis');
    if (analysisPane && !document.getElementById('skillRadarCanvas')) {
      const radarBox = document.createElement('div');
      radarBox.className = 'em-radar-box';
      radarBox.innerHTML = `
        <div class="em-box-title" style="font-family:var(--font-head); color:var(--accent-purple); margin-bottom:10px;">
          <i class="fa-solid fa-spider"></i> Skill Radar Matrix
        </div>
        <canvas id="skillRadarCanvas" height="210"></canvas>
      `;
      analysisPane.appendChild(radarBox);

      const aiBox = document.createElement('div');
      aiBox.className = 'em-section-box';
      aiBox.style.marginTop = '15px';
      aiBox.innerHTML = `
        <div class="em-box-title" style="font-family:var(--font-head); color:var(--accent-cyan); margin-bottom:8px;">
          <i class="fa-solid fa-robot"></i> AI Diagnostic Report
        </div>
        <div id="em-ai-report-text"></div>
      `;
      analysisPane.appendChild(aiBox);
    }
  }

  function _bindDOMEvents() {
    const openBtn = document.querySelector('.ew2-open-btn');
    if (openBtn) openBtn.onclick = openSystemPopup;

    const closeBtn = document.querySelector('#ultimateSystemModal .auth-close');
    if (closeBtn) closeBtn.onclick = closeEngineModal;
  }

  // ─── 12. REALTIME SUBSCRIPTION ─────────────────────────────────────────────
  function _initRealtimeSubscription() {
    if (!state.db || !state.user?.email) return;
    try {
      state.realtimeChannel = state.db
        .channel('engine-sync-feed')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'player_engine', filter: `email=eq.${state.user.email}` }, (payload) => {
          if (payload.new) {
            const oldTier = state.engineData?.rank_tier;
            state.engineData = payload.new;
            _updateEngineWidget(payload.new);
            _updateModalHeader(payload.new);
            if (oldTier && oldTier !== payload.new.rank_tier) {
              triggerRankUpCeremony(payload.new.rank_tier);
            }
          }
        })
        .subscribe();
    } catch(e) {}
  }

  // ─── 13. UTILITY HELPERS ───────────────────────────────────────────────────
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
    claimTask,
    claimHiddenQuest,
    selectRole,
    setPlayerDNA,
    buildDreamTeam,
    inviteSquadmate,
    submitMatchToVisionAI,
    handleScreenshotUpload,
    startVisionScreenCapture,
    activateSharinganMode,
    strikeBossRaid,
    simulateRankUp,
    triggerRankUpCeremony,
    refillEnergy,
    awardStreakXP,
    setGraphicTier,
    loadEngineData,
    get state() { return state; }
  };

})();

window.TournyxEngine = TournyxEngine;
window.TournyxEngineAPI = TournyxEngine;

// ─── FLUTTER APP HYBRID BRIDGE ───
window.TournyxFlutterBridge = {
  syncUserData: (jsonStr) => {
    try {
      localStorage.setItem('tournyx_user', jsonStr);
      TournyxEngine.loadEngineData();
    } catch(e) {}
  },
  triggerNativeCapture: () => {
    TournyxEngine.startVisionScreenCapture();
  }
};

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
