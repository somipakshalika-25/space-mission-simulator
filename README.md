<<<<<<< HEAD
# 🚀 Space Mission Simulator – Design, Launch & Explore

An interactive, aerospace-grade space mission simulation platform built for students, developers, and space enthusiasts. Act as a Space Mission Director: manage finite budgets, balance payload masses, configure real-world electrical/propulsion systems, plot transfer orbits, and command live missions through unexpected deep-space anomalies.

![Space Mission Simulator](https://img.shields.io/badge/Status-Operational-00f0ff?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🌟 Key Features

1. **Mission Profiles**:
   - 🌙 **Lunar Exploration (`ARTEMIS-X`)**: Target lunar polar volatile ice deposits, survive night passes.
   - 🔴 **Mars Exploration (`ARES-VANGUARD`)**: Interplanetary transit, atmospheric aerobraking, 750s telemetry lag.
   - 🌍 **Earth Observation (`TERRA-WATCH`)**: 700km Sun-Synchronous Polar orbit with synthetic aperture radar.
   - ☄️ **Asteroid Exploration (`PSYCHE-HUNTER`)**: Proximity ion micro-thrust orbital rendezvous.
   - 🪐 **Deep Space Exploration (`VOYAGER-PROXIMA`)**: Jupiter gravity assist, nuclear RTG power, heliopause exit.
   - 🛰️ **Satellite Communication (`GEO-CONNECT`)**: Geostationary equatorial circularization at 35,786 km.

2. **Spacecraft Customization & Blueprint Engine**:
   - Modular subsystems: Chassis bodies, Solar panels / Nuclear RTGs, Solid-state batteries, High-gain parabolic dishes & DSOC optical lasers, Monopropellant / Bipropellant / Ion engines, Fuel tanks, and Science suites.
   - Dynamic SVG schematic generator that updates visually with component selections.

3. **Aerospace Physics & Real Calculations**:
   - **Tsiolkovsky Rocket Equation**: Calculates actual $\Delta v$ potential based on wet mass, dry mass, and propulsion $I_{sp}$.
   - **Solar Inverse-Square Law**: Dynamically computes solar wattage falloff across interplanetary distances.
   - **Comm Link Budget & Light-Speed Delay**: Realistic communication latency and antenna reach.

4. **Live Mission Control Center**:
   - Interactive launch countdown, staging sequence, and heliocentric transit progress.
   - Dynamic contingency crises (solar flares, micrometeorite strikes, DSN telemetry fading, surface volatile plumes).

5. **Gamification & Global Leaderboard**:
   - Player callsign, XP rewards, rank progression, and mission telemetry log persistence via FastAPI + SQLite.

6. **Aerospace Academy**:
   - Educational primers with formulas covering Keplerian orbital mechanics, vacuum thermal equilibrium, Friis transmission, and Hohmann transfer ellipses.

---

## 📂 Project Directory Structure

```text
space_mission_simulator/
├── main.py              # FastAPI backend & SQLite telemetry database
├── requirements.txt     # Python dependencies
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
└── static/
    ├── index.html       # Single-page application frontend
    ├── style.css        # Space UI styling, CRT scanlines & glow effects
    ├── catalog.js       # Complete aerospace mission & hardware components catalog
    └── app.js           # Interactive state machine, physics engine & telemetry HUD
```

---

## 🛠️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/space-mission-simulator.git
cd space-mission-simulator
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the application
```bash
python main.py
```

### 4. Open in browser
Navigate to `http://127.0.0.1:8000` in your web browser.

---

## 📄 License
MIT License. Feel free to use, modify, and distribute for educational and non-commercial purposes.
=======
# space-mission-simulator
>>>>>>> e57e66c0bd8ed7e019c9fd00a52b6e63cd907848
