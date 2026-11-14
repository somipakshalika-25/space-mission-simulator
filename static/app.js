/**
 * Space Mission Simulator - Complete Application Logic & Interactive State Machine
 */
class SpaceMissionSimulator {
  constructor() {
    this.currentView = 'home';
    this.catalog = window.SPACE_CATALOG;
    
    // Player Profile State (stored in localStorage)
    this.player = this.loadPlayer();
    
    // Active Mission Working Configuration
    this.activeMission = this.catalog.missions[1]; // default: Mars Exploration
    this.selectedLauncher = this.catalog.launchVehicles[0]; // default: Atlas Falcon 9H
    this.spacecraft = {
      body: this.catalog.components.bodies[1], // Standard Deep Space Bus
      solarPanel: this.catalog.components.solarPanels[1], // Deployable Wings
      battery: this.catalog.components.batteries[1], // Solid-state
      antenna: this.catalog.components.communication[1], // High-gain dish
      propulsion: this.catalog.components.propulsion[1], // Bipropellant
      fuelTank: this.catalog.components.fuelTanks[1], // COPV 900kg
      fuelKg: 750,
      instruments: [this.catalog.components.scientificInstruments[0], this.catalog.components.scientificInstruments[2]],
      thermal: this.catalog.components.thermalProtection[1],
      navigation: this.catalog.components.navigation[1]
    };

    // Mission Planning Configuration
    this.plan = {
      trajectory: 'direct', // 'direct', 'gravity_assist', 'hohmann_efficient'
      durationDays: this.activeMission.durationDays,
      commSchedule: 'continuous', // 'continuous', 'scheduled_passes', 'burst_relay'
      scienceTargetFocus: 'balanced' // 'surface', 'atmosphere', 'balanced'
    };

    // Live Simulation Runtime
    this.simulation = {
      active: false,
      phase: 'COUNTDOWN', // 'COUNTDOWN', 'LAUNCH', 'STAGING', 'TRANSIT', 'APPROACH', 'INSERTION', 'SURFACE_OPS', 'COMPLETED', 'ABORTED'
      timer: null,
      countdownSec: 10,
      missionElapsedDays: 0,
      distanceCoveredKm: 0,
      remainingFuelKg: 0,
      currentPowerW: 0,
      batteryLevelPct: 100,
      hullIntegrityPct: 100,
      signalLatencySec: 0,
      signalStrengthPct: 100,
      telemetryLogs: [],
      currentEvent: null,
      eventLog: [],
      scienceCollected: 0,
      successRate: 100,
      eventsTriggeredCount: 0
    };

    // Starfield animation
    this.initStarfield();

    // Initial render
    this.updateHeaderProfile();
    this.navigate('home');
  }

  loadPlayer() {
    const saved = localStorage.getItem('sms_player');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      callsign: "Commander " + ["Shepard", "Armstrong", "Vanguard", "Tereshkova", "Collins"][Math.floor(Math.random() * 5)],
      xp: 250,
      level: 1,
      rank: "Flight Director Trainee",
      badges: ["Academy Certified"],
      history: []
    };
  }

  savePlayer() {
    localStorage.setItem('sms_player', JSON.stringify(this.player));
    this.updateHeaderProfile();
  }

  updateHeaderProfile() {
    const elCallsign = document.getElementById('header-callsign');
    const elXp = document.getElementById('player-xp-display');
    if (elCallsign) elCallsign.innerText = this.player.callsign.toUpperCase();
    if (elXp) elXp.innerText = `${this.player.xp} XP (LVL ${this.calculateLevel()})`;
  }

  calculateLevel() {
    return Math.floor(this.player.xp / 500) + 1;
  }

  // --- Dynamic Starfield Background ---
  initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const stars = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.25 + 0.05
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let s of stars) {
        s.y -= s.speed;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${s.alpha})`;
        ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = "#38bdf8";
        ctx.fill();
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  // --- Router & Navigation ---
  navigate(viewName) {
    this.currentView = viewName;
    const container = document.getElementById('app-container');
    if (!container) return;

    // Update active nav buttons
    document.querySelectorAll('nav button').forEach(b => {
      b.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/30');
      b.classList.add('text-slate-300');
    });
    const activeBtn = document.getElementById(`nav-btn-${viewName}`);
    if (activeBtn) {
      activeBtn.classList.remove('text-slate-300');
      activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/30');
    }

    switch (viewName) {
      case 'home':
        container.innerHTML = this.renderHomeView();
        break;
      case 'missions':
        container.innerHTML = this.renderMissionsView();
        break;
      case 'design':
        container.innerHTML = this.renderDesignView();
        this.renderSpacecraftCanvas();
        break;
      case 'launcher':
        container.innerHTML = this.renderLauncherView();
        break;
      case 'planning':
        container.innerHTML = this.renderPlanningView();
        this.renderOrbitCanvas();
        break;
      case 'simulation':
        container.innerHTML = this.renderSimulationView();
        this.renderTelemetryHUD();
        break;
      case 'results':
        container.innerHTML = this.renderResultsView();
        break;
      case 'academy':
        container.innerHTML = this.renderAcademyView();
        if (window.renderMathInElement) {
          window.renderMathInElement(container, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false}
            ]
          });
        }
        break;
      case 'leaderboard':
        container.innerHTML = this.renderLeaderboardView();
        this.fetchLeaderboardData();
        break;
      default:
        container.innerHTML = this.renderHomeView();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // VIEW 1: HOME PAGE
  // ==========================================
  renderHomeView() {
    return `
      <div class="flex flex-col items-center justify-center py-8 md:py-16 text-center space-y-8 animate-fadeIn">
        <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-900/40 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
          <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i>
          <span>Next-Generation Aerospace Simulator</span>
        </div>

        <div class="space-y-4 max-w-4xl">
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            SPACE MISSION <br />
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 glow-text-cyan">
              SIMULATOR
            </span>
          </h1>
          <p class="text-xl md:text-2xl font-light text-slate-300 tracking-wide">
            Design. Launch. Explore. Master the Cosmos.
          </p>
          <p class="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Take the helm as Space Mission Director. Balance real-world delta-v budgets, electrical bus wattage, solar inverse-square laws, and deep-space telemetry to command historic interplanetary journeys.
          </p>
        </div>

        <!-- Call to Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button onclick="app.navigate('missions')" class="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 flex items-center space-x-3 text-base">
            <i data-lucide="play" class="w-5 h-5 fill-current"></i>
            <span>START MISSION</span>
          </button>
          
          <button onclick="app.openHowToPlayModal()" class="px-6 py-3.5 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center space-x-2 text-base">
            <i data-lucide="help-circle" class="w-5 h-5 text-cyan-400"></i>
            <span>HOW TO PLAY</span>
          </button>

          <button onclick="app.navigate('leaderboard')" class="px-6 py-3.5 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-slate-800/60 border border-slate-700 hover:border-purple-500/50 transition-all flex items-center space-x-2 text-base">
            <i data-lucide="trophy" class="w-5 h-5 text-amber-400"></i>
            <span>LEADERBOARD</span>
          </button>
        </div>

        <!-- Featured Highlights Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 text-left">
          <div class="glass-panel p-6 rounded-2xl border border-blue-900/40 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
              <i data-lucide="cpu" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Spacecraft Engineering</h3>
            <p class="text-sm text-slate-400">
              Select carbon composite hulls, solar wings or nuclear RTGs, propellant tanks, and scientific sensors while balancing mass vs. budget.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-blue-900/40 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400">
              <i data-lucide="orbit" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Orbital Trajectories</h3>
            <p class="text-sm text-slate-400">
              Compute Hohmann transfer orbits, escape velocities, and gravity-assist flybys across Earth, Lunar, Mars, and Deep Space domains.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl border border-blue-900/40 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
              <i data-lucide="radio" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-white mb-2">Live Mission Control</h3>
            <p class="text-sm text-slate-400">
              Experience dynamic flight countdowns, atmospheric staging, solar coronal mass ejections, and real-time contingency crisis decisions.
            </p>
          </div>
        </div>

        <!-- About The Project -->
        <div class="glass-panel p-8 rounded-2xl border border-blue-900/30 max-w-4xl text-left mt-8">
          <div class="flex items-center space-x-3 mb-4">
            <i data-lucide="compass" class="w-6 h-6 text-cyan-400"></i>
            <h2 class="text-xl font-bold text-white">About the Project</h2>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed mb-4">
            <strong>Space Mission Simulator</strong> is a physics-inspired aerospace education platform designed to immerse students and enthusiasts in real-world space engineering trade-offs. Rather than arbitrary fantasy values, our game mechanics employ real orbital principles: Tsiolkovsky delta-v expenditure, inverse-square solar radiance curves, telecommunication speed-of-light propagation delays, and power-consumption matrices.
          </p>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-cyan-800">Tsiolkovsky Rocket Equation</span>
            <span class="px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">Solar Inverse-Square Law</span>
            <span class="px-3 py-1 rounded-full bg-blue-950 text-purple-300 border border-purple-800">Hohmann Transfer Orbits</span>
            <span class="px-3 py-1 rounded-full bg-blue-950 text-emerald-300 border border-emerald-800">Friis Path Loss Telemetry</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 2: MISSION SELECTION
  // ==========================================
  renderMissionsView() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">STAGE 1: DESTINATION DIRECTIVE</div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Select Mission Profile</h2>
            <p class="text-sm text-slate-400">Choose your target exploration assignment. Requirements and environmental challenges vary widely.</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-400">Current Directive:</span>
            <span class="text-sm font-bold text-cyan-400">${this.activeMission.name}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this.catalog.missions.map(m => {
            const isSelected = m.id === this.activeMission.id;
            let badgeColor = "bg-blue-900/60 text-blue-300 border-blue-700";
            if (m.difficulty === "Beginner") badgeColor = "bg-emerald-900/60 text-emerald-300 border-emerald-700";
            if (m.difficulty === "Advanced") badgeColor = "bg-amber-900/60 text-amber-300 border-amber-700";
            if (m.difficulty === "Expert") badgeColor = "bg-rose-900/60 text-rose-300 border-rose-700";

            return `
              <div class="glass-panel p-6 rounded-2xl border ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-900/40' : 'border-blue-900/40 hover:border-blue-600/60'} transition-all flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded ${badgeColor} border uppercase tracking-wider">
                      ${m.difficulty}
                    </span>
                    <span class="text-xs font-mono text-slate-400 font-semibold">${m.code}</span>
                  </div>

                  <h3 class="text-xl font-bold text-white mb-1">${m.name}</h3>
                  <div class="text-xs text-cyan-400 font-medium mb-3 flex items-center space-x-1">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                    <span>${m.destination} (${m.distanceKm.toLocaleString()} km)</span>
                  </div>
                  <p class="text-xs text-slate-300 leading-relaxed mb-4">${m.tagline}</p>

                  <div class="grid grid-cols-2 gap-2 text-xs bg-spaceDark/60 p-3 rounded-xl border border-blue-950 mb-4 font-mono">
                    <div>
                      <span class="text-slate-500 block">BUDGET CAP</span>
                      <span class="text-white font-bold">$${m.budgetMillions}M</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block">MAX PAYLOAD</span>
                      <span class="text-white font-bold">${m.maxPayloadKg} kg</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block">REQ DELTA-V</span>
                      <span class="text-cyan-400 font-bold">${m.deltaVRequired} m/s</span>
                    </div>
                    <div>
                      <span class="text-slate-500 block">COMM DELAY</span>
                      <span class="text-purple-300 font-bold">${m.environment.commDelaySec}s</span>
                    </div>
                  </div>

                  <div class="text-[11px] text-slate-400 mb-4">
                    <span class="font-semibold text-slate-300">Objectives:</span>
                    <ul class="list-disc list-inside space-y-0.5 mt-1 text-slate-400">
                      ${m.objectives.slice(0, 2).map(o => `<li>${o.text}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <div class="pt-2">
                  ${isSelected ? `
                    <button onclick="app.navigate('design')" class="w-full py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-700/40 text-sm">
                      <span>CONFIGURE SPACECRAFT</span>
                      <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                  ` : `
                    <button onclick="app.selectMission('${m.id}')" class="w-full py-2.5 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-blue-600/20 border border-blue-800 text-sm transition-all flex items-center justify-center space-x-2">
                      <span>SELECT DIRECTIVE</span>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  selectMission(missionId) {
    const found = this.catalog.missions.find(m => m.id === missionId);
    if (found) {
      this.activeMission = found;
      this.plan.durationDays = found.durationDays;
      this.navigate('missions');
    }
  }

  // ==========================================
  // VIEW 3: SPACECRAFT DESIGN & BUILDER MODULE
  // ==========================================
  renderDesignView() {
    const stats = this.computeSpacecraftStats();
    const isBudgetOk = stats.totalCost <= this.activeMission.budgetMillions;
    const isMassOk = stats.totalMass <= this.activeMission.maxPayloadKg;
    const isPowerOk = stats.netPowerW >= 0;

    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">STAGE 2: HARDWARE INTEGRATION</div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Spacecraft Customization Module</h2>
            <p class="text-sm text-slate-400">Design your probe for <strong>${this.activeMission.name}</strong>. Ensure power generation, mass limits, and science payload targets are satisfied.</p>
          </div>
          <button onclick="app.navigate('launcher')" class="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-600/30 flex items-center space-x-2 text-sm self-start md:self-auto">
            <span>PROCEED TO BOOSTER</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Real-Time Resource Dashboard -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <!-- Budget Card -->
          <div class="glass-panel p-3.5 rounded-xl border ${isBudgetOk ? 'border-blue-900/50' : 'border-rose-500 ring-1 ring-rose-500/50'}">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>BUDGET</span>
              <span class="${isBudgetOk ? 'text-emerald-400' : 'text-rose-400 font-bold'}">$${stats.totalCost.toFixed(1)}M / $${this.activeMission.budgetMillions}M</span>
            </div>
            <div class="text-lg font-bold text-white mt-1">$${(this.activeMission.budgetMillions - stats.totalCost).toFixed(1)}M <span class="text-xs font-normal text-slate-400">left</span></div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full rounded-full ${isBudgetOk ? 'bg-cyan-500' : 'bg-rose-500'}" style="width: ${Math.min(100, (stats.totalCost / this.activeMission.budgetMillions) * 100)}%"></div>
            </div>
          </div>

          <!-- Mass Card -->
          <div class="glass-panel p-3.5 rounded-xl border ${isMassOk ? 'border-blue-900/50' : 'border-rose-500 ring-1 ring-rose-500/50'}">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>DRY + FUEL MASS</span>
              <span class="${isMassOk ? 'text-emerald-400' : 'text-rose-400 font-bold'}">${stats.totalMass.toFixed(0)} / ${this.activeMission.maxPayloadKg} kg</span>
            </div>
            <div class="text-lg font-bold text-white mt-1">${stats.totalMass.toFixed(0)} kg</div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full rounded-full ${isMassOk ? 'bg-blue-500' : 'bg-rose-500'}" style="width: ${Math.min(100, (stats.totalMass / this.activeMission.maxPayloadKg) * 100)}%"></div>
            </div>
          </div>

          <!-- Power Balance Card -->
          <div class="glass-panel p-3.5 rounded-xl border ${isPowerOk ? 'border-blue-900/50' : 'border-amber-500 ring-1 ring-amber-500/50'}">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>ELECTRICAL POWER</span>
              <span class="${isPowerOk ? 'text-emerald-400' : 'text-amber-400'}">${stats.netPowerW >= 0 ? '+' : ''}${stats.netPowerW.toFixed(0)}W Net</span>
            </div>
            <div class="text-lg font-bold text-white mt-1">${stats.powerGenW.toFixed(0)}W <span class="text-xs font-normal text-slate-400">/ -${stats.powerDrawW.toFixed(0)}W</span></div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full rounded-full ${isPowerOk ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${Math.min(100, (stats.powerGenW / Math.max(1, stats.powerDrawW)) * 50)}%"></div>
            </div>
          </div>

          <!-- Delta-V Card -->
          <div class="glass-panel p-3.5 rounded-xl border border-blue-900/50">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>DELTA-V POTENTIAL</span>
              <span class="${stats.deltaV >= this.activeMission.deltaVRequired ? 'text-emerald-400' : 'text-amber-400'}">${stats.deltaV.toFixed(0)} / ${this.activeMission.deltaVRequired} m/s</span>
            </div>
            <div class="text-lg font-bold text-cyan-400 mt-1">${stats.deltaV.toFixed(0)} m/s</div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-cyan-400 rounded-full" style="width: ${Math.min(100, (stats.deltaV / this.activeMission.deltaVRequired) * 100)}%"></div>
            </div>
          </div>

          <!-- Comm Range Card -->
          <div class="glass-panel p-3.5 rounded-xl border border-blue-900/50">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>COMM REACH</span>
              <span class="${stats.commRangeKm >= this.activeMission.distanceKm ? 'text-emerald-400' : 'text-rose-400'}">
                ${stats.commRangeKm >= this.activeMission.distanceKm ? 'LINKED' : 'OUT OF RANGE'}
              </span>
            </div>
            <div class="text-lg font-bold text-purple-400 mt-1">${(stats.commRangeKm / 1000000).toFixed(0)}M km</div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full bg-purple-400 rounded-full" style="width: ${Math.min(100, (stats.commRangeKm / this.activeMission.distanceKm) * 100)}%"></div>
            </div>
          </div>

          <!-- Mission Readiness Card -->
          <div class="glass-panel p-3.5 rounded-xl border border-blue-900/50">
            <div class="text-[11px] text-slate-400 flex items-center justify-between">
              <span>READINESS SCORE</span>
              <span class="text-cyan-400">${stats.readinessScore}%</span>
            </div>
            <div class="text-lg font-bold ${stats.readinessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'} mt-1">${stats.readinessScore}%</div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div class="h-full rounded-full ${stats.readinessScore >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}" style="width: ${stats.readinessScore}%"></div>
            </div>
          </div>
        </div>

        <!-- Warning Banners if violations exist -->
        ${!isBudgetOk ? `
          <div class="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400 flex-shrink-0"></i>
            <span><strong>BUDGET OVERRUN:</strong> You are exceeding the allocated mission cost by $${(stats.totalCost - this.activeMission.budgetMillions).toFixed(1)}M. Downscale components or select lighter subsystems.</span>
          </div>
        ` : ''}
        ${!isMassOk ? `
          <div class="p-3 bg-rose-950/80 border border-rose-500 rounded-xl text-rose-200 text-xs flex items-center space-x-2">
            <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400 flex-shrink-0"></i>
            <span><strong>EXCEEDED PAYLOAD CAP:</strong> Total spacecraft mass exceeds the maximum limit by ${(stats.totalMass - this.activeMission.maxPayloadKg).toFixed(0)} kg.</span>
          </div>
        ` : ''}

        <!-- Workspace: Interactive Blueprint Canvas & Component Selectors -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- 3D/2D Schematic Visualizer Canvas (5 cols) -->
          <div class="lg:col-span-5 glass-panel rounded-2xl p-5 border border-blue-900/50 flex flex-col items-center justify-between relative overflow-hidden">
            <div class="w-full flex items-center justify-between text-xs text-slate-400 border-b border-blue-900/30 pb-3">
              <div class="flex items-center space-x-2">
                <i data-lucide="layers" class="w-4 h-4 text-cyan-400"></i>
                <span class="font-bold text-slate-200 uppercase tracking-wider">Schematic Preview</span>
              </div>
              <span class="font-mono text-cyan-400 text-[11px]">${this.spacecraft.body.name}</span>
            </div>

            <!-- Dynamic SVG Graphic Canvas of Spacecraft Blueprint -->
            <div class="w-full my-6 flex items-center justify-center min-h-[300px]">
              <svg id="spacecraft-svg" class="w-full max-w-[340px] h-[300px] drop-shadow-2xl" viewBox="0 0 400 400">
                <!-- Rendered dynamically via renderSpacecraftCanvas() -->
              </svg>
            </div>

            <!-- Specifications Quick Table -->
            <div class="w-full bg-spaceDark/70 p-3.5 rounded-xl border border-blue-900/40 text-xs space-y-1.5 font-mono">
              <div class="flex justify-between text-slate-400">
                <span>Science Instruments:</span>
                <span class="text-white font-bold">${this.spacecraft.instruments.length} active (${stats.sciencePoints} pts)</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Specific Impulse ($I_{sp}$):</span>
                <span class="text-cyan-400 font-bold">${this.spacecraft.propulsion.isp} s</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Fuel Load / Tank Max:</span>
                <span class="text-white font-bold">${this.spacecraft.fuelKg} kg / ${this.spacecraft.fuelTank.maxCapacityKg} kg</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Thermal Heat Rejection:</span>
                <span class="text-emerald-400 font-bold">${this.spacecraft.thermal.heatRejectionCapacity}% efficiency</span>
              </div>
            </div>
          </div>

          <!-- Component Selection Accordion / Modules (7 cols) -->
          <div class="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-1">
            <!-- 1. Spacecraft Body -->
            ${this.renderComponentCategoryPicker("Spacecraft Body", "bodies", "body", "shield")}

            <!-- 2. Solar Panels & Power -->
            ${this.renderComponentCategoryPicker("Solar / Power System", "solarPanels", "solarPanel", "sun")}

            <!-- 3. Battery System -->
            ${this.renderComponentCategoryPicker("Battery Storage", "batteries", "battery", "battery-charging")}

            <!-- 4. Communication Antenna -->
            ${this.renderComponentCategoryPicker("Communication Antenna", "communication", "antenna", "radio")}

            <!-- 5. Propulsion System -->
            ${this.renderComponentCategoryPicker("Propulsion Engine", "propulsion", "propulsion", "flame")}

            <!-- 6. Fuel Tank & Slider -->
            <div class="glass-panel p-4 rounded-xl border border-blue-900/40 space-y-3">
              <div class="flex items-center justify-between text-sm font-bold text-white">
                <div class="flex items-center space-x-2">
                  <i data-lucide="cylinder" class="w-4 h-4 text-cyan-400"></i>
                  <span>Fuel Tank & Propellant Load</span>
                </div>
                <span class="text-xs font-mono text-cyan-400">${this.spacecraft.fuelTank.name}</span>
              </div>
              
              <div class="grid grid-cols-3 gap-2">
                ${this.catalog.components.fuelTanks.map(t => `
                  <button onclick="app.setComponent('fuelTank', '${t.id}')" class="p-2.5 rounded-lg border text-left text-xs transition-all ${this.spacecraft.fuelTank.id === t.id ? 'bg-cyan-950/60 border-cyan-400 text-white' : 'glass-panel border-blue-900/40 text-slate-300 hover:border-slate-600'}">
                    <div class="font-bold truncate">${t.name.split('(')[0]}</div>
                    <div class="text-[10px] text-slate-400 mt-1">${t.maxCapacityKg}kg cap | $${t.costMillions}M</div>
                  </button>
                `).join('')}
              </div>

              <!-- Fuel quantity slider -->
              <div class="pt-2">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Propellant Load:</span>
                  <span class="text-cyan-400 font-bold font-mono">${this.spacecraft.fuelKg} kg (${((this.spacecraft.fuelKg / this.spacecraft.fuelTank.maxCapacityKg) * 100).toFixed(0)}% full)</span>
                </div>
                <input type="range" min="50" max="${this.spacecraft.fuelTank.maxCapacityKg}" step="10" value="${this.spacecraft.fuelKg}" oninput="app.setFuelAmount(this.value)" class="w-full accent-cyan-400 cursor-pointer" />
              </div>
            </div>

            <!-- 7. Scientific Instruments (Multi-select) -->
            <div class="glass-panel p-4 rounded-xl border border-blue-900/40 space-y-3">
              <div class="flex items-center justify-between text-sm font-bold text-white">
                <div class="flex items-center space-x-2">
                  <i data-lucide="microscope" class="w-4 h-4 text-purple-400"></i>
                  <span>Scientific Instruments (Equip up to 3)</span>
                </div>
                <span class="text-xs font-mono text-purple-400">${this.spacecraft.instruments.length} / 3 Equipped</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                ${this.catalog.components.scientificInstruments.map(inst => {
                  const isEquipped = this.spacecraft.instruments.some(i => i.id === inst.id);
                  return `
                    <div onclick="app.toggleInstrument('${inst.id}')" class="p-3 rounded-lg border cursor-pointer transition-all ${isEquipped ? 'bg-purple-950/40 border-purple-400 ring-1 ring-purple-400/40' : 'glass-panel border-blue-900/30 hover:border-slate-600'}">
                      <div class="flex items-center justify-between text-xs font-bold text-white mb-1">
                        <span>${inst.name}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded ${isEquipped ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}">${isEquipped ? 'EQUIPPED' : 'ADD'}</span>
                      </div>
                      <p class="text-[11px] text-slate-400 leading-tight mb-2">${inst.description}</p>
                      <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                        <span>${inst.massKg}kg | $${inst.costMillions}M</span>
                        <span class="text-purple-300 font-bold">+${inst.sciencePoints} Science Pts</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 8. Thermal & Navigation -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Thermal -->
              <div class="glass-panel p-4 rounded-xl border border-blue-900/40 space-y-2">
                <div class="flex items-center space-x-2 text-sm font-bold text-white">
                  <i data-lucide="thermometer" class="w-4 h-4 text-rose-400"></i>
                  <span>Thermal Protection</span>
                </div>
                ${this.catalog.components.thermalProtection.map(tp => `
                  <button onclick="app.setComponent('thermal', '${tp.id}')" class="w-full p-2.5 rounded-lg border text-left text-xs transition-all ${this.spacecraft.thermal.id === tp.id ? 'bg-cyan-950/60 border-cyan-400 text-white' : 'glass-panel border-blue-900/40 text-slate-300 hover:border-slate-600'}">
                    <div class="font-bold">${tp.name}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${tp.massKg}kg • $${tp.costMillions}M • ${tp.heatRejectionCapacity}% heat shield</div>
                  </button>
                `).join('')}
              </div>

              <!-- Navigation -->
              <div class="glass-panel p-4 rounded-xl border border-blue-900/40 space-y-2">
                <div class="flex items-center space-x-2 text-sm font-bold text-white">
                  <i data-lucide="compass" class="w-4 h-4 text-emerald-400"></i>
                  <span>Navigation System</span>
                </div>
                ${this.catalog.components.navigation.map(nav => `
                  <button onclick="app.setComponent('navigation', '${nav.id}')" class="w-full p-2.5 rounded-lg border text-left text-xs transition-all ${this.spacecraft.navigation.id === nav.id ? 'bg-cyan-950/60 border-cyan-400 text-white' : 'glass-panel border-blue-900/40 text-slate-300 hover:border-slate-600'}">
                    <div class="font-bold">${nav.name}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${nav.massKg}kg • $${nav.costMillions}M • ±${nav.accuracyDeg}° precision</div>
                  </button>
                `).join('')}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  renderComponentCategoryPicker(title, categoryKey, slotKey, icon) {
    const list = this.catalog.components[categoryKey];
    const current = this.spacecraft[slotKey];
    return `
      <div class="glass-panel p-4 rounded-xl border border-blue-900/40 space-y-3">
        <div class="flex items-center justify-between text-sm font-bold text-white">
          <div class="flex items-center space-x-2">
            <i data-lucide="${icon}" class="w-4 h-4 text-cyan-400"></i>
            <span>${title}</span>
          </div>
          <span class="text-xs font-mono text-cyan-400">${current.name}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          ${list.map(item => {
            const isSelected = item.id === current.id;
            return `
              <div onclick="app.setComponent('${slotKey}', '${item.id}')" class="p-3 rounded-lg border cursor-pointer text-xs transition-all ${isSelected ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50' : 'glass-panel border-blue-900/30 hover:border-slate-600'}">
                <div class="font-bold text-white mb-1 truncate">${item.name}</div>
                <div class="text-[10px] text-slate-400 space-y-0.5 font-mono mb-2">
                  <div>Mass: <span class="text-slate-200">${item.massKg} kg</span></div>
                  <div>Cost: <span class="text-emerald-400">$${item.costMillions}M</span></div>
                  ${item.powerGenW ? `<div>Output: <span class="text-cyan-300">+${item.powerGenW}W</span></div>` : ''}
                  ${item.powerDrawW ? `<div>Draw: <span class="text-amber-300">-${item.powerDrawW}W</span></div>` : ''}
                </div>
                <p class="text-[11px] text-slate-400 leading-tight">${item.description.slice(0, 75)}...</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  setComponent(slotKey, itemId) {
    for (let cat in this.catalog.components) {
      const match = this.catalog.components[cat].find(c => c.id === itemId);
      if (match) {
        this.spacecraft[slotKey] = match;
        if (slotKey === 'fuelTank' && this.spacecraft.fuelKg > match.maxCapacityKg) {
          this.spacecraft.fuelKg = match.maxCapacityKg;
        }
        break;
      }
    }
    this.navigate('design');
  }

  setFuelAmount(kg) {
    this.spacecraft.fuelKg = parseFloat(kg);
    const stats = this.computeSpacecraftStats();
    // Update labels directly or re-render
    this.navigate('design');
  }

  toggleInstrument(instId) {
    const existsIndex = this.spacecraft.instruments.findIndex(i => i.id === instId);
    if (existsIndex >= 0) {
      if (this.spacecraft.instruments.length > 1) {
        this.spacecraft.instruments.splice(existsIndex, 1);
      } else {
        alert("At least one scientific instrument is required for mission data return.");
      }
    } else {
      if (this.spacecraft.instruments.length >= 3) {
        alert("Maximum 3 instruments allowed on this bus framework.");
        return;
      }
      const inst = this.catalog.components.scientificInstruments.find(i => i.id === instId);
      if (inst) this.spacecraft.instruments.push(inst);
    }
    this.navigate('design');
  }

  computeSpacecraftStats() {
    let dryMass = this.spacecraft.body.massKg +
      this.spacecraft.solarPanel.massKg +
      this.spacecraft.battery.massKg +
      this.spacecraft.antenna.massKg +
      this.spacecraft.propulsion.massKg +
      this.spacecraft.fuelTank.massKg +
      this.spacecraft.thermal.massKg +
      this.spacecraft.navigation.massKg;

    for (let inst of this.spacecraft.instruments) {
      dryMass += inst.massKg;
    }

    const totalMass = dryMass + this.spacecraft.fuelKg;

    let totalCost = this.spacecraft.body.costMillions +
      this.spacecraft.solarPanel.costMillions +
      this.spacecraft.battery.costMillions +
      this.spacecraft.antenna.costMillions +
      this.spacecraft.propulsion.costMillions +
      this.spacecraft.fuelTank.costMillions +
      this.spacecraft.thermal.costMillions +
      this.spacecraft.navigation.costMillions +
      (this.spacecraft.fuelKg * (this.spacecraft.propulsion.fuelCostPerKg || 0.02));

    for (let inst of this.spacecraft.instruments) {
      totalCost += inst.costMillions;
    }

    // Solar power calculation based on mission distance solar intensity
    let powerGenW = 0;
    if (this.spacecraft.solarPanel.isNuclear) {
      powerGenW = this.spacecraft.solarPanel.powerGenW;
    } else {
      powerGenW = this.spacecraft.solarPanel.powerGenW * this.activeMission.environment.solarIntensity;
    }

    let powerDrawW = this.spacecraft.body.powerDrawW +
      this.spacecraft.solarPanel.powerDrawW +
      this.spacecraft.battery.powerDrawW +
      this.spacecraft.antenna.powerDrawW +
      this.spacecraft.propulsion.powerDrawW +
      this.spacecraft.fuelTank.powerDrawW +
      this.spacecraft.thermal.powerDrawW +
      this.spacecraft.navigation.powerDrawW;

    for (let inst of this.spacecraft.instruments) {
      powerDrawW += inst.powerDrawW;
    }

    const netPowerW = powerGenW - powerDrawW;

    // Delta-V from Tsiolkovsky Rocket Equation
    // Delta-V = Isp * 9.80665 * ln(m0 / mf)
    const isp = this.spacecraft.propulsion.isp;
    const g0 = 9.80665;
    const m0 = totalMass; // wet mass
    const mf = dryMass; // dry mass
    const deltaV = m0 > mf ? isp * g0 * Math.log(m0 / mf) : 0;

    let sciencePoints = 0;
    for (let inst of this.spacecraft.instruments) {
      sciencePoints += inst.sciencePoints;
    }

    const commRangeKm = this.spacecraft.antenna.rangeKm;

    // Calculate readiness percentage
    let score = 100;
    if (totalCost > this.activeMission.budgetMillions) score -= 35;
    if (totalMass > this.activeMission.maxPayloadKg) score -= 40;
    if (netPowerW < 0) score -= 25;
    if (deltaV < this.activeMission.deltaVRequired) score -= 30;
    if (commRangeKm < this.activeMission.distanceKm) score -= 25;
    const readinessScore = Math.max(0, Math.min(100, score));

    return {
      dryMass,
      totalMass,
      totalCost,
      powerGenW,
      powerDrawW,
      netPowerW,
      deltaV,
      sciencePoints,
      commRangeKm,
      readinessScore
    };
  }

  renderSpacecraftCanvas() {
    const svg = document.getElementById('spacecraft-svg');
    if (!svg) return;

    const isFoldable = this.spacecraft.solarPanel.id.includes('foldable') || this.spacecraft.solarPanel.id.includes('rollout');
    const isNuclear = this.spacecraft.solarPanel.isNuclear;
    const isDish = this.spacecraft.antenna.id.includes('dish') || this.spacecraft.antenna.id.includes('optical');

    svg.innerHTML = `
      <defs>
        <!-- Gradients -->
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="50%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#172554" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Grid Guide Lines -->
      <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="4 4" />
      <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(139, 92, 246, 0.15)" stroke-dasharray="2 2" />

      <!-- Solar Wings (Left & Right) -->
      ${!isNuclear ? `
        <!-- Left Wing -->
        <g id="solar-left">
          <rect x="${isFoldable ? '30' : '70'}" y="170" width="${isFoldable ? '110' : '70'}" height="60" rx="3" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" />
          <line x1="${isFoldable ? '65' : '105'}" y1="170" x2="${isFoldable ? '65' : '105'}" y2="230" stroke="#00f0ff" stroke-width="0.75" />
          <line x1="${isFoldable ? '105' : '120'}" y1="170" x2="${isFoldable ? '105' : '120'}" y2="230" stroke="#00f0ff" stroke-width="0.75" />
          <!-- Boom connection -->
          <line x1="${isFoldable ? '140' : '140'}" y1="200" x2="160" y2="200" stroke="#94a3b8" stroke-width="4" />
        </g>
        <!-- Right Wing -->
        <g id="solar-right">
          <rect x="${isFoldable ? '260' : '260'}" y="170" width="${isFoldable ? '110' : '70'}" height="60" rx="3" fill="url(#panelGrad)" stroke="#38bdf8" stroke-width="1.5" />
          <line x1="${isFoldable ? '295' : '295'}" y1="170" x2="${isFoldable ? '295' : '295'}" y2="230" stroke="#00f0ff" stroke-width="0.75" />
          <line x1="${isFoldable ? '335' : '315'}" y1="170" x2="${isFoldable ? '335' : '315'}" y2="230" stroke="#00f0ff" stroke-width="0.75" />
          <!-- Boom connection -->
          <line x1="240" y1="200" x2="${isFoldable ? '260' : '260'}" y2="200" stroke="#94a3b8" stroke-width="4" />
        </g>
      ` : `
        <!-- Nuclear RTG Cask -->
        <g id="rtg-cask">
          <rect x="70" y="185" width="70" height="30" rx="4" fill="#334155" stroke="#f59e0b" stroke-width="2" />
          <line x1="140" y1="200" x2="160" y2="200" stroke="#94a3b8" stroke-width="5" />
          <circle cx="105" cy="200" r="8" fill="#f59e0b" opacity="0.8" filter="url(#glow)" />
          <text x="105" y="204" font-size="9" fill="#000" font-weight="bold" text-anchor="middle">☢ RTG</text>
        </g>
      `}

      <!-- Main Bus (Central Hexagon Chassis) -->
      <polygon points="200,130 240,165 240,235 200,270 160,235 160,165" fill="url(#bodyGrad)" stroke="#38bdf8" stroke-width="2.5" />
      <polygon points="200,145 228,172 228,228 200,255 172,228 172,172" fill="#0f172a" stroke="#1e293b" stroke-width="1" />

      <!-- Communication Antenna -->
      ${isDish ? `
        <g id="high-gain-dish">
          <path d="M 175 125 Q 200 100 225 125" fill="none" stroke="#e2e8f0" stroke-width="4" />
          <line x1="200" y1="112" x2="200" y2="90" stroke="#00f0ff" stroke-width="2" />
          <circle cx="200" cy="88" r="3" fill="#00f0ff" filter="url(#glow)" />
          <!-- Support strut -->
          <line x1="200" y1="125" x2="200" y2="135" stroke="#64748b" stroke-width="3" />
        </g>
      ` : `
        <g id="omni-antenna">
          <line x1="200" y1="135" x2="200" y2="105" stroke="#e2e8f0" stroke-width="3" />
          <circle cx="200" cy="103" r="4" fill="#38bdf8" />
        </g>
      `}

      <!-- Scientific Instruments Sensor Mast -->
      <line x1="160" y1="165" x2="130" y2="135" stroke="#a855f7" stroke-width="2.5" />
      <circle cx="128" cy="133" r="5" fill="#a855f7" filter="url(#glow)" />
      <text x="120" y="123" font-size="8" fill="#c084fc" font-family="monospace">PAYLOAD SENSORS</text>

      <!-- Star Tracker Optics -->
      <circle cx="200" cy="180" r="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
      <circle cx="200" cy="180" r="2" fill="#fff" />

      <!-- Fuel Tank Indicator Center -->
      <rect x="188" y="198" width="24" height="35" rx="5" fill="#0369a1" stroke="#38bdf8" stroke-width="1" />
      <text x="200" y="220" font-size="8" fill="#e0f2fe" text-anchor="middle" font-weight="bold">FUEL</text>

      <!-- Main Engine Propulsion Nozzle -->
      <polygon points="185,270 215,270 225,295 175,295" fill="#475569" stroke="#94a3b8" stroke-width="2" />
      
      <!-- Thrust Plume / Glow -->
      <polygon points="182,296 218,296 200,325" fill="rgba(56, 189, 248, 0.4)" filter="url(#glow)" />
      <polygon points="190,296 210,296 200,315" fill="#00f0ff" />
    `;
  }

  // ==========================================
  // VIEW 4: LAUNCH VEHICLE SELECTION
  // ==========================================
  renderLauncherView() {
    const stats = this.computeSpacecraftStats();

    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">STAGE 3: ORBITAL LIFTOFF VEHICLE</div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Select Launch Vehicle</h2>
            <p class="text-sm text-slate-400">Match your spacecraft mass (${stats.totalMass.toFixed(0)} kg) against booster payload capabilities.</p>
          </div>
          <button onclick="app.navigate('planning')" class="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-600/30 flex items-center space-x-2 text-sm self-start md:self-auto">
            <span>PROCEED TO FLIGHT PLAN</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${this.catalog.launchVehicles.map(lv => {
            const isSelected = lv.id === this.selectedLauncher.id;
            const canLift = lv.payloadCapacityKg >= stats.totalMass;
            const isAffordable = (stats.totalCost + lv.costMillions) <= this.activeMission.budgetMillions;

            return `
              <div class="glass-panel p-5 rounded-2xl border ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-blue-900/40 hover:border-blue-600/50'} flex flex-col justify-between transition-all">
                <div>
                  <!-- Rocket Silhouette Graphic -->
                  <div class="w-full h-36 bg-spaceDark/80 rounded-xl mb-4 flex items-center justify-center border border-blue-950 relative overflow-hidden">
                    <div class="text-cyan-500/20 absolute -right-4 -bottom-4">
                      <i data-lucide="rocket" class="w-32 h-32"></i>
                    </div>
                    <div class="z-10 text-center">
                      <i data-lucide="rocket" class="w-12 h-12 text-cyan-400 mx-auto mb-1"></i>
                      <span class="text-xs font-mono text-slate-400 font-bold">${lv.provider}</span>
                    </div>
                  </div>

                  <h3 class="text-lg font-bold text-white mb-1">${lv.name}</h3>
                  <div class="text-xs text-slate-400 mb-3">${lv.engineType}</div>

                  <div class="space-y-2 text-xs font-mono bg-spaceDark/60 p-3 rounded-xl border border-blue-950 mb-4">
                    <div class="flex justify-between">
                      <span class="text-slate-400">PAYLOAD CAPACITY:</span>
                      <span class="${canLift ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}">${lv.payloadCapacityKg} kg</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">LAUNCH SERVICE COST:</span>
                      <span class="text-white font-bold">$${lv.costMillions}M</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">RELIABILITY RATING:</span>
                      <span class="text-cyan-400 font-bold">${lv.reliability}%</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">TOTAL SEA-LEVEL THRUST:</span>
                      <span class="text-purple-300 font-bold">${(lv.thrustKN / 1000).toFixed(1)} MN</span>
                    </div>
                  </div>

                  <p class="text-xs text-slate-400 leading-relaxed mb-4">${lv.description}</p>
                </div>

                <div>
                  ${!canLift ? `
                    <div class="text-[11px] text-rose-400 font-semibold mb-2 flex items-center space-x-1">
                      <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>
                      <span>Exceeds lift limit (+${(stats.totalMass - lv.payloadCapacityKg).toFixed(0)} kg)</span>
                    </div>
                  ` : ''}

                  <button onclick="app.selectLauncher('${lv.id}')" class="w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${isSelected ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/40' : 'glass-panel border-blue-800 text-slate-200 hover:bg-blue-600/20'}">
                    <span>${isSelected ? 'BOOSTER ASSIGNED' : 'ASSIGN BOOSTER'}</span>
                    ${isSelected ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  selectLauncher(id) {
    const lv = this.catalog.launchVehicles.find(l => l.id === id);
    if (lv) {
      this.selectedLauncher = lv;
      this.navigate('launcher');
    }
  }

  // ==========================================
  // VIEW 5: MISSION PLANNING & ORBIT MAP
  // ==========================================
  renderPlanningView() {
    const stats = this.computeSpacecraftStats();

    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">STAGE 4: ASTRODYNAMICS FLIGHT PLAN</div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Interactive Mission Planning</h2>
            <p class="text-sm text-slate-400">Map transit trajectory, ground station telemetry windows, and science objectives prior to ignition.</p>
          </div>
          <button onclick="app.startCountdownSequence()" class="px-8 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/30 flex items-center space-x-2 text-base self-start md:self-auto">
            <i data-lucide="flame" class="w-5 h-5 text-amber-300"></i>
            <span>BEGIN COUNTDOWN</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Interactive Orbit Trajectory Canvas (7 cols) -->
          <div class="lg:col-span-7 glass-panel p-5 rounded-2xl border border-blue-900/50 flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-slate-400 border-b border-blue-900/30 pb-3 mb-2">
              <div class="flex items-center space-x-2">
                <i data-lucide="orbit" class="w-4 h-4 text-cyan-400"></i>
                <span class="font-bold text-slate-200 uppercase tracking-wider">Heliocentric Orbital Trajectory</span>
              </div>
              <span class="font-mono text-cyan-400">${this.activeMission.destination}</span>
            </div>

            <!-- Canvas for orbital map -->
            <div class="w-full flex items-center justify-center min-h-[360px]">
              <canvas id="orbit-canvas" width="550" height="360" class="w-full h-[360px]"></canvas>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-blue-900/30">
              <div class="flex items-center space-x-4">
                <span class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> <span>Earth</span></span>
                <span class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span> <span>Destination</span></span>
                <span class="flex items-center space-x-1.5"><span class="w-2.5 h-1 bg-amber-400"></span> <span>Transfer Orbit</span></span>
              </div>
              <span class="font-mono text-cyan-400 text-[11px]">Est. Transit: ${this.plan.durationDays} Days</span>
            </div>
          </div>

          <!-- Mission Parameters & Trajectory Tradeoffs (5 cols) -->
          <div class="lg:col-span-5 space-y-4">
            <!-- Trajectory Selection -->
            <div class="glass-panel p-5 rounded-2xl border border-blue-900/40 space-y-3">
              <div class="text-sm font-bold text-white flex items-center space-x-2">
                <i data-lucide="compass" class="w-4 h-4 text-cyan-400"></i>
                <span>Transfer Trajectory Mode</span>
              </div>
              
              <div class="space-y-2">
                <div onclick="app.setTrajectory('direct')" class="p-3 rounded-xl border cursor-pointer text-xs transition-all ${this.plan.trajectory === 'direct' ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/40' : 'glass-panel border-blue-900/30 hover:border-slate-600'}">
                  <div class="flex justify-between font-bold text-white mb-1">
                    <span>Direct Fast Transfer</span>
                    <span class="text-amber-400 font-mono">+25% Fuel Draw</span>
                  </div>
                  <p class="text-[11px] text-slate-400">High-thrust parabolic burn reduces transit time by 30% but expends maximum propellant reserves.</p>
                </div>

                <div onclick="app.setTrajectory('hohmann_efficient')" class="p-3 rounded-xl border cursor-pointer text-xs transition-all ${this.plan.trajectory === 'hohmann_efficient' ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/40' : 'glass-panel border-blue-900/30 hover:border-slate-600'}">
                  <div class="flex justify-between font-bold text-white mb-1">
                    <span>Hohmann Minimum Energy Ellipse</span>
                    <span class="text-emerald-400 font-mono">Optimal $\Delta v$</span>
                  </div>
                  <p class="text-[11px] text-slate-400">The classical two-impulse Keplerian Hohmann transfer orbit. Minimizes fuel consumption.</p>
                </div>

                <div onclick="app.setTrajectory('gravity_assist')" class="p-3 rounded-xl border cursor-pointer text-xs transition-all ${this.plan.trajectory === 'gravity_assist' ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/40' : 'glass-panel border-blue-900/30 hover:border-slate-600'}">
                  <div class="flex justify-between font-bold text-white mb-1">
                    <span>Planetary Gravity Assist (Slingshot)</span>
                    <span class="text-purple-400 font-mono">+Free Velocity</span>
                  </div>
                  <p class="text-[11px] text-slate-400">Swings through the gravitational sphere of influence of an inner body for bonus hyperbolic velocity.</p>
                </div>
              </div>
            </div>

            <!-- Telemetry & Ground Schedule -->
            <div class="glass-panel p-5 rounded-2xl border border-blue-900/40 space-y-3">
              <div class="text-sm font-bold text-white flex items-center space-x-2">
                <i data-lucide="radio" class="w-4 h-4 text-purple-400"></i>
                <span>Ground Station Telemetry Schedule</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="app.setCommSchedule('continuous')" class="p-2.5 rounded-lg border text-xs text-center transition-all ${this.plan.commSchedule === 'continuous' ? 'bg-purple-950/60 border-purple-400 text-white font-bold' : 'glass-panel border-blue-900/40 text-slate-300'}">
                  Continuous Link
                  <div class="text-[9px] text-slate-400 mt-1">High power draw</div>
                </button>
                <button onclick="app.setCommSchedule('scheduled_passes')" class="p-2.5 rounded-lg border text-xs text-center transition-all ${this.plan.commSchedule === 'scheduled_passes' ? 'bg-purple-950/60 border-purple-400 text-white font-bold' : 'glass-panel border-blue-900/40 text-slate-300'}">
                  Scheduled Passes
                  <div class="text-[9px] text-slate-400 mt-1">Balanced power</div>
                </button>
                <button onclick="app.setCommSchedule('burst_relay')" class="p-2.5 rounded-lg border text-xs text-center transition-all ${this.plan.commSchedule === 'burst_relay' ? 'bg-purple-950/60 border-purple-400 text-white font-bold' : 'glass-panel border-blue-900/40 text-slate-300'}">
                  Burst Relay
                  <div class="text-[9px] text-slate-400 mt-1">Power saver</div>
                </button>
              </div>
            </div>

            <!-- Objectives Checklist Summary -->
            <div class="glass-panel p-5 rounded-2xl border border-blue-900/40 space-y-2">
              <div class="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <i data-lucide="check-square" class="w-4 h-4 text-emerald-400"></i>
                <span>Flight Criteria & Goals</span>
              </div>
              <div class="space-y-1.5 text-xs">
                ${this.activeMission.objectives.map(o => `
                  <div class="flex items-center space-x-2 text-slate-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>${o.text} (${o.weight} pts)</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  setTrajectory(mode) {
    this.plan.trajectory = mode;
    if (mode === 'direct') this.plan.durationDays = Math.round(this.activeMission.durationDays * 0.7);
    else if (mode === 'hohmann_efficient') this.plan.durationDays = this.activeMission.durationDays;
    else if (mode === 'gravity_assist') this.plan.durationDays = Math.round(this.activeMission.durationDays * 1.25);
    this.navigate('planning');
  }

  setCommSchedule(mode) {
    this.plan.commSchedule = mode;
    this.navigate('planning');
  }

  renderOrbitCanvas() {
    const canvas = document.getElementById('orbit-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.35;
    const cy = h * 0.5;

    // Sun at center
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#fbbf24';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Earth Orbit
    const rEarth = 85;
    ctx.beginPath();
    ctx.arc(cx, cy, rEarth, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Earth
    const earthAngle = -Math.PI / 4;
    const ex = cx + rEarth * Math.cos(earthAngle);
    const ey = cy + rEarth * Math.sin(earthAngle);
    ctx.beginPath();
    ctx.arc(ex, ey, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Target Destination Orbit
    let rTarget = 150;
    let targetColor = '#f43f5e';
    if (this.activeMission.destination.includes('Moon')) {
      rTarget = 95;
      targetColor = '#cbd5e1';
    } else if (this.activeMission.destination.includes('Deep')) {
      rTarget = 210;
      targetColor = '#d97706';
    }

    ctx.beginPath();
    ctx.arc(cx, cy, rTarget, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target Planet
    const targetAngle = Math.PI / 3;
    const tx = cx + rTarget * Math.cos(targetAngle);
    const ty = cy + rTarget * Math.sin(targetAngle);
    ctx.beginPath();
    ctx.arc(tx, ty, 8, 0, Math.PI * 2);
    ctx.fillStyle = targetColor;
    ctx.shadowBlur = 12;
    ctx.shadowColor = targetColor;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Transfer Trajectory Curve (Hohmann or Direct)
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    if (this.plan.trajectory === 'direct') {
      ctx.quadraticCurveTo(cx + rEarth * 1.2, cy - 80, tx, ty);
    } else if (this.plan.trajectory === 'gravity_assist') {
      ctx.bezierCurveTo(cx + 60, cy + 120, cx + 180, cy + 80, tx, ty);
    } else {
      ctx.bezierCurveTo(cx - 30, cy - 140, cx + 160, cy - 60, tx, ty);
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText('Sun', cx - 10, cy + 32);
    ctx.fillText('Earth', ex + 10, ey + 4);
    ctx.fillText(this.activeMission.destination, tx + 12, ty + 4);
  }

  // ==========================================
  // VIEW 6 & 7: MISSION CONTROL & SIMULATION
  // ==========================================
  startCountdownSequence() {
    this.simulation.active = true;
    this.simulation.phase = 'COUNTDOWN';
    this.simulation.countdownSec = 5;
    this.simulation.missionElapsedDays = 0;
    this.simulation.distanceCoveredKm = 0;
    this.simulation.remainingFuelKg = this.spacecraft.fuelKg;
    this.simulation.batteryLevelPct = 100;
    this.simulation.hullIntegrityPct = 100;
    this.simulation.scienceCollected = 0;
    this.simulation.successRate = 100;
    this.simulation.telemetryLogs = [];
    this.simulation.currentEvent = null;
    this.simulation.eventLog = [];
    this.simulation.eventsTriggeredCount = 0;

    this.navigate('simulation');

    if (this.simulation.timer) clearInterval(this.simulation.timer);

    this.simulation.timer = setInterval(() => {
      this.simulationTick();
    }, 1000);
  }

  simulationTick() {
    if (!this.simulation.active) return;

    if (this.simulation.phase === 'COUNTDOWN') {
      this.simulation.countdownSec--;
      this.addTelemetryLog(`T-minus ${this.simulation.countdownSec}s: Pre-ignition checks nominal.`);
      if (this.simulation.countdownSec <= 0) {
        this.simulation.phase = 'LAUNCH';
        this.addTelemetryLog(`LIFTOFF! Booster main stage ignited at full throttle!`);
      }
      this.renderTelemetryHUD();
      return;
    }

    if (this.simulation.phase === 'LAUNCH') {
      this.simulation.distanceCoveredKm += Math.round(this.activeMission.distanceKm * 0.04);
      this.simulation.remainingFuelKg -= Math.round(this.spacecraft.fuelKg * 0.06);
      this.addTelemetryLog(`Max-Q exceeded. Booster staging separation successful.`);
      this.simulation.phase = 'TRANSIT';
      this.renderTelemetryHUD();
      return;
    }

    if (this.simulation.phase === 'TRANSIT') {
      // Advance mission transit
      const stepDays = Math.max(1, Math.round(this.plan.durationDays / 12));
      this.simulation.missionElapsedDays += stepDays;
      const progressFraction = Math.min(1, this.simulation.missionElapsedDays / this.plan.durationDays);
      this.simulation.distanceCoveredKm = Math.round(this.activeMission.distanceKm * progressFraction);
      
      // Fuel consumption
      this.simulation.remainingFuelKg = Math.max(0, this.simulation.remainingFuelKg - Math.round(this.spacecraft.fuelKg * 0.05));
      
      // Science collection
      const stats = this.computeSpacecraftStats();
      this.simulation.scienceCollected += Math.round(stats.sciencePoints * 0.12);

      // Check random emergency event if no event active and under 3 events
      if (!this.simulation.currentEvent && Math.random() < 0.45 && this.simulation.eventsTriggeredCount < 2) {
        this.triggerRandomMissionEvent();
      }

      this.addTelemetryLog(`Day ${this.simulation.missionElapsedDays}: Heliocentric distance ${this.simulation.distanceCoveredKm.toLocaleString()} km.`);

      if (progressFraction >= 0.9) {
        this.simulation.phase = 'INSERTION';
        this.addTelemetryLog(`Target sphere of influence entered. Beginning orbital insertion decelerating burn.`);
      }

      this.renderTelemetryHUD();
      return;
    }

    if (this.simulation.phase === 'INSERTION') {
      this.addTelemetryLog(`Orbital capture complete. Spacecraft telemetry confirmed.`);
      this.simulation.phase = 'SURFACE_OPS';
      this.renderTelemetryHUD();
      return;
    }

    if (this.simulation.phase === 'SURFACE_OPS') {
      this.addTelemetryLog(`Scientific objectives fully executed. High-gain data downlink complete.`);
      this.completeMission();
    }
  }

  addTelemetryLog(msg) {
    const time = new Date().toLocaleTimeString();
    this.simulation.telemetryLogs.unshift(`[${time}] ${msg}`);
    if (this.simulation.telemetryLogs.length > 20) {
      this.simulation.telemetryLogs.pop();
    }
  }

  triggerRandomMissionEvent() {
    this.simulation.eventsTriggeredCount++;
    const eventPool = [
      {
        id: "solar_flare",
        title: "Coronal Mass Ejection (Solar Flare)",
        badge: "SPACE WEATHER ALERT",
        severity: "HIGH",
        description: "Intense solar proton storm incoming. Risk of photovoltaic degradation and memory bit-flips.",
        options: [
          { text: "Orient Solar Wings Edge-on & Enter Safe Mode", outcome: "Protected hull and cells. Lost 1 day of science time.", successMod: 5, powerMod: 0, fuelMod: 0 },
          { text: "Keep Radar Active to Measure Radiation", outcome: "Scientific breakthrough captured! Minor 8% cell degradation.", successMod: 15, powerMod: -10, fuelMod: 0 },
          { text: "Burn RCS Thrusters to Change Attitude", outcome: "Averted storm apex, but burned 45 kg propellant.", successMod: 0, powerMod: 0, fuelMod: -45 }
        ]
      },
      {
        id: "comm_blackout",
        title: "Deep Space Network Signal Degradation",
        badge: "TELEMETRY ANOMALY",
        severity: "MEDIUM",
        description: "Atmospheric scintillation at Madrid DSN ground antenna causing telemetry packet loss.",
        options: [
          { text: "Switch to DSOC Optical Laser Comm Backup", outcome: "High-rate optical uplink established seamlessly.", successMod: 10, powerMod: -5, fuelMod: 0 },
          { text: "Buffer Telemetry in Solid-State Memory", outcome: "Data preserved until Goldstone station window opens.", successMod: 5, powerMod: 0, fuelMod: 0 },
          { text: "Increase RF Transmitter Power to Maximum", outcome: "Overcame noise floor. High battery drain recorded.", successMod: 0, powerMod: -15, fuelMod: 0 }
        ]
      },
      {
        id: "micrometeorite",
        title: "Micrometeorite Debris Impact",
        badge: "HULL INTEGRITY ADVISORY",
        severity: "CRITICAL",
        description: "Hypervelocity particle impacted secondary thermal radiator blanket.",
        options: [
          { text: "Isolate Damaged Coolant Loop Valve", outcome: "Loss of fluid prevented. Autonomous redundancy held.", successMod: 5, powerMod: 0, fuelMod: 0 },
          { text: "Ignore & Maintain Primary Instrument Duty", outcome: "Thermal spikes caused 15% sensor efficiency loss.", successMod: -20, powerMod: -10, fuelMod: 0 }
        ]
      },
      {
        id: "science_discovery",
        title: "Unexpected Volatile Chemical Plume Detected",
        badge: "OPPORTUNITY EVENT",
        severity: "LOW",
        description: "Spectrometer picked up anomalous methane spikes and water vapor volatiles on target surface.",
        options: [
          { text: "Execute Unscheduled Low-Altitude Flyby", outcome: "Monumental scientific discovery recorded! +150 Science pts.", successMod: 25, powerMod: 0, fuelMod: -30 },
          { text: "Observe from Safe High Orbit Distance", outcome: "Data verified safely without risking delta-v margins.", successMod: 10, powerMod: 0, fuelMod: 0 }
        ]
      }
    ];

    const chosen = eventPool[Math.floor(Math.random() * eventPool.length)];
    this.simulation.currentEvent = chosen;
    this.addTelemetryLog(`ALERT: ${chosen.title}`);
  }

  resolveEvent(optionIndex) {
    if (!this.simulation.currentEvent) return;
    const opt = this.simulation.currentEvent.options[optionIndex];
    
    this.simulation.successRate = Math.max(10, Math.min(100, this.simulation.successRate + opt.successMod));
    if (opt.fuelMod) this.simulation.remainingFuelKg = Math.max(0, this.simulation.remainingFuelKg + opt.fuelMod);
    if (opt.powerMod) this.simulation.batteryLevelPct = Math.max(10, this.simulation.batteryLevelPct + opt.powerMod);

    this.simulation.eventLog.push({
      event: this.simulation.currentEvent.title,
      decision: opt.text,
      outcome: opt.outcome
    });

    this.addTelemetryLog(`DECISION EXECUTED: ${opt.text} -> ${opt.outcome}`);
    this.simulation.currentEvent = null;
    this.renderTelemetryHUD();
  }

  completeMission() {
    this.simulation.active = false;
    if (this.simulation.timer) clearInterval(this.simulation.timer);
    this.simulation.phase = 'COMPLETED';

    // Award XP
    const earnedXp = Math.round(this.simulation.successRate * 8 + this.simulation.scienceCollected * 2);
    this.player.xp += earnedXp;
    this.savePlayer();

    // Trigger celebration confetti
    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }

    this.navigate('results');
  }

  abortMission() {
    this.simulation.active = false;
    if (this.simulation.timer) clearInterval(this.simulation.timer);
    this.simulation.phase = 'ABORTED';
    this.simulation.successRate = 20;
    this.addTelemetryLog("MISSION ABORTED BY FLIGHT DIRECTOR.");
    this.navigate('results');
  }

  renderSimulationView() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-blue-900/40 pb-4">
          <div>
            <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 telemetry-live"></span>
              <span>LIVE MISSION CONTROL CENTER • REAL-TIME FLIGHT OPS</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white flex items-center space-x-3">
              <span>${this.activeMission.name}</span>
              <span class="text-sm px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-600 text-cyan-300 font-mono">${this.simulation.phase}</span>
            </h2>
          </div>

          <div class="flex items-center space-x-3">
            <button onclick="app.abortMission()" class="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800 hover:bg-rose-900/60 transition-all">
              ABORT MISSION
            </button>
          </div>
        </div>

        <!-- Telemetry Data Grid -->
        <div id="telemetry-hud-container">
          <!-- Injected via renderTelemetryHUD() -->
        </div>
      </div>
    `;
  }

  renderTelemetryHUD() {
    const container = document.getElementById('telemetry-hud-container');
    if (!container) return;

    const progressPct = Math.min(100, (this.simulation.distanceCoveredKm / this.activeMission.distanceKm) * 100);
    const fuelPct = Math.min(100, (this.simulation.remainingFuelKg / this.spacecraft.fuelKg) * 100);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Flight Telemetry Cards Top Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-panel p-4 rounded-xl border border-blue-900/50">
            <div class="text-xs text-slate-400">DISTANCE COVERED</div>
            <div class="text-xl font-bold text-white mt-1 font-mono">${this.simulation.distanceCoveredKm.toLocaleString()} km</div>
            <div class="text-[10px] text-cyan-400 mt-1">${progressPct.toFixed(1)}% of total trip</div>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-blue-900/50">
            <div class="text-xs text-slate-400">PROPELLANT REMAINING</div>
            <div class="text-xl font-bold ${fuelPct > 25 ? 'text-cyan-400' : 'text-amber-400'} mt-1 font-mono">${this.simulation.remainingFuelKg} kg</div>
            <div class="text-[10px] text-slate-400 mt-1">${fuelPct.toFixed(0)}% fuel tank capacity</div>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-blue-900/50">
            <div class="text-xs text-slate-400">BATTERY & POWER BUS</div>
            <div class="text-xl font-bold text-emerald-400 mt-1 font-mono">${this.simulation.batteryLevelPct}%</div>
            <div class="text-[10px] text-slate-400 mt-1">Bus Voltage Nominal</div>
          </div>

          <div class="glass-panel p-4 rounded-xl border border-blue-900/50">
            <div class="text-xs text-slate-400">SCIENCE RETURN</div>
            <div class="text-xl font-bold text-purple-400 mt-1 font-mono">${this.simulation.scienceCollected} Pts</div>
            <div class="text-[10px] text-purple-300 mt-1">Multi-spectral data downlinked</div>
          </div>
        </div>

        <!-- Middle Row: Interactive Event Decision Box OR Visual Stage Animation -->
        ${this.simulation.currentEvent ? `
          <div class="glass-panel-glow p-6 rounded-2xl border-2 border-amber-400 shadow-2xl animate-pulse">
            <div class="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <i data-lucide="alert-octagon" class="w-4 h-4"></i>
              <span>${this.simulation.currentEvent.badge}</span>
            </div>
            <h3 class="text-2xl font-black text-white mb-2">${this.simulation.currentEvent.title}</h3>
            <p class="text-sm text-slate-200 mb-6 leading-relaxed">${this.simulation.currentEvent.description}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              ${this.simulation.currentEvent.options.map((opt, idx) => `
                <button onclick="app.resolveEvent(${idx})" class="p-4 rounded-xl bg-slate-900/80 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-400 text-left transition-all group">
                  <div class="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 mb-1">COMMAND OPTION ${idx + 1}</div>
                  <div class="text-sm text-white font-semibold mb-2">${opt.text}</div>
                  <div class="text-[11px] text-slate-400 font-mono">${opt.outcome}</div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : `
          <!-- Visual Flight Progression Bar -->
          <div class="glass-panel p-6 rounded-2xl border border-blue-900/50">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>DEPARTURE: EARTH</span>
              <span class="font-bold text-cyan-400">${this.simulation.phase} IN PROGRESS (${this.simulation.missionElapsedDays} Days elapsed)</span>
              <span>DESTINATION: ${this.activeMission.destination}</span>
            </div>
            <div class="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-blue-950">
              <div class="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 transition-all duration-700" style="width: ${progressPct}%"></div>
            </div>
          </div>
        `}

        <!-- Telemetry Logs Terminal -->
        <div class="glass-panel p-5 rounded-2xl border border-blue-900/50 scanlines">
          <div class="flex items-center justify-between text-xs text-slate-400 border-b border-blue-900/30 pb-2 mb-3">
            <div class="flex items-center space-x-2">
              <i data-lucide="terminal" class="w-4 h-4 text-cyan-400"></i>
              <span class="font-bold text-slate-200">DEEP SPACE TELEMETRY CONSOLE</span>
            </div>
            <span class="font-mono text-emerald-400 text-[11px]">DOWNLINK SYNC 99.8%</span>
          </div>
          <div class="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-2">
            ${this.simulation.telemetryLogs.map(log => `
              <div class="text-slate-300 leading-relaxed">${log}</div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // ==========================================
  // VIEW 8: MISSION RESULTS DEBRIEF
  // ==========================================
  renderResultsView() {
    const stats = this.computeSpacecraftStats();
    const isSuccess = this.simulation.phase === 'COMPLETED';
    const score = Math.round(this.simulation.successRate * 50 + this.simulation.scienceCollected * 10);
    const budgetRemaining = Math.max(0, this.activeMission.budgetMillions - stats.totalCost);

    return `
      <div class="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div class="text-center py-6">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full ${isSuccess ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' : 'bg-rose-950/80 text-rose-300 border-rose-500'} border text-xs font-bold uppercase tracking-wider mb-3">
            <i data-lucide="${isSuccess ? 'check-circle' : 'alert-triangle'}" class="w-4 h-4"></i>
            <span>${isSuccess ? 'MISSION ACCOMPLISHED' : 'MISSION TERMINATED / PARTIAL'}</span>
          </div>
          <h2 class="text-3xl sm:text-5xl font-black text-white">${this.activeMission.name} Debrief</h2>
          <p class="text-slate-400 mt-2">Comprehensive engineering breakdown & performance diagnostics.</p>
        </div>

        <!-- Score & KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="glass-panel p-5 rounded-2xl border border-blue-900/50 text-center">
            <div class="text-xs text-slate-400 uppercase tracking-wider">Flight Success Rating</div>
            <div class="text-4xl font-extrabold ${this.simulation.successRate >= 75 ? 'text-emerald-400' : 'text-amber-400'} mt-2">${this.simulation.successRate}%</div>
            <div class="text-[11px] text-slate-500 mt-1">Based on orbital insertion & health</div>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-blue-900/50 text-center">
            <div class="text-xs text-slate-400 uppercase tracking-wider">Mission Score</div>
            <div class="text-4xl font-extrabold text-cyan-400 mt-2">${score}</div>
            <div class="text-[11px] text-slate-500 mt-1">Leaderboard evaluation pts</div>
          </div>

          <div class="glass-panel p-5 rounded-2xl border border-blue-900/50 text-center">
            <div class="text-xs text-slate-400 uppercase tracking-wider">Budget Efficiency</div>
            <div class="text-4xl font-extrabold text-purple-400 mt-2">$${budgetRemaining.toFixed(1)}M</div>
            <div class="text-[11px] text-slate-500 mt-1">Remaining mission reserve</div>
          </div>
        </div>

        <!-- Detailed Breakdown -->
        <div class="glass-panel p-6 rounded-2xl border border-blue-900/40 space-y-4">
          <h3 class="text-lg font-bold text-white flex items-center space-x-2">
            <i data-lucide="clipboard-check" class="w-5 h-5 text-cyan-400"></i>
            <span>Engineering & Trajectory Assessment</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-spaceDark/60 p-4 rounded-xl border border-blue-950 space-y-2">
              <span class="text-emerald-400 font-bold block text-sm">What Went Right:</span>
              <ul class="list-disc list-inside space-y-1 text-slate-300">
                <li>Selected ${this.selectedLauncher.name} successfully lifted ${stats.totalMass.toFixed(0)} kg into parking orbit.</li>
                <li>Delta-V potential (${stats.deltaV.toFixed(0)} m/s) exceeded the ${this.activeMission.deltaVRequired} m/s requirement.</li>
                <li>Transmitted ${this.simulation.scienceCollected} scientific discovery points via ${this.spacecraft.antenna.name}.</li>
                <li>Maintained battery integrity throughout trajectory eclipses.</li>
              </ul>
            </div>

            <div class="bg-spaceDark/60 p-4 rounded-xl border border-blue-950 space-y-2">
              <span class="text-amber-400 font-bold block text-sm">Encountered Anomalies & Decisions:</span>
              ${this.simulation.eventLog.length > 0 ? `
                <ul class="list-disc list-inside space-y-1 text-slate-300">
                  ${this.simulation.eventLog.map(e => `
                    <li><strong>${e.event}:</strong> Chose "${e.decision}". ${e.outcome}</li>
                  `).join('')}
                </ul>
              ` : `
                <p class="text-slate-400">Flight traversed without unhandled structural anomalies. Nominal execution.</p>
              `}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button onclick="app.submitFlightToBackend(${score}, ${budgetRemaining})" class="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/30 flex items-center space-x-2 text-sm transition-all hover:scale-105">
            <i data-lucide="upload-cloud" class="w-4 h-4"></i>
            <span>SAVE TO GLOBAL LEADERBOARD</span>
          </button>

          <button onclick="app.navigate('missions')" class="px-6 py-3.5 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-blue-600/20 border border-slate-700 text-sm transition-all">
            NEW MISSION DIRECTIVE
          </button>
        </div>
      </div>
    `;
  }

  async submitFlightToBackend(score, budgetRemaining) {
    try {
      const payload = {
        callsign: this.player.callsign,
        mission_name: this.activeMission.name,
        destination: this.activeMission.destination,
        score: score,
        success_rate: this.simulation.successRate,
        budget_remaining: budgetRemaining,
        xp_earned: Math.round(score * 0.15),
        launch_vehicle: this.selectedLauncher.name,
        events: this.simulation.eventLog,
        scientific_data_collected: this.simulation.scienceCollected
      };

      const res = await fetch('/api/mission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Mission telemetry successfully registered with Space Mission Command Database!");
        this.navigate('leaderboard');
      } else {
        alert("Flight registered locally.");
        this.navigate('leaderboard');
      }
    } catch (e) {
      alert("Flight saved to local mission history.");
      this.navigate('leaderboard');
    }
  }

  // ==========================================
  // VIEW 9: EDUCATIONAL ACADEMY
  // ==========================================
  renderAcademyView() {
    return `
      <div class="space-y-6 animate-fadeIn max-w-5xl mx-auto">
        <div class="border-b border-blue-900/40 pb-4">
          <div class="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">AEROSPACE ENGINEERING PRIMER</div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-white">Spacecraft Physics & Astrodynamics Academy</h2>
          <p class="text-sm text-slate-400">Master the mathematics, thermodynamics, and telemetry principles behind your mission decisions.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div class="md:col-span-12 space-y-6">
            ${this.catalog.educationalTopics.map(topic => `
              <div class="glass-panel p-6 rounded-2xl border border-blue-900/40 space-y-3">
                <div class="flex items-center justify-between border-b border-blue-900/30 pb-3">
                  <span class="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
                    ${topic.badge}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-white">${topic.title}</h3>
                <div class="text-xs text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none">
                  ${topic.content.replace(/\n/g, '<br />')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 10: LEADERBOARD
  // ==========================================
  renderLeaderboardView() {
    return `
      <div class="space-y-6 animate-fadeIn max-w-4xl mx-auto">
        <div class="border-b border-blue-900/40 pb-4 text-center">
          <div class="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center justify-center space-x-1.5">
            <i data-lucide="trophy" class="w-4 h-4"></i>
            <span>GLOBAL COMMAND ASTRONAUTICS LEADERBOARD</span>
          </div>
          <h2 class="text-3xl font-black text-white">Top Mission Directors</h2>
          <p class="text-sm text-slate-400">Recognizing peak resource optimization and scientific achievements.</p>
        </div>

        <div class="glass-panel rounded-2xl border border-blue-900/40 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-spaceDark/80 border-b border-blue-900/50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th class="p-3.5">Rank</th>
                  <th class="p-3.5">Callsign</th>
                  <th class="p-3.5">Mission</th>
                  <th class="p-3.5">Destination</th>
                  <th class="p-3.5">Success Rate</th>
                  <th class="p-3.5">Score</th>
                </tr>
              </thead>
              <tbody id="leaderboard-table-body" class="divide-y divide-blue-900/30 text-slate-300">
                <tr>
                  <td colspan="6" class="p-6 text-center text-slate-400">Loading ground station records...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  async fetchLeaderboardData() {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data && data.leaderboard && data.leaderboard.length > 0) {
        tbody.innerHTML = data.leaderboard.map((item, index) => `
          <tr class="hover:bg-blue-900/20 transition-all ${index < 3 ? 'text-cyan-200' : ''}">
            <td class="p-3.5 font-bold ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : ''}">#${index + 1}</td>
            <td class="p-3.5 font-bold text-white flex items-center space-x-1.5">
              <span>${item.callsign}</span>
            </td>
            <td class="p-3.5 text-slate-300">${item.mission_name}</td>
            <td class="p-3.5 text-slate-400">${item.destination}</td>
            <td class="p-3.5 text-emerald-400 font-bold">${item.success_rate}%</td>
            <td class="p-3.5 text-cyan-400 font-bold">${item.score.toLocaleString()}</td>
          </tr>
        `).join('');
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Connected to local ground station telemetry cache.</td></tr>`;
    }
  }

  // --- Modals ---
  openHowToPlayModal() {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-4 text-left">
        <div class="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <h3 class="text-xl font-bold text-white flex items-center space-x-2">
            <i data-lucide="help-circle" class="w-5 h-5 text-cyan-400"></i>
            <span>How to Play Space Mission Simulator</span>
          </h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p><strong>1. Select a Mission:</strong> Each destination requires distinct delta-v velocity margins, communication ranges, and thermal protections.</p>
          <p><strong>2. Build Your Spacecraft:</strong> Assemble body hulls, solar panels, batteries, and sensors. Keep mass under the booster limit and costs within budget!</p>
          <p><strong>3. Assign Launch Booster:</strong> Ensure the booster has enough payload capability to lift your probe into space.</p>
          <p><strong>4. Map Your Flight Plan:</strong> Choose direct burn vs. Hohmann transfer trajectories to balance travel time vs. fuel expenditure.</p>
          <p><strong>5. Command Live Operations:</strong> Guide your craft through liftoff, transit, solar storms, and planetary capture.</p>
        </div>
        <button onclick="app.closeModal()" class="w-full py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all text-xs">
          UNDERSTOOD, COMMENCE OPS
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  openProfileModal() {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-4 text-left">
        <div class="flex items-center justify-between border-b border-blue-900/40 pb-3">
          <h3 class="text-xl font-bold text-white flex items-center space-x-2">
            <i data-lucide="user-check" class="w-5 h-5 text-cyan-400"></i>
            <span>Flight Director Profile</span>
          </h3>
          <button onclick="app.closeModal()" class="text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
        <div class="space-y-3 text-xs">
          <div>
            <label class="text-slate-400 block mb-1">COMMANDER CALLSIGN:</label>
            <input id="pilot-name-input" type="text" value="${this.player.callsign}" class="w-full bg-spaceDark border border-blue-900 rounded-lg p-2.5 text-white font-bold" />
          </div>

          <div class="bg-spaceDark/60 p-3 rounded-xl border border-blue-950 space-y-1 font-mono">
            <div class="flex justify-between text-slate-400">
              <span>Command XP:</span>
              <span class="text-cyan-400 font-bold">${this.player.xp} XP</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Director Rank:</span>
              <span class="text-purple-300 font-bold">Level ${this.calculateLevel()} (${this.player.rank})</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Qualification Badges:</span>
              <span class="text-emerald-400 font-bold">${this.player.badges.join(', ')}</span>
            </div>
          </div>
        </div>

        <button onclick="app.saveProfileModal()" class="w-full py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all text-xs">
          SAVE CALLSIGN
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  saveProfileModal() {
    const input = document.getElementById('pilot-name-input');
    if (input && input.value.trim()) {
      this.player.callsign = input.value.trim();
      this.savePlayer();
    }
    this.closeModal();
  }

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
  }
}

// Instantiate Global App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SpaceMissionSimulator();
});
