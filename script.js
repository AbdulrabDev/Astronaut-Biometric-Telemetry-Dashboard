/**
 * ============================================================================
 * PROJECT LONE ROVER — DEEP SPACE BIOMETRIC TELEMETRY & HEALTH COMMAND
 * Vanilla JavaScript Engine (Zero External Dependencies, 100% Offline-Capable)
 * ============================================================================
 */

(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // 1. REAL-TIME TELEMETRY & MISSION STATE MODEL
  // --------------------------------------------------------------------------
  const state = {
    selectedZone: "heart", // "heart" | "brain" | "bones"
    missionMonths: 0,      // 0 to 12 months
    gravityMode: "microgravity", // "microgravity" | "mars"
    evaActive: false,
    emergencyMode: false,
    detailsExpanded: false, // Progressive disclosure state

    // Live Fluctuating Biometrics
    heartRate: 74,
    systolic: 124,
    diastolic: 82,
    o2Reserve: 98.4,

    // Brain / CNS Metrics
    mentalFocus: 98,
    reactionMs: 212,
    stressIndex: 18,
    sleepHours: 7.6,

    // Skeletal & Radiation Metrics
    boneDensity: 100.0,
    radiationMsv: 14.2,

    // Supply Chain & Pharmacy Inventory
    calciumCapsules: 43,
    missionSecondsElapsed: 142 * 86400 + 3 * 3600 + 30 * 60 + 47
  };

  let telemetryIntervalId = null;

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const dom = {
    // Header Telemetry
    envToggleBtn: document.getElementById("envToggleBtn"),
    envDot: document.getElementById("envDot"),
    envModeText: document.getElementById("envModeText"),
    o2ReserveValue: document.getElementById("o2ReserveValue"),
    globalSystemBadge: document.getElementById("globalSystemBadge"),
    missionClock: document.getElementById("missionClock"),

    // Anatomical Scanner (Left Panel)
    activeZoneHeaderBadge: document.getElementById("activeZoneHeaderBadge"),
    zoneTabs: document.querySelectorAll(".zone-tab"),
    svgZones: document.querySelectorAll(".body-zone"),
    tabDotBrain: document.getElementById("tabDotBrain"),
    tabDotHeart: document.getElementById("tabDotHeart"),
    tabDotBones: document.getElementById("tabDotBones"),
    svgZoneBrain: document.getElementById("svg-zone-brain"),
    svgZoneHeart: document.getElementById("svg-zone-heart"),
    svgZoneBones: document.getElementById("svg-zone-bones"),
    miniHeartVal: document.getElementById("miniHeartVal"),
    miniBrainVal: document.getElementById("miniBrainVal"),
    miniBoneVal: document.getElementById("miniBoneVal"),

    // Live Biometrics Deck (Right Panel 1)
    bioPanelKicker: document.getElementById("bioPanelKicker"),
    bioPanelTitle: document.getElementById("bioPanelTitle"),
    liveStreamDot: document.getElementById("liveStreamDot"),
    liveStreamLabel: document.getElementById("liveStreamLabel"),
    viewHeart: document.getElementById("view-heart"),
    viewBrain: document.getElementById("view-brain"),
    viewBones: document.getElementById("view-bones"),

    // Heart Cards
    cardHeartRate: document.getElementById("cardHeartRate"),
    hrStatusBadge: document.getElementById("hrStatusBadge"),
    hrValue: document.getElementById("hrValue"),
    hrSubtext: document.getElementById("hrSubtext"),
    ecgSweepLine: document.getElementById("ecgSweepLine"),

    cardBloodPressure: document.getElementById("cardBloodPressure"),
    bpStatusBadge: document.getElementById("bpStatusBadge"),
    bpValue: document.getElementById("bpValue"),
    bpBarFill: document.getElementById("bpBarFill"),
    bpSubtext: document.getElementById("bpSubtext"),

    // Brain Cards
    cardMentalStatus: document.getElementById("cardMentalStatus"),
    mentalStatusBadge: document.getElementById("mentalStatusBadge"),
    mentalValue: document.getElementById("mentalValue"),
    mentalSubtext: document.getElementById("mentalSubtext"),

    cardStressLevel: document.getElementById("cardStressLevel"),
    stressStatusBadge: document.getElementById("stressStatusBadge"),
    stressValue: document.getElementById("stressValue"),
    stressSubtext: document.getElementById("stressSubtext"),

    cardSleepHours: document.getElementById("cardSleepHours"),
    sleepStatusBadge: document.getElementById("sleepStatusBadge"),
    sleepValue: document.getElementById("sleepValue"),
    sleepSubtext: document.getElementById("sleepSubtext"),

    // Bone Cards
    cardBoneDensity: document.getElementById("cardBoneDensity"),
    boneStatusBadge: document.getElementById("boneStatusBadge"),
    boneValue: document.getElementById("boneValue"),
    boneBarFill: document.getElementById("boneBarFill"),
    boneSubtext: document.getElementById("boneSubtext"),

    cardRadiation: document.getElementById("cardRadiation"),
    radStatusBadge: document.getElementById("radStatusBadge"),
    radValue: document.getElementById("radValue"),
    radBarFill: document.getElementById("radBarFill"),
    radSubtext: document.getElementById("radSubtext"),

    // Progressive Disclosure Hub Controls
    toggleDetailsBtn: document.getElementById("toggleDetailsBtn"),
    toggleDetailsIcon: document.getElementById("toggleDetailsIcon"),
    toggleDetailsText: document.getElementById("toggleDetailsText"),
    advancedDetailsContainer: document.getElementById("advancedDetailsContainer"),
    quickEvaBtn: document.getElementById("quickEvaBtn"),
    quickEvaBtnText: document.getElementById("quickEvaBtnText"),
    moduleShortcutPills: document.querySelectorAll("[data-open-tab]"),

    // Mission Scenario Simulator (Right Panel 2)
    simStateBadge: document.getElementById("simStateBadge"),
    missionDurationSlider: document.getElementById("missionDurationSlider"),
    durationReadout: document.getElementById("durationReadout"),
    btnMicrogravity: document.getElementById("btnMicrogravity"),
    btnMarsGravity: document.getElementById("btnMarsGravity"),
    startEvaBtn: document.getElementById("startEvaBtn"),
    startEvaBtnText: document.getElementById("startEvaBtnText"),
    resetSimBtn: document.getElementById("resetSimBtn"),

    // Supply Chain & Medical Logistics (Right Panel 3)
    logisticsStatusPill: document.getElementById("logisticsStatusPill"),
    logisticsAlertBanner: document.getElementById("logisticsAlertBanner"),
    logisticsAlertIcon: document.getElementById("logisticsAlertIcon"),
    logisticsHeadline: document.getElementById("logisticsHeadline"),
    logisticsMessage: document.getElementById("logisticsMessage"),
    calciumCountText: document.getElementById("calciumCountText"),
    calciumSupplyMonths: document.getElementById("calciumSupplyMonths"),
    dispenseCalciumBtn: document.getElementById("dispenseCalciumBtn"),
    o2CanisterText: document.getElementById("o2CanisterText"),
    o2LogisticsTag: document.getElementById("o2LogisticsTag"),

    // Emergency Focus Mode Modal (Full Screen Overlay)
    emergencyOverlay: document.getElementById("emergencyOverlay"),
    emergHrValue: document.getElementById("emergHrValue"),
    emergO2Value: document.getElementById("emergO2Value"),
    emergBpValue: document.getElementById("emergBpValue"),
    stabilizeDismissBtn: document.getElementById("stabilizeDismissBtn")
  };

  // --------------------------------------------------------------------------
  // 3. UTILITY FUNCTIONS FOR RANDOM BIOMETRIC FLUCTUATIONS & COLOR CODING
  // --------------------------------------------------------------------------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFloat(min, max, decimals) {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
  }

  function applyStatusBadge(badgeEl, level, text) {
    if (!badgeEl) return;
    badgeEl.classList.remove("status-normal", "status-warning", "status-critical");
    badgeEl.classList.add("status-" + level);
    badgeEl.textContent = text;
  }

  function applyCardBorder(cardEl, level) {
    if (!cardEl) return;
    cardEl.classList.remove("status-border-normal", "status-border-warning", "status-border-critical");
    cardEl.classList.add("status-border-" + level);
  }

  function applyTextStatus(el, level) {
    if (!el) return;
    el.classList.remove("status-text-normal", "status-text-warning", "status-text-critical");
    el.classList.add("status-text-" + level);
  }

  function applySvgZoneStatus(svgGroupEl, dotEl, level) {
    if (svgGroupEl) {
      svgGroupEl.classList.remove("zone-warning", "zone-critical");
      if (level === "warning") svgGroupEl.classList.add("zone-warning");
      if (level === "critical") svgGroupEl.classList.add("zone-critical");
    }
    if (dotEl) {
      const colorMap = {
        normal: "var(--status-green)",
        warning: "var(--status-yellow)",
        critical: "var(--status-red)"
      };
      dotEl.style.background = colorMap[level];
      dotEl.style.boxShadow = "0 0 8px " + colorMap[level];
    }
  }

  // --------------------------------------------------------------------------
  // 4. INTERACTIVE HUMAN BODY ZONE SELECTION (HEART, BRAIN, BONES)
  // --------------------------------------------------------------------------
  const zoneMetadata = {
    heart: {
      badge: "TARGET: HEART / CHEST",
      kicker: "CARDIOVASCULAR TELEMETRY // STREAMING 1HZ",
      title: "Heart & Cardiovascular System"
    },
    brain: {
      badge: "TARGET: BRAIN / HEAD",
      kicker: "NEUROLOGICAL & VESTIBULAR TELEMETRY // STREAMING 1HZ",
      title: "Brain, Cranial Pressure & CNS Status"
    },
    bones: {
      badge: "TARGET: BONES / LIMBS",
      kicker: "MUSCULOSKELETAL & DOSIMETRY // STREAMING 1HZ",
      title: "Trabecular Bone Density & Radiation"
    }
  };

  function selectAnatomicalZone(zoneKey) {
    if (!zoneMetadata[zoneKey]) return;
    state.selectedZone = zoneKey;

    dom.activeZoneHeaderBadge.textContent = zoneMetadata[zoneKey].badge;
    dom.bioPanelKicker.textContent = zoneMetadata[zoneKey].kicker;
    dom.bioPanelTitle.textContent = zoneMetadata[zoneKey].title;

    dom.zoneTabs.forEach(function (btn) {
      const isMatch = btn.getAttribute("data-zone") === zoneKey;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    dom.svgZones.forEach(function (group) {
      const isMatch = group.getAttribute("data-zone") === zoneKey;
      group.classList.toggle("active", isMatch);
    });

    dom.viewHeart.classList.toggle("active", zoneKey === "heart");
    dom.viewBrain.classList.toggle("active", zoneKey === "brain");
    dom.viewBones.classList.toggle("active", zoneKey === "bones");
  }

  // --------------------------------------------------------------------------
  // 5. PROGRESSIVE DISCLOSURE TOGGLE (MORE DETAILS) & EVA SYNC
  // --------------------------------------------------------------------------
  function setDetailsExpanded(expanded) {
    state.detailsExpanded = Boolean(expanded);
    if (!dom.advancedDetailsContainer || !dom.toggleDetailsBtn) return;

    if (state.detailsExpanded) {
      dom.advancedDetailsContainer.removeAttribute("hidden");
      dom.toggleDetailsBtn.setAttribute("aria-expanded", "true");
      dom.toggleDetailsBtn.classList.add("expanded");
      if (dom.toggleDetailsIcon) dom.toggleDetailsIcon.textContent = "▴";
      if (dom.toggleDetailsText) {
        dom.toggleDetailsText.textContent = "Hide Details: Simulator & Medical Logistics";
      }
    } else {
      dom.advancedDetailsContainer.setAttribute("hidden", "");
      dom.toggleDetailsBtn.setAttribute("aria-expanded", "false");
      dom.toggleDetailsBtn.classList.remove("expanded");
      if (dom.toggleDetailsIcon) dom.toggleDetailsIcon.textContent = "▾";
      if (dom.toggleDetailsText) {
        dom.toggleDetailsText.textContent = "More Details: Simulator & Medical Logistics";
      }
    }
  }

  function syncEvaButtonsUI() {
    if (state.evaActive) {
      dom.startEvaBtn.classList.add("eva-active");
      dom.startEvaBtnText.textContent = "EVA Active (Climbing >120 BPM...)";
      if (dom.quickEvaBtn) dom.quickEvaBtn.classList.add("eva-active");
      if (dom.quickEvaBtnText) dom.quickEvaBtnText.textContent = "EVA Active (>120 BPM...)";
      dom.simStateBadge.textContent = "EVA EXERTION ACTIVE";
    } else {
      dom.startEvaBtn.classList.remove("eva-active");
      dom.startEvaBtnText.textContent = "Start EVA (Spacewalk)";
      if (dom.quickEvaBtn) dom.quickEvaBtn.classList.remove("eva-active");
      if (dom.quickEvaBtnText) dom.quickEvaBtnText.textContent = "Quick EVA Test";
      dom.simStateBadge.textContent = "SIMULATION READY";
    }
  }

  function toggleEvaSimulation() {
    state.evaActive = !state.evaActive;
    if (state.evaActive) {
      selectAnatomicalZone("heart");
      state.heartRate = 116;
      state.o2Reserve = Number((state.o2Reserve - 1.2).toFixed(1));
    } else {
      state.heartRate = 74;
    }
    syncEvaButtonsUI();
    renderDashboard();
  }

  // --------------------------------------------------------------------------
  // 6. NASA SCENARIO SIMULATOR & PREDICTIVE PHYSIOLOGY CALCULATIONS
  // --------------------------------------------------------------------------
  let constBaseLoss = 0;

  function recalculateNasaScenarioMetrics() {
    const months = state.missionMonths;

    if (months > 6) {
      constBaseLoss = months * 1.0;
      const jitter = randomFloat(-0.08, 0.08, 1);
      state.boneDensity = Math.max(80, Number((100 - constBaseLoss + jitter).toFixed(1)));
    } else {
      state.boneDensity = randomFloat(99.6, 100.0, 1);
    }

    const baseRad = 14.2 + months * 11.4;
    state.radiationMsv = Number((baseRad + randomFloat(-0.2, 0.3, 1)).toFixed(1));

    if (state.evaActive) {
      state.stressIndex = randomInt(76, 89);
      state.mentalFocus = randomInt(81, 86);
      state.reactionMs = randomInt(295, 340);
      state.sleepHours = Number((6.1 - Math.min(0.8, months * 0.05)).toFixed(1));
    } else if (months > 6) {
      state.stressIndex = randomInt(36, 46);
      state.mentalFocus = randomInt(91, 95);
      state.reactionMs = randomInt(235, 258);
      state.sleepHours = Number((7.1 + randomFloat(-0.1, 0.1, 1)).toFixed(1));
    } else {
      state.stressIndex = randomInt(16, 22);
      state.mentalFocus = randomInt(97, 99);
      state.reactionMs = randomInt(206, 218);
      state.sleepHours = Number((7.6 + randomFloat(-0.1, 0.1, 1)).toFixed(1));
    }
  }

  // --------------------------------------------------------------------------
  // 7. LIVE TELEMETRY HEARTBEAT LOOP (1HZ SETINTERVAL)
  // --------------------------------------------------------------------------
  function tickBiometricStream() {
    state.missionSecondsElapsed += 1;
    updateMissionClockDisplay();

    if (state.evaActive) {
      if (state.heartRate < 118) {
        state.heartRate += randomInt(9, 15);
      } else {
        state.heartRate = Math.min(148, state.heartRate + randomInt(3, 7));
      }

      state.o2Reserve = Math.max(78.0, Number((state.o2Reserve - randomFloat(0.6, 1.2, 1)).toFixed(1)));

      if (state.heartRate > 120 && !state.emergencyMode) {
        triggerEmergencyFocusMode();
      }
    } else {
      state.heartRate = randomInt(72, 76);

      if (state.o2Reserve < 98.4) {
        state.o2Reserve = Math.min(98.4, Number((state.o2Reserve + 0.4).toFixed(1)));
      } else {
        state.o2Reserve = randomFloat(98.2, 98.6, 1);
      }
    }

    if (state.evaActive) {
      state.systolic = randomInt(142, 154);
      state.diastolic = randomInt(90, 98);
    } else if (state.gravityMode === "microgravity") {
      state.systolic = randomInt(125, 131);
      state.diastolic = randomInt(82, 86);
    } else {
      state.systolic = randomInt(116, 121);
      state.diastolic = randomInt(74, 78);
    }

    recalculateNasaScenarioMetrics();
    renderDashboard();
  }

  function updateMissionClockDisplay() {
    const total = state.missionSecondsElapsed;
    const sols = Math.floor(total / 86400);
    const rem = total % 86400;
    const hrs = String(Math.floor(rem / 3600)).padStart(2, "0");
    const mins = String(Math.floor((rem % 3600) / 60)).padStart(2, "0");
    const secs = String(rem % 60).padStart(2, "0");
    dom.missionClock.textContent = "SOL " + sols + " // " + hrs + ":" + mins + ":" + secs;
  }

  // --------------------------------------------------------------------------
  // 8. EMERGENCY FOCUS MODE (CRITICAL HR > 120 BPM)
  // --------------------------------------------------------------------------
  function triggerEmergencyFocusMode() {
    state.emergencyMode = true;
    dom.emergencyOverlay.removeAttribute("hidden");
  }

  function stabilizeAndDismissEmergency() {
    state.emergencyMode = false;
    state.evaActive = false;
    state.heartRate = 74;
    state.o2Reserve = 98.4;

    dom.emergencyOverlay.setAttribute("hidden", "");
    syncEvaButtonsUI();
    tickBiometricStream();
  }

  // --------------------------------------------------------------------------
  // 9. FULL UI RENDERING & STRICT GREEN / YELLOW / RED COLOR CODING
  // --------------------------------------------------------------------------
  function renderDashboard() {
    const months = state.missionMonths;
    const isMicrogravity = state.gravityMode === "microgravity";

    let heartLevel = "normal";
    if (state.heartRate > 120) {
      heartLevel = "critical";
    } else if (state.heartRate >= 95 || isMicrogravity) {
      heartLevel = isMicrogravity && state.heartRate < 95 ? "warning" : (state.heartRate >= 95 ? "warning" : "normal");
    }

    let brainLevel = "normal";
    if (state.evaActive && state.heartRate > 120) {
      brainLevel = "critical";
    } else if (isMicrogravity || months > 6) {
      brainLevel = "warning";
    }

    let boneLevel = "normal";
    if (months > 6 || state.boneDensity < 99.0) {
      boneLevel = "warning";
    }

    let globalLevel = "normal";
    let globalText = "NOMINAL";
    if (heartLevel === "critical" || state.emergencyMode) {
      globalLevel = "critical";
      globalText = "CRITICAL EMERGENCY";
    } else if (boneLevel === "warning" || brainLevel === "warning" || heartLevel === "warning") {
      globalLevel = "warning";
      globalText = "CAUTION // ADVISORY";
    }
    applyStatusBadge(dom.globalSystemBadge, globalLevel, globalText);

    dom.envModeText.textContent = isMicrogravity ? "Microgravity (0.0G)" : "Mars Surface (0.38G)";
    dom.envDot.className = "status-dot " + (isMicrogravity ? "status-warning" : "status-normal");

    dom.o2ReserveValue.textContent = state.o2Reserve.toFixed(1) + "%";
    const o2Level = state.o2Reserve < 88 ? "critical" : (state.o2Reserve < 95 ? "warning" : "normal");
    applyTextStatus(dom.o2ReserveValue, o2Level);

    applySvgZoneStatus(dom.svgZoneHeart, dom.tabDotHeart, heartLevel);
    applySvgZoneStatus(dom.svgZoneBrain, dom.tabDotBrain, brainLevel);
    applySvgZoneStatus(dom.svgZoneBones, dom.tabDotBones, boneLevel);

    dom.miniHeartVal.textContent = state.heartRate + " BPM";
    applyTextStatus(dom.miniHeartVal, heartLevel);

    dom.miniBrainVal.textContent = brainLevel === "critical" ? "HIGH STRESS" : (isMicrogravity ? "FLUID SHIFT" : "NOMINAL");
    applyTextStatus(dom.miniBrainVal, brainLevel);

    dom.miniBoneVal.textContent = state.boneDensity.toFixed(1) + "%";
    applyTextStatus(dom.miniBoneVal, boneLevel);

    // Heart / Chest View
    dom.hrValue.textContent = String(state.heartRate);
    const hrCardLevel = state.heartRate > 120 ? "critical" : (state.heartRate >= 95 ? "warning" : "normal");
    applyCardBorder(dom.cardHeartRate, hrCardLevel);
    applyStatusBadge(
      dom.hrStatusBadge,
      hrCardLevel,
      hrCardLevel === "critical" ? "CRITICAL (>120)" : (hrCardLevel === "warning" ? "ELEVATED" : "NORMAL")
    );
    applyTextStatus(dom.hrValue, hrCardLevel);
    dom.hrSubtext.textContent = state.evaActive
      ? "EVA thermal & physical load active • O₂ consumption elevated"
      : "Resting sinus rhythm (72–76 BPM baseline) • Threshold: 120 BPM";

    if (dom.ecgSweepLine) {
      const sweepDuration = state.heartRate > 120 ? "0.45s" : (state.heartRate > 95 ? "0.75s" : "1.3s");
      dom.ecgSweepLine.style.animationDuration = sweepDuration;
      const sweepColor = hrCardLevel === "critical" ? "var(--status-red)" : (hrCardLevel === "warning" ? "var(--status-yellow)" : "var(--status-green)");
      dom.ecgSweepLine.style.background = "linear-gradient(90deg, transparent, " + sweepColor + ", transparent)";
    }

    dom.bpValue.textContent = state.systolic + "/" + state.diastolic;
    const bpLevel = state.systolic >= 140 ? "critical" : (isMicrogravity ? "warning" : "normal");
    applyCardBorder(dom.cardBloodPressure, bpLevel);
    applyStatusBadge(
      dom.bpStatusBadge,
      bpLevel,
      bpLevel === "critical" ? "HYPERTENSIVE" : (isMicrogravity ? "CEPHALIC SHIFT" : "NORMAL")
    );
    applyTextStatus(dom.bpValue, bpLevel);

    const mapVal = Math.round(state.diastolic + (state.systolic - state.diastolic) / 3);
    dom.bpSubtext.textContent = isMicrogravity
      ? "Microgravity cephalic fluid shift to head • MAP: " + mapVal + " mmHg"
      : "Mars 0.38G hydrostatic gradient nominal • MAP: " + mapVal + " mmHg";
    dom.bpBarFill.style.width = Math.min(100, Math.round((state.systolic / 165) * 100)) + "%";
    dom.bpBarFill.style.background = bpLevel === "critical" ? "var(--status-red)" : (bpLevel === "warning" ? "var(--status-yellow)" : "var(--status-green)");

    // Brain / Head View
    dom.mentalValue.textContent = state.mentalFocus + "% Focus";
    const mentalLevel = state.mentalFocus < 85 ? "critical" : (isMicrogravity || months > 6 ? "warning" : "normal");
    applyCardBorder(dom.cardMentalStatus, mentalLevel);
    applyStatusBadge(
      dom.mentalStatusBadge,
      mentalLevel,
      mentalLevel === "critical" ? "IMPAIRED" : (mentalLevel === "warning" ? "ICP ELEVATED" : "OPTIMAL")
    );
    dom.mentalSubtext.textContent = isMicrogravity
      ? "Cephalic fluid shift (+2.1 mmHg ICP) • Latency: " + state.reactionMs + " ms"
      : "Cognitive reaction latency: " + state.reactionMs + " ms (Nominal)";

    const stressLevel = state.stressIndex > 70 ? "critical" : (state.stressIndex > 32 ? "warning" : "normal");
    dom.stressValue.textContent = String(state.stressIndex);
    applyCardBorder(dom.cardStressLevel, stressLevel);
    applyStatusBadge(
      dom.stressStatusBadge,
      stressLevel,
      stressLevel === "critical" ? "CRITICAL LOAD" : (stressLevel === "warning" ? "MODERATE" : "LOW")
    );
    applyTextStatus(dom.stressValue, stressLevel);

    const sleepLevel = state.sleepHours < 6.5 ? "warning" : "normal";
    dom.sleepValue.textContent = state.sleepHours.toFixed(1);
    applyCardBorder(dom.cardSleepHours, sleepLevel);
    applyStatusBadge(dom.sleepStatusBadge, sleepLevel, sleepLevel === "warning" ? "DEFICIT" : "RESTED");

    // Bones / Limbs View
    dom.boneValue.textContent = state.boneDensity.toFixed(1);
    applyCardBorder(dom.cardBoneDensity, boneLevel);
    applyStatusBadge(
      dom.boneStatusBadge,
      boneLevel,
      boneLevel === "warning" ? "OSTEOPENIA WARNING" : "NORMAL"
    );
    applyTextStatus(dom.boneValue, boneLevel);
    dom.boneBarFill.style.width = Math.max(50, state.boneDensity) + "%";
    dom.boneBarFill.style.background = boneLevel === "warning" ? "var(--status-yellow)" : "var(--status-green)";
    dom.boneSubtext.textContent = months > 6
      ? "WARNING: Duration > 6m (-1.0%/mo trabecular loss) • Countermeasure required"
      : "ARED resistance protocol active • Loss rate: 0.0%/mo";

    const radLevel = state.radiationMsv > 85 ? "warning" : "normal";
    dom.radValue.textContent = state.radiationMsv.toFixed(1);
    applyCardBorder(dom.cardRadiation, radLevel);
    applyStatusBadge(dom.radStatusBadge, radLevel, radLevel === "warning" ? "ELEVATED GCR" : "NOMINAL");
    dom.radBarFill.style.width = Math.min(100, Math.round((state.radiationMsv / 200) * 100)) + "%";
    dom.radBarFill.style.background = radLevel === "warning" ? "var(--status-yellow)" : "var(--status-green)";

    // Supply Chain & Medical Logistics Widget
    const supplyMonthsText = Math.max(1, Math.round(state.calciumCapsules / 21.5)) + " Months Supply";
    dom.calciumCountText.textContent = state.calciumCapsules + " Capsules";
    dom.calciumSupplyMonths.textContent = supplyMonthsText;

    if (months > 6 || state.boneDensity < 99.0) {
      applyStatusBadge(dom.logisticsStatusPill, "warning", "ACTION REQUIRED");
      applyCardBorder(dom.logisticsAlertBanner, "warning");
      dom.logisticsAlertIcon.textContent = "!";
      dom.logisticsAlertIcon.style.background = "var(--status-yellow-soft)";
      dom.logisticsAlertIcon.style.borderColor = "var(--status-yellow)";
      dom.logisticsAlertIcon.style.color = "var(--status-yellow)";
      dom.logisticsHeadline.className = "alert-headline status-text-warning";
      dom.logisticsHeadline.textContent =
        "WARNING: Bone Density loss detected. Action: Take 1x Calcium/Vitamin D. Remaining Ship Inventory: " +
        state.calciumCapsules +
        " Capsules (" +
        supplyMonthsText +
        ").";
      dom.logisticsMessage.textContent =
        "Mission duration (" +
        months +
        " months) exceeded 6-month microgravity osteopenia threshold. Automated pharmacy ration queued.";
    } else {
      applyStatusBadge(dom.logisticsStatusPill, "normal", "INVENTORY SYNCED");
      applyCardBorder(dom.logisticsAlertBanner, "normal");
      dom.logisticsAlertIcon.textContent = "✓";
      dom.logisticsAlertIcon.style.background = "var(--status-green-soft)";
      dom.logisticsAlertIcon.style.borderColor = "var(--status-green)";
      dom.logisticsAlertIcon.style.color = "var(--status-green)";
      dom.logisticsHeadline.className = "alert-headline status-text-normal";
      dom.logisticsHeadline.textContent =
        "NOMINAL BIOMETRIC LOGISTICS: All crew mineral & metabolic reserves within target range.";
      dom.logisticsMessage.textContent =
        "Standard daily prophylactic ration active. Remaining Ship Inventory: " +
        state.calciumCapsules +
        " Capsules (" +
        supplyMonthsText +
        ").";
    }

    dom.o2CanisterText.textContent = state.evaActive
      ? "5 Units (" + state.o2Reserve.toFixed(1) + "%)"
      : "6 Units (100%)";
    dom.o2LogisticsTag.textContent = state.evaActive ? "DRAWING RESERVE" : "PRESSURIZED";
    applyTextStatus(dom.o2LogisticsTag, state.evaActive ? "warning" : "normal");

    if (state.emergencyMode) {
      dom.emergHrValue.textContent = state.heartRate + " BPM";
      dom.emergO2Value.textContent = state.o2Reserve.toFixed(1) + "%";
      dom.emergBpValue.textContent = state.systolic + "/" + state.diastolic;
    }
  }

  // --------------------------------------------------------------------------
  // 10. EVENT LISTENERS & USER INTERACTION WIRING
  // --------------------------------------------------------------------------
  function bindEvents() {
    // 1. Quick Zone Tabs
    dom.zoneTabs.forEach(function (tabBtn) {
      tabBtn.addEventListener("click", function () {
        const zone = tabBtn.getAttribute("data-zone");
        selectAnatomicalZone(zone);
      });
    });

    // 2. Interactive SVG Zones
    dom.svgZones.forEach(function (svgZone) {
      svgZone.addEventListener("click", function () {
        const zone = svgZone.getAttribute("data-zone");
        selectAnatomicalZone(zone);
      });
      svgZone.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const zone = svgZone.getAttribute("data-zone");
          selectAnatomicalZone(zone);
        }
      });
    });

    // 3. Progressive Disclosure Button ("More Details: Simulator & Medical Logistics")
    if (dom.toggleDetailsBtn) {
      dom.toggleDetailsBtn.addEventListener("click", function () {
        setDetailsExpanded(!state.detailsExpanded);
      });
    }

    // 4. Shortcut Pills for Self-Assessment Modules (Check-in, Trends, Hazards, Triage)
    dom.moduleShortcutPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        const targetTab = pill.getAttribute("data-open-tab");
        const navBtn = document.querySelector('.lr-tabs button[data-v="' + targetTab + '"]');
        if (navBtn) {
          navBtn.click();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });

    // 5. Mission Duration Slider (0 to 12 Months)
    dom.missionDurationSlider.addEventListener("input", function (e) {
      const months = parseInt(e.target.value, 10) || 0;
      state.missionMonths = months;

      if (months === 0) {
        dom.durationReadout.textContent = "0 Months (Launch Baseline)";
        dom.durationReadout.className = "slider-readout status-text-normal";
      } else if (months > 6) {
        dom.durationReadout.textContent = months + " Months (-" + months + "% Bone Density Warning)";
        dom.durationReadout.className = "slider-readout status-text-warning";
        selectAnatomicalZone("bones");
      } else {
        dom.durationReadout.textContent = months + " Months (Nominal Cruise)";
        dom.durationReadout.className = "slider-readout status-text-normal";
      }

      recalculateNasaScenarioMetrics();
      renderDashboard();
    });

    // 6. Gravity Mode Selector Buttons & Top Header Toggle
    function setGravityMode(mode) {
      state.gravityMode = mode;
      dom.btnMicrogravity.classList.toggle("active", mode === "microgravity");
      dom.btnMarsGravity.classList.toggle("active", mode === "mars");
      tickBiometricStream();
    }

    dom.btnMicrogravity.addEventListener("click", function () {
      setGravityMode("microgravity");
    });

    dom.btnMarsGravity.addEventListener("click", function () {
      setGravityMode("mars");
    });

    dom.envToggleBtn.addEventListener("click", function () {
      setGravityMode(state.gravityMode === "microgravity" ? "mars" : "microgravity");
    });

    // 7. Start EVA Buttons (Both Inside Simulator & Quick EVA Button in Primary View)
    dom.startEvaBtn.addEventListener("click", toggleEvaSimulation);
    if (dom.quickEvaBtn) {
      dom.quickEvaBtn.addEventListener("click", toggleEvaSimulation);
    }

    // 8. Reset Simulator Button
    dom.resetSimBtn.addEventListener("click", function () {
      state.missionMonths = 0;
      state.gravityMode = "mars";
      state.evaActive = false;
      state.emergencyMode = false;
      state.heartRate = 74;
      state.o2Reserve = 98.4;
      state.calciumCapsules = 43;

      dom.missionDurationSlider.value = "0";
      dom.durationReadout.textContent = "0 Months (Launch Baseline)";
      dom.durationReadout.className = "slider-readout status-text-normal";
      syncEvaButtonsUI();
      dom.btnMicrogravity.classList.remove("active");
      dom.btnMarsGravity.classList.add("active");
      dom.emergencyOverlay.setAttribute("hidden", "");

      recalculateNasaScenarioMetrics();
      renderDashboard();
    });

    // 9. Dispense 1x Calcium/Vitamin D Capsule Button
    dom.dispenseCalciumBtn.addEventListener("click", function () {
      if (state.calciumCapsules > 0) {
        state.calciumCapsules -= 1;
        state.boneDensity = Math.min(100.0, Number((state.boneDensity + 0.4).toFixed(1)));
        renderDashboard();
      }
    });

    // 10. Emergency Focus Mode "Stabilized / Dismiss" Button
    dom.stabilizeDismissBtn.addEventListener("click", function () {
      stabilizeAndDismissEmergency();
    });
  }

  // --------------------------------------------------------------------------
  // 11. INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    bindEvents();
    setDetailsExpanded(false); // Start with clean primary interface
    selectAnatomicalZone("heart");
    recalculateNasaScenarioMetrics();
    renderDashboard();

    if (telemetryIntervalId) {
      clearInterval(telemetryIntervalId);
    }
    telemetryIntervalId = setInterval(tickBiometricStream, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
