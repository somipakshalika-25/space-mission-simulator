// Comprehensive Space Engineering & Mission Catalog
window.SPACE_CATALOG = {
  missions: [
    {
      id: "lunar_exploration",
      name: "Lunar Exploration",
      code: "ARTEMIS-X",
      tagline: "Explore the Moon's South Pole water ice deposits and establish orbital telemetry.",
      destination: "Moon",
      distanceKm: 384400,
      difficulty: "Intermediate",
      budgetMillions: 250,
      maxPayloadKg: 3500,
      deltaVRequired: 3950, // m/s TLI & capture
      durationDays: 14,
      targetScience: 180,
      description: "Design a lunar orbiter/lander to map shadowed craters, measure surface regolith temperature, and detect subsurface water-ice volatile compounds.",
      environment: {
        solarIntensity: 1.0, // 1.0 AU
        radiationRisk: "Moderate",
        commDelaySec: 1.3,
        thermalRange: "-130°C to +120°C"
      },
      objectives: [
        { id: "orbit", text: "Achieve stable Lunar Polar Insertion orbit", weight: 30 },
        { id: "science", text: "Perform multispectral volatile survey (spectrometer required)", weight: 35 },
        { id: "comm", text: "Transmit 100 GB of high-gain scientific telemetry", weight: 20 },
        { id: "power", text: "Survive lunar orbital eclipse night pass", weight: 15 }
      ]
    },
    {
      id: "mars_exploration",
      name: "Mars Exploration",
      code: "ARES-VANGUARD",
      tagline: "Send an advanced science rover and orbital relay to the Jezero Paleolake basin.",
      destination: "Mars",
      distanceKm: 225000000,
      difficulty: "Advanced",
      budgetMillions: 480,
      maxPayloadKg: 5200,
      deltaVRequired: 5600, // m/s Trans-Mars Injection
      durationDays: 210,
      targetScience: 350,
      description: "Interplanetary transit through deep solar radiation. Requires robust autonomous navigation, high-capacity thermal loop radiators, and high-efficiency power.",
      environment: {
        solarIntensity: 0.43, // 1.52 AU (~43% Earth sunlight)
        radiationRisk: "High",
        commDelaySec: 750, // ~12.5 mins
        thermalRange: "-125°C to +20°C"
      },
      objectives: [
        { id: "tmi", text: "Execute Trans-Mars Injection with zero course drift", weight: 25 },
        { id: "entry", text: "Survive atmospheric aerobraking and deceleration", weight: 30 },
        { id: "surface_ops", text: "Collect subsurface biological biosignature samples", weight: 30 },
        { id: "relay", text: "Establish high-frequency Deep Space Network uplink", weight: 15 }
      ]
    },
    {
      id: "earth_observation",
      name: "Earth Observation",
      code: "TERRA-WATCH",
      tagline: "Deploy a Sun-Synchronous Polar satellite monitoring climate and ocean changes.",
      destination: "Earth Sun-Sync Orbit (SSO)",
      distanceKm: 700,
      difficulty: "Beginner",
      budgetMillions: 120,
      maxPayloadKg: 2200,
      deltaVRequired: 1800,
      durationDays: 5,
      targetScience: 120,
      description: "Low-Earth orbit satellite equipped with high-resolution synthetic aperture radar and atmospheric spectrometers to track global ocean currents and greenhouse gas signatures.",
      environment: {
        solarIntensity: 1.0,
        radiationRisk: "Low",
        commDelaySec: 0.05,
        thermalRange: "-65°C to +85°C"
      },
      objectives: [
        { id: "sso_orbit", text: "Attain 700km Sun-Synchronous circular orbit", weight: 35 },
        { id: "radar_scan", text: "Conduct wide-spectrum radar surface mapping", weight: 35 },
        { id: "battery_cycle", text: "Demonstrate 35-min eclipse power reliability", weight: 30 }
      ]
    },
    {
      id: "asteroid_exploration",
      name: "Asteroid Exploration",
      code: "PSYCHE-HUNTER",
      tagline: "Rendezvous with carbonaceous metallic asteroid 101955 Bennu in deep resonance.",
      destination: "Near-Earth Asteroid",
      distanceKm: 180000000,
      difficulty: "Advanced",
      budgetMillions: 360,
      maxPayloadKg: 3800,
      deltaVRequired: 6200,
      durationDays: 180,
      targetScience: 280,
      description: "Precision proximity navigation around microgravity rubble-pile asteroids. Requires ionic ion drives or high specific impulse thrusters for extended spiral rendezvous.",
      environment: {
        solarIntensity: 0.65,
        radiationRisk: "Severe",
        commDelaySec: 600,
        thermalRange: "-100°C to +60°C"
      },
      objectives: [
        { id: "rendezvous", text: "Perform micro-thrust proximity approach", weight: 30 },
        { id: "gravity_map", text: "Map irregular mass quadrupole gravitational moments", weight: 35 },
        { id: "touch_sample", text: "Tag-and-go regolith surface spectrum capture", weight: 35 }
      ]
    },
    {
      id: "deep_space_exploration",
      name: "Deep Space Exploration",
      code: "VOYAGER-PROXIMA",
      tagline: "Heliopause exit trajectory beyond Jupiter towards interstellar boundaries.",
      destination: "Outer Solar System (Jupiter/Saturn)",
      distanceKm: 850000000,
      difficulty: "Expert",
      budgetMillions: 750,
      maxPayloadKg: 6500,
      deltaVRequired: 9800,
      durationDays: 720,
      targetScience: 500,
      description: "Push beyond the inner solar system where solar flux drops below 4%. Requires Radioisotope Thermoelectric Generators (RTG) or ultra-massive solar arrays, deep autonomous AI, and extreme hardened electronics.",
      environment: {
        solarIntensity: 0.037, // 5.2 AU Jupiter
        radiationRisk: "Extreme Jovian Belts",
        commDelaySec: 2800, // ~46 mins
        thermalRange: "-220°C to +40°C"
      },
      objectives: [
        { id: "gravity_assist", text: "Execute Jupiter gravity assist swing-by trajectory", weight: 35 },
        { id: "magnetosphere", text: "Probe Jovian magnetosphere radiation belt", weight: 35 },
        { id: "heliopause", text: "Transmit interstellar solar wind plasma telemetry", weight: 30 }
      ]
    },
    {
      id: "satellite_communication",
      name: "Satellite Communication",
      code: "GEO-CONNECT",
      tagline: "Insert a high-throughput Ka-Band communication hub into Geostationary Orbit.",
      destination: "Geostationary Equatorial Orbit (GEO)",
      distanceKm: 35786,
      difficulty: "Beginner",
      budgetMillions: 160,
      maxPayloadKg: 4000,
      deltaVRequired: 3850, // GTO to GEO circularization
      durationDays: 7,
      targetScience: 140,
      description: "Deploy a high-power commercial/scientific relay satellite over the equator providing 500 Gbps cross-link bandwidth with zero apparent ground movement.",
      environment: {
        solarIntensity: 1.0,
        radiationRisk: "Van Allen Outer Belt",
        commDelaySec: 0.24,
        thermalRange: "-150°C to +130°C"
      },
      objectives: [
        { id: "apogee_burn", text: "Apogee kick motor burn at 35,786 km", weight: 40 },
        { id: "array_deploy", text: "Deploy 25-meter dish & phased antenna array", weight: 30 },
        { id: "station_keep", text: "Validate 15-year ion station-keeping attitude hold", weight: 30 }
      ]
    }
  ],

  launchVehicles: [
    {
      id: "falcon_heavy",
      name: "Atlas Falcon 9H",
      provider: "AeroDynamics Corp",
      payloadCapacityKg: 8000,
      costMillions: 90,
      reliability: 98,
      engineType: "RP-1 / Liquid Oxygen Multi-Core",
      stageCount: 2,
      maxOrbit: "Deep Space & Interplanetary",
      thrustKN: 22800,
      description: "Triple-core heavy lift vehicle with outstanding track record. Exceptional payload margin for interplanetary excursions."
    },
    {
      id: "vulcan_centaur",
      name: "Titan Centaur IV",
      provider: "Orbital Launch Systems",
      payloadCapacityKg: 5500,
      costMillions: 65,
      reliability: 96,
      engineType: "Hydrolox (LH2/LOX) Cryogenic Upper Stage",
      stageCount: 2,
      maxOrbit: "Lunar & GEO",
      thrustKN: 16400,
      description: "High specific impulse cryogenic upper stage ideal for high-energy orbital injection to the Moon or Geostationary transfers."
    },
    {
      id: "saturn_prime",
      name: "Prometheus Star-Lifter",
      provider: "Global Space Alliance",
      payloadCapacityKg: 14000,
      costMillions: 140,
      reliability: 95,
      engineType: "Methane/LOX Full Flow Staged Combustion",
      stageCount: 2,
      maxOrbit: "Deep Interplanetary Heavy",
      thrustKN: 34000,
      description: "Next-generation super-heavy booster built for flagship planetary missions and massive science suites."
    },
    {
      id: "electron_scout",
      name: "Scout Pathfinder Light",
      provider: "MicroSpace Dynamics",
      payloadCapacityKg: 2400,
      costMillions: 28,
      reliability: 94,
      engineType: "Electric Turbopump RP-1/LOX",
      stageCount: 2,
      maxOrbit: "LEO / SSO / Light Lunar",
      thrustKN: 4200,
      description: "Economical, rapid-cadence launch vehicle optimized for Earth observation and nimble scientific probes."
    }
  ],

  components: {
    bodies: [
      {
        id: "bus_light",
        name: "AeroHex Carbon Bus",
        category: "Spacecraft Body",
        massKg: 350,
        costMillions: 12,
        powerDrawW: 30,
        volumeL: 1200,
        integrity: 85,
        thermalShielding: 80,
        description: "Ultra-lightweight carbon-fiber composite hexagonal framework with micro-meteorite multi-layer insulation."
      },
      {
        id: "bus_modular",
        name: "Standard Deep-Space Bus",
        category: "Spacecraft Body",
        massKg: 700,
        costMillions: 24,
        powerDrawW: 55,
        volumeL: 2600,
        integrity: 95,
        thermalShielding: 90,
        description: "Proven titanium alloy central thrust tube with standardized payload mounts and radiation-hardened bulkhead."
      },
      {
        id: "bus_heavy",
        name: "Armored Flagship Bus",
        category: "Spacecraft Body",
        massKg: 1300,
        costMillions: 45,
        powerDrawW: 90,
        volumeL: 5200,
        integrity: 99,
        thermalShielding: 98,
        description: "Radiation-shielded tantalum-beryllium chassis built to withstand harsh Jovian radiation and long-duration exposure."
      }
    ],

    solarPanels: [
      {
        id: "solar_fixed",
        name: "Body-Mounted GaAs Arrays",
        category: "Solar Panels",
        massKg: 80,
        costMillions: 8,
        powerGenW: 420, // at 1 AU
        powerDrawW: 0,
        efficiency: 0.28,
        description: "Gallium Arsenide cells mounted directly to exterior surfaces. Resilient against deployment mechanical failures."
      },
      {
        id: "solar_foldable",
        name: "Deployable Dual-Wing Solar Arrays",
        category: "Solar Panels",
        massKg: 190,
        costMillions: 18,
        powerGenW: 1450,
        powerDrawW: 15, // tracking gimbal
        efficiency: 0.34,
        description: "Articulated dual wings with Sun-tracking gimbals. Optimal power output across Earth and Lunar trajectories."
      },
      {
        id: "solar_rollout",
        name: "ROSA Flexible Roll-Out Array",
        category: "Solar Panels",
        massKg: 280,
        costMillions: 32,
        powerGenW: 2800,
        powerDrawW: 25,
        efficiency: 0.36,
        description: "High-power flexible composite boom wings. Provides abundant wattage even in dim Martian orbits."
      },
      {
        id: "rtg_nuclear",
        name: "NextGen Multi-Mission RTG",
        category: "Solar Panels",
        massKg: 45,
        costMillions: 65,
        powerGenW: 480, // constant regardless of distance!
        powerDrawW: 0,
        efficiency: 0.99,
        isNuclear: true,
        description: "Plutonium-238 thermoelectric decay generator. Provides reliable, continuous wattage beyond Jupiter without any sunlight."
      }
    ],

    batteries: [
      {
        id: "bat_lithium_std",
        name: "Space Lithium-Ion Pack (4 kWh)",
        category: "Battery System",
        massKg: 60,
        costMillions: 6,
        capacityWh: 4000,
        powerDrawW: 0,
        depthOfDischarge: 0.8,
        description: "Reliable commercial aerospace Li-ion cells with autonomous thermal balancing heating coils."
      },
      {
        id: "bat_solid_state",
        name: "High-Density Solid-State Battery (10 kWh)",
        category: "Battery System",
        massKg: 110,
        costMillions: 16,
        capacityWh: 10000,
        powerDrawW: 0,
        depthOfDischarge: 0.95,
        description: "Non-flammable solid electrolyte with superior temperature resistance and double energy density per kilogram."
      },
      {
        id: "bat_extreme_cap",
        name: "Cryo-Resilient Long-Life Matrix (22 kWh)",
        category: "Battery System",
        massKg: 210,
        costMillions: 28,
        capacityWh: 22000,
        powerDrawW: 0,
        depthOfDischarge: 0.92,
        description: "Flagship energy reservoir designed for multi-hour planetary eclipses and high-draw radar bursts."
      }
    ],

    communication: [
      {
        id: "comm_low_gain",
        name: "Omni S-Band Patch Transponder",
        category: "Communication Antenna",
        massKg: 25,
        costMillions: 5,
        powerDrawW: 45,
        rangeKm: 2000000, // 2 million km
        dataRateMbps: 2.5,
        description: "Low-gain isotropic antenna for near-Earth / Lunar orbit with minimal pointing requirements."
      },
      {
        id: "comm_high_gain_dish",
        name: "1.8m Gimballed X/Ka-Band Dish",
        category: "Communication Antenna",
        massKg: 95,
        costMillions: 22,
        powerDrawW: 160,
        rangeKm: 400000000, // 400 million km (Mars capable)
        dataRateMbps: 45,
        description: "High-gain carbon reflector with dual-axis steering actuators and cryogenic Low-Noise Amplifiers."
      },
      {
        id: "comm_optical_laser",
        name: "Deep Space Optical Laser Comm (DSOC)",
        category: "Communication Antenna",
        massKg: 130,
        costMillions: 48,
        powerDrawW: 240,
        rangeKm: 1200000000, // Outer solar system capable
        dataRateMbps: 260,
        description: "State-of-the-art infrared laser transceiver delivering Gigabit-class bandwidth across interplanetary distances."
      }
    ],

    propulsion: [
      {
        id: "prop_monoprop",
        name: "Hydrazine Monopropellant System",
        category: "Propulsion System",
        massKg: 75,
        costMillions: 9,
        isp: 235, // seconds
        thrustN: 450,
        powerDrawW: 25,
        fuelRequiredKg: 300,
        fuelCostPerKg: 0.015,
        description: "Catalytic decomposition thrusters. Simple, reliable, instant ignition response for orientation and corrections."
      },
      {
        id: "prop_biprop",
        name: "NTO/MMH Hypergolic Bipropellant",
        category: "Propulsion System",
        massKg: 160,
        costMillions: 22,
        isp: 325, // seconds
        thrustN: 1100,
        powerDrawW: 45,
        fuelRequiredKg: 750,
        fuelCostPerKg: 0.02,
        description: "Spontaneously igniting hypergolic engine capable of high delta-V main orbital insertion burns."
      },
      {
        id: "prop_ion_hall",
        name: "Krypton/Xenon Hall-Effect Ion Engine",
        category: "Propulsion System",
        massKg: 90,
        costMillions: 38,
        isp: 3100, // seconds - extreme fuel efficiency!
        thrustN: 0.85, // continuous micro-thrust
        powerDrawW: 650, // needs heavy electrical power!
        fuelRequiredKg: 120,
        fuelCostPerKg: 0.045,
        description: "Electromagnetic plasma acceleration. Phenomenal specific impulse saves tonnes of propellant over months."
      }
    ],

    fuelTanks: [
      {
        id: "tank_small",
        name: "Titanium Diaphragm Tank (350 kg cap)",
        category: "Fuel Tank",
        massKg: 40,
        costMillions: 4,
        maxCapacityKg: 350,
        powerDrawW: 5,
        description: "High-pressure helium-pressurized elastomeric diaphragm fuel cell."
      },
      {
        id: "tank_medium",
        name: "Carbon-Overwrapped Pressure Vessel (900 kg cap)",
        category: "Fuel Tank",
        massKg: 75,
        costMillions: 11,
        maxCapacityKg: 900,
        powerDrawW: 10,
        description: "Lightweight COPV tank offering high tensile strength for medium-duration planetary transit burns."
      },
      {
        id: "tank_large",
        name: "Cryogenic Cryo-Insulated Tank (2200 kg cap)",
        category: "Fuel Tank",
        massKg: 180,
        costMillions: 24,
        maxCapacityKg: 2200,
        powerDrawW: 30, // active boil-off refrigeration
        description: "Multi-layer vacuum-jacketed tank designed for massive delta-V interplanetary deceleration burns."
      }
    ],

    scientificInstruments: [
      {
        id: "inst_multispectral",
        name: "Multispectral Surface Imager",
        category: "Scientific Instruments",
        massKg: 42,
        costMillions: 14,
        powerDrawW: 75,
        sciencePoints: 95,
        description: "Visual and infrared mapping telescope able to classify surface mineralogy and crater geomorphology."
      },
      {
        id: "inst_radar",
        name: "Subsurface Sounding Synthetic Radar (SAR)",
        category: "Scientific Instruments",
        massKg: 115,
        costMillions: 32,
        powerDrawW: 320,
        sciencePoints: 160,
        description: "Low-frequency ground-penetrating radar reveals buried ice layers, lava tubes, and ancient aquifer beds."
      },
      {
        id: "inst_spectrometer",
        name: "Thermal Mass Gas Spectrometer",
        category: "Scientific Instruments",
        massKg: 35,
        costMillions: 26,
        powerDrawW: 90,
        sciencePoints: 130,
        description: "Detects isotopic trace atmospheric gas compositions, methane spikes, and volatile chemical plumes."
      },
      {
        id: "inst_magnetometer",
        name: "Boom-Mounted Fluxgate Magnetometer",
        category: "Scientific Instruments",
        massKg: 18,
        costMillions: 9,
        powerDrawW: 20,
        sciencePoints: 65,
        description: "Deployed on a 4-meter carbon boom to isolate planetary dynamo and magnetosphere interactions."
      }
    ],

    thermalProtection: [
      {
        id: "thermal_passive",
        name: "Multi-Layer MLI Gold Kapton Blankets",
        category: "Thermal Protection",
        massKg: 35,
        costMillions: 4,
        powerDrawW: 0,
        heatRejectionCapacity: 75,
        description: "Radiation-reflective aluminized mylar and gold kapton foil protecting against solar thermal radiation."
      },
      {
        id: "thermal_active",
        name: "Mechanically Pumped Fluid Loop Radiators",
        category: "Thermal Protection",
        massKg: 85,
        costMillions: 15,
        powerDrawW: 55,
        heatRejectionCapacity: 98,
        description: "Ammonia/Freon coolant loop radiator panels to dissipate heat from high-draw instruments and computers."
      }
    ],

    navigation: [
      {
        id: "nav_star_tracker",
        name: "Autonomous Dual-Head Star Trackers + IMU",
        category: "Navigation System",
        massKg: 20,
        costMillions: 8,
        powerDrawW: 30,
        accuracyDeg: 0.002,
        description: "Compares celestial star catalogs to camera fields of view to determine attitude orientation in real time."
      },
      {
        id: "nav_deep_ai",
        name: "Autonomous Optical Terrain Navigation Computer (AutoNav)",
        category: "Navigation System",
        massKg: 45,
        costMillions: 24,
        powerDrawW: 95,
        accuracyDeg: 0.0004,
        description: "Edge AI vision processing module for hazard avoidance, pin-point landing descent, and autonomous course-correction without waiting for Earth comm delay."
      }
    ]
  },

  educationalTopics: [
    {
      id: "orbital_mechanics",
      title: "1. Orbital Mechanics & Tsiolkovsky Rocket Equation",
      badge: "Astrodynamics Core",
      summary: "Understanding how rockets escape gravity wells and change velocities through space.",
      content: `
### The Tsiolkovsky Rocket Equation
The fundamental mathematical relationship governing all spaceflight is:
$$\\Delta v = I_{sp} \\cdot g_0 \\cdot \\ln\\left(\\frac{m_0}{m_f}\\right)$$

- **$\\Delta v$ (Delta-V):** Total velocity change potential (m/s). Reaching low Earth orbit requires ~9,400 m/s. Interplanetary transfers to Mars require ~5,600 m/s more.
- **$I_{sp}$ (Specific Impulse):** Efficiency of the rocket engine in seconds. Chemical rockets achieve 300–450s; Ion thrusters reach 3,000+s.
- **$g_0$:** Standard gravitational acceleration ($9.80665\\text{ m/s}^2$).
- **$m_0$:** Initial wet mass (including propellant).
- **$m_f$:** Final dry mass (spacecraft structure + payload).

> **Key Rule of Thumb:** Mass grows exponentially with required Delta-V. Shaving off 50 kg from a scientific sensor can save 500 kg of fuel and millions of dollars in launch vehicle size.
      `
    },
    {
      id: "power_budgets",
      title: "2. Spacecraft Power & Solar Flux Inverse-Square Law",
      badge: "Electrical Engineering",
      summary: "How solar energy falls off with distance and why deep space requires nuclear RTGs.",
      content: `
### Solar Flux and the Inverse-Square Law
Solar power drops rapidly as distance from the Sun increases according to:
$$S(d) = \\frac{S_0}{d^2}$$

- At Earth (1.0 AU): Solar flux is $\\approx 1361\\text{ W/m}^2$.
- At Mars (1.52 AU): Solar flux drops to $\\approx 589\\text{ W/m}^2$ (only 43% of Earth!).
- At Jupiter (5.2 AU): Solar flux collapses to $\\approx 50\\text{ W/m}^2$ (less than 4% of Earth).

To power a 500W science payload around Jupiter with solar panels, an orbiter would need panels the size of a tennis court (like NASA's Juno). For distant journeys, **Radioisotope Thermoelectric Generators (RTGs)** powered by decaying Plutonium-238 provide steady electrical power independent of sunlight or orientation.
      `
    },
    {
      id: "comm_systems",
      title: "3. Deep Space Communication & Friis Path Loss",
      badge: "Telecommunications",
      summary: "Overcoming light-speed time delay and radio signal attenuation across astronomical distances.",
      content: `
### Signal Attenuation (Friis Transmission Formula)
Electromagnetic radio signals disperse into spherical waves as they travel:
$$P_r = P_t \\cdot G_t \\cdot G_r \\cdot \\left(\\frac{\\lambda}{4\\pi R}\\right)^2$$

Where $R$ is the distance to the spacecraft. By the time a 20W transmission from Mars reaches NASA's Deep Space Network dishes on Earth, the signal strength is measured in *picowatts* ($10^{-12}$ W)—a billion times weaker than a wristwatch battery!

### Speed of Light Latency
Radio waves travel at $c = 299,792\\text{ km/s}$:
- **Moon:** $\\approx 1.3\\text{ seconds}$ one-way.
- **Mars:** Between **4 minutes** (closest approach) and **24 minutes** (solar conjunction).
- **Jupiter:** $\\approx 45\\text{ minutes}$ one-way.

Because commands take tens of minutes to arrive, deep-space probes **must** possess autonomous navigation computers to avoid catastrophic collisions during descent or orbital burns.
      `
    },
    {
      id: "thermal_control",
      title: "4. Spacecraft Thermal Equilibrium in the Vacuum",
      badge: "Thermodynamics",
      summary: "Surviving the extreme temperature swings between scorching sunlight and absolute zero.",
      content: `
### Heat Transfer in Space
In the vacuum of space, there is no air to carry away heat through conduction or convection. Heat transfer occurs solely through **radiation** governed by the Stefan-Boltzmann law:
$$Q_{rad} = \\epsilon \\cdot \\sigma \\cdot A \\cdot T^4$$

A spacecraft faces extreme thermal contrasts:
- Sunlit side: Over $+120^\\circ\\text{C}$ ($393\\text{ K}$)
- Shadowed side: Down to $-150^\\circ\\text{C}$ ($123\\text{ K}$)

Engineers use **Multi-Layer Insulation (MLI)** (gold and aluminized mylar sheets) to reflect sunlight, electrical survival heaters to keep batteries warm, and deployable fluid-loop radiators to reject excess waste heat generated by onboard microprocessors and radar transmitters.
      `
    },
    {
      id: "trajectory_planning",
      title: "5. Hohmann Transfer Orbits & Gravity Assists",
      badge: "Orbital Mechanics",
      summary: "The most fuel-efficient trajectories between planetary orbits.",
      content: `
### Hohmann Transfer Orbit
A Hohmann transfer is an elliptical orbit used to transfer between two circular orbits of different radii in the same plane:
$$v_1 = \\sqrt{\\frac{\\mu}{r_1}} \\left( \\sqrt{\\frac{2 r_2}{r_1 + r_2}} - 1 \\right)$$

By firing thrusters at periapsis to raise the apoapsis to the target planet's orbit, missions minimize fuel consumption.

### Planetary Gravity Assist (Slingshot)
When a spacecraft flies close to a moving planet (like Jupiter), it enters the planet's gravitational sphere of influence and steals a fraction of the planet's orbital momentum, increasing its heliocentric velocity without burning any rocket fuel!
      `
    }
  ]
};
