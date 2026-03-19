/**
 * Robot Simulator Module
 * Provides a visual on-screen simulator for the Dobot robot arm.
 * Shows position, gripper state, and movement on a canvas.
 */
const RobotSimulator = (() => {

  let canvas = null;
  let ctx = null;
  let state = {
    x: 0,    // offset from center (mm → pixels)
    y: 0,    // offset from center
    z: 50,   // height (0 = lowest)
    rotation: 0, // degrees
    gripper: false,  // suction on/off
    clawOpen: true,
    speed: 'medium',
    log: [],
    // Joint angles (approximate from IK)
    j1: 0,
    j2: 45,
    j3: 45,
    j4: 0,
    emergencyStopped: false,
  };

  // Dobot Magician workspace bounds (mm)
  const BOUNDS = {
    X_MIN: -320, X_MAX: 320,
    Y_MIN: -320, Y_MAX: 320,
    Z_MIN: -75,  Z_MAX: 200,
    R_MIN: -135, R_MAX: 135,
  };

  const SCALE = 1.2; // mm to pixels

  // Log a message to the output
  const log = (message, type = 'info') => {
    const entry = { message, type, time: new Date().toLocaleTimeString() };
    state.log.push(entry);
    if (state.log.length > 50) state.log.shift();
    renderLog();
  };

  const renderLog = () => {
    const logEl = document.getElementById('sim-log');
    if (!logEl) return;
    logEl.innerHTML = state.log.slice(-20).map(e =>
      `<div class="log-line ${e.type}"><span style="opacity:0.5">[${e.time}]</span> ${e.message}</div>`
    ).join('');
    logEl.scrollTop = logEl.scrollHeight;
  };

  // Draw the robot on canvas
  const draw = () => {
    if (!canvas || !ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const cx = W / 2;
    const cy = H / 2;

    // Robot base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();

    // Robot arm
    const armLen = 60 + state.z * 0.3;
    const armRad = (state.rotation * Math.PI) / 180;
    const armX = cx + state.x * SCALE;
    const armY = cy - state.y * SCALE;

    // Arm shadow (height indicator)
    const shadowAlpha = 0.08 + (state.z / 200) * 0.15;
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(armX, armY + 8, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arm segments
    const seg1EndX = cx + Math.cos(armRad) * 40;
    const seg1EndY = cy - Math.sin(armRad) * 40;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(seg1EndX, seg1EndY);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(seg1EndX, seg1EndY);
    ctx.lineTo(armX, armY);
    ctx.stroke();

    // Joint
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(seg1EndX, seg1EndY, 6, 0, Math.PI * 2);
    ctx.fill();

    // End effector / gripper
    const gripColor = state.gripper ? '#8b5cf6' : '#94a3b8';
    ctx.fillStyle = gripColor;
    ctx.beginPath();
    ctx.arc(armX, armY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (state.gripper) {
      // Suction indicator
      ctx.fillStyle = 'rgba(139,92,246,0.3)';
      ctx.beginPath();
      ctx.arc(armX, armY, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!state.clawOpen) {
      // Claw closed indicator
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(armX - 6, armY - 12);
      ctx.lineTo(armX, armY);
      ctx.lineTo(armX + 6, armY - 12);
      ctx.stroke();
    }

    // Position label
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`X:${Math.round(state.x)} Y:${Math.round(state.y)} Z:${Math.round(state.z)}`, 8, 16);

    // Z axis indicator (bar on right)
    const barH = H - 40;
    const barX = W - 16;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(barX, 20, 8, barH);
    const zFraction = 1 - Math.min(state.z / 200, 1);
    const fillH = barH * zFraction;
    const gradient = ctx.createLinearGradient(0, 20, 0, 20 + barH);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#6d28d9');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, 20 + fillH, 8, barH - fillH);
    ctx.fillStyle = '#64748b';
    ctx.fillText('Z', barX - 1, 16);

    updatePositionDisplay();
  };

  /* ---- Robot command handlers ---- */
  const animate = (cb, duration = 400) => {
    return new Promise(resolve => {
      const start = performance.now();
      const startState = { ...state };
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out
        cb(eased, startState);
        draw();
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  const commands = {
    move_home: async () => {
      log('🏠 Moving to home position...', 'info');
      await animate((t, s) => {
        state.x = s.x * (1 - t);
        state.y = s.y * (1 - t);
        state.z = s.z + (50 - s.z) * t;
        state.rotation = s.rotation * (1 - t);
      });
      log('✅ At home position', 'success');
    },
    move_forward: async (mm = 10) => {
      log(`⬆️ Moving forward ${mm}mm`, 'info');
      await animate((t, s) => { state.y = s.y + mm * t; });
      log('✅ Done', 'success');
    },
    move_backward: async (mm = 10) => {
      log(`⬇️ Moving backward ${mm}mm`, 'info');
      await animate((t, s) => { state.y = s.y - mm * t; });
      log('✅ Done', 'success');
    },
    move_left: async (mm = 10) => {
      log(`⬅️ Moving left ${mm}mm`, 'info');
      await animate((t, s) => { state.x = s.x - mm * t; });
      log('✅ Done', 'success');
    },
    move_right: async (mm = 10) => {
      log(`➡️ Moving right ${mm}mm`, 'info');
      await animate((t, s) => { state.x = s.x + mm * t; });
      log('✅ Done', 'success');
    },
    move_up: async (mm = 10) => {
      log(`🔼 Moving up ${mm}mm`, 'info');
      await animate((t, s) => { state.z = Math.min(s.z + mm * t, 200); });
      log('✅ Done', 'success');
    },
    move_down: async (mm = 10) => {
      log(`🔽 Moving down ${mm}mm`, 'info');
      await animate((t, s) => { state.z = Math.max(s.z - mm * t, 0); });
      log('✅ Done', 'success');
    },
    rotate_left: async (deg = 45) => {
      log(`↩️ Rotating left ${deg}°`, 'info');
      await animate((t, s) => { state.rotation = s.rotation + deg * t; });
      log('✅ Done', 'success');
    },
    rotate_right: async (deg = 45) => {
      log(`↪️ Rotating right ${deg}°`, 'info');
      await animate((t, s) => { state.rotation = s.rotation - deg * t; });
      log('✅ Done', 'success');
    },
    move_to: async (x, y, z) => {
      const warnings = checkBounds(x, y, z);
      if (warnings.length) {
        log(`⚠️ Bounds warning: ${warnings.join('; ')}`, 'warn');
      }
      const safe = clampToBounds(x, y, z);
      log(`📍 Moving to (${safe.x}, ${safe.y}, ${safe.z})`, 'info');
      await animate((t, s) => {
        state.x = s.x + (safe.x - s.x) * t;
        state.y = s.y + (safe.y - s.y) * t;
        state.z = s.z + (safe.z - s.z) * t;
      });
      log('✅ At position', 'success');
    },
    grab: async () => {
      log('🟣 Suction ON - grabbing', 'info');
      state.gripper = true;
      draw();
      log('✅ Object grabbed', 'success');
    },
    release: async () => {
      log('⚪ Suction OFF - releasing', 'info');
      state.gripper = false;
      draw();
      log('✅ Object released', 'success');
    },
    claw_open: async () => {
      log('✋ Opening claw', 'info');
      state.clawOpen = true;
      draw();
      log('✅ Claw open', 'success');
    },
    claw_close: async () => {
      log('✊ Closing claw', 'info');
      state.clawOpen = false;
      draw();
      log('✅ Claw closed', 'success');
    },
    set_speed: async (speed) => {
      state.speed = speed;
      log(`⚡ Speed set to: ${speed}`, 'info');
    },
    wait: async (seconds = 1) => {
      log(`⏳ Waiting ${seconds} second(s)...`, 'info');
      // Cap at 2s and scale by 0.5x for faster visual feedback in simulator
      await new Promise(r => setTimeout(r, Math.min(seconds * 500, 2000)));
      log('✅ Wait done', 'success');
    },
    beep: async () => {
      log('🔔 Beep!', 'info');
      // Visual flash
      if (canvas) {
        canvas.style.outline = '3px solid #f59e0b';
        setTimeout(() => { canvas.style.outline = ''; }, 300);
      }
    },
    light: async (state_) => {
      log(`💡 Light ${state_}`, 'info');
    },
    print: async (msg) => {
      log(`💬 ${msg}`, 'success');
    },
    ai_detect_object: async () => {
      log('🤖 AI: Scanning for objects...', 'info');
      await new Promise(r => setTimeout(r, 600));
      const objects = ['cube', 'ball', 'cylinder', 'cone'];
      const found = objects[Math.floor(Math.random() * objects.length)];
      log(`🤖 AI: Detected "${found}"`, 'success');
      return found;
    },
    ai_detect_color: async () => {
      log('🎨 AI: Detecting color...', 'info');
      await new Promise(r => setTimeout(r, 600));
      const colors = ['red', 'blue', 'green', 'yellow'];
      const found = colors[Math.floor(Math.random() * colors.length)];
      log(`🎨 AI: Detected color "${found}"`, 'success');
      return found;
    },
    ai_detect_face: async () => {
      log('😊 AI: Scanning for faces...', 'info');
      await new Promise(r => setTimeout(r, 600));
      const found = Math.random() > 0.4;
      log(`😊 AI: Face ${found ? 'detected!' : 'not found'}`, found ? 'success' : 'warn');
      return found;
    },
    ai_grab_detected: async () => {
      log('🤖 AI: Detecting and grabbing...', 'info');
      await new Promise(r => setTimeout(r, 800));
      state.gripper = true;
      draw();
      log('✅ AI: Object grabbed!', 'success');
    },
    ai_follow_line: async () => {
      log('📏 AI: Line following activated', 'info');
      // Simulate some movement
      for (let i = 0; i < 5; i++) {
        await animate((t, s) => { state.y = s.y + 5 * t; }, 200);
      }
      log('✅ Line follow sequence done', 'success');
    },
    // Sensor commands
    read_color_sensor: async () => {
      log('🎨 Reading color sensor...', 'info');
      await new Promise(r => setTimeout(r, 400));
      const colors = ['red', 'green', 'blue', 'yellow', 'white'];
      const found = colors[Math.floor(Math.random() * colors.length)];
      log(`🎨 Color sensor: "${found}"`, 'success');
      return found;
    },
    read_infrared: async () => {
      log('📡 Reading infrared sensor...', 'info');
      await new Promise(r => setTimeout(r, 300));
      const SIM_IR_MIN = 20;
      const SIM_IR_RANGE = 180;
      const dist = Math.round(SIM_IR_MIN + Math.random() * SIM_IR_RANGE);
      log(`📡 Infrared distance: ${dist}mm`, 'success');
      return dist;
    },
    infrared_detected: async () => {
      log('📡 Checking infrared...', 'info');
      await new Promise(r => setTimeout(r, 300));
      const detected = Math.random() > 0.4;
      log(`📡 Object ${detected ? 'detected!' : 'not detected'}`, detected ? 'success' : 'warn');
      return detected;
    },
    // Conveyor commands
    conveyor_speed: async (speed = 50, direction = 'forward') => {
      log(`🏭 Conveyor: ${speed}mm/s ${direction}`, 'info');
      state.conveyorRunning = true;
      log('✅ Conveyor running', 'success');
    },
    conveyor_stop: async () => {
      log('⏹️ Conveyor stopped', 'info');
      state.conveyorRunning = false;
    },
    conveyor_move: async (distance = 100, direction = 'forward') => {
      log(`🏭 Conveyor: moving ${distance}mm ${direction}`, 'info');
      await new Promise(r => setTimeout(r, Math.min(distance * 10, 2000)));
      log('✅ Conveyor move done', 'success');
    },
    // Advanced movement
    set_joint_angles: async (j1 = 0, j2 = 0, j3 = 0, j4 = 0) => {
      log(`🔩 Setting joints: J1=${j1} J2=${j2} J3=${j3} J4=${j4}`, 'info');
      await animate((t, s) => {
        state.rotation = s.rotation + (j1 - s.rotation) * t;
      });
      log('✅ Joint angles set', 'success');
    },
    move_delta: async (dx = 0, dy = 0, dz = 0) => {
      log(`↗️ Move delta: Δ(${dx}, ${dy}, ${dz})`, 'info');
      await animate((t, s) => {
        state.x = s.x + dx * t;
        state.y = s.y + dy * t;
        state.z = Math.max(0, Math.min(s.z + dz * t, 200));
      });
      log('✅ Delta move done', 'success');
    },
    get_position: async () => {
      const pos = `(${Math.round(state.x)}, ${Math.round(state.y)}, ${Math.round(state.z)}, ${Math.round(state.rotation)})`;
      log(`📐 Position: ${pos}`, 'info');
      return pos;
    },
    move_delta_r: async (dr = 0) => {
      log(`🔄 Rotating end effector by ΔR=${dr}°`, 'info');
      await animate((t, s) => { state.rotation = s.rotation + dr * t; });
      log('✅ End effector rotated', 'success');
    },
    get_joint_angles: async () => {
      updateJointAnglesFromXYZ();
      const angles = `(${Math.round(state.j1)}, ${Math.round(state.j2)}, ${Math.round(state.j3)}, ${Math.round(state.j4)})`;
      log(`🔩 Joint Angles: ${angles}`, 'info');
      return angles;
    },
    emergency_stop: async () => {
      state.emergencyStopped = true;
      stopRequested = true;
      running = false;
      log('🛑 EMERGENCY STOP — All movement halted!', 'error');
      if (canvas) {
        canvas.style.outline = '4px solid #dc2626';
        setTimeout(() => { canvas.style.outline = ''; }, 2000);
      }
    },
    init_color_sensor: async (port) => {
      log(`🎨 Color sensor initialized on GP${port}`, 'info');
    },
    init_infrared: async (port) => {
      log(`📡 Infrared sensor initialized on GP${port}`, 'info');
    },
    init_conveyor: async (port) => {
      log(`🏭 Conveyor belt initialized on STEPPER${port}`, 'info');
    },
    // AI Starter drive commands
    drive_forward: async (mm = 100) => {
      log(`🚗 Driving forward ${mm}mm`, 'info');
      await animate((t, s) => { state.y = s.y + mm * t; });
      log('✅ Done', 'success');
    },
    drive_backward: async (mm = 100) => {
      log(`🚗 Driving backward ${mm}mm`, 'info');
      await animate((t, s) => { state.y = s.y - mm * t; });
      log('✅ Done', 'success');
    },
    turn_left: async (deg = 90) => {
      log(`↩️ Turning left ${deg}°`, 'info');
      await animate((t, s) => { state.rotation = s.rotation + deg * t; });
      log('✅ Done', 'success');
    },
    turn_right: async (deg = 90) => {
      log(`↪️ Turning right ${deg}°`, 'info');
      await animate((t, s) => { state.rotation = s.rotation - deg * t; });
      log('✅ Done', 'success');
    },
    stop_driving: async () => {
      log('⏹️ Wheels stopped', 'info');
    },
  };

  /* ---- Execute a sequence of commands ---- */
  let running = false;
  let stopRequested = false;

  const execute = async (commandList) => {
    if (running) return;
    running = true;
    stopRequested = false;
    state.emergencyStopped = false;
    log('▶️ Starting program...', 'info');

    for (const cmd of commandList) {
      if (stopRequested || state.emergencyStopped) break;
      const fn = commands[cmd.type];
      if (fn) {
        try {
          await fn(...(cmd.args || []));
        } catch (e) {
          log(`❌ Error: ${e.message}`, 'error');
        }
      } else {
        log(`⚠️ Unknown command: ${cmd.type}`, 'warn');
      }
      // Small delay between commands
      await new Promise(r => setTimeout(r, 100));
    }

    if (state.emergencyStopped) {
      log('🛑 Program halted by emergency stop', 'error');
    } else {
      log('⏹️ Program finished', 'info');
    }
    running = false;
  };

  const stop = () => {
    stopRequested = true;
    running = false;
    log('⏹️ Program stopped by user', 'warn');
  };

  const reset = () => {
    state = { x: 0, y: 0, z: 50, rotation: 0, gripper: false, clawOpen: true, speed: 'medium', log: [], conveyorRunning: false, j1: 0, j2: 45, j3: 45, j4: 0, emergencyStopped: false };
    draw();
    renderLog();
    updatePositionDisplay();
  };

  const updatePositionDisplay = () => {
    const el = document.getElementById('sim-position-display');
    if (!el) return;
    // Approximate joint angles from X, Y, Z, R using simplified IK
    updateJointAnglesFromXYZ();
    el.innerHTML = `
      <div class="pos-row"><span class="pos-label">X:</span><span class="pos-value">${Math.round(state.x * 10) / 10}</span><span class="pos-unit">mm</span></div>
      <div class="pos-row"><span class="pos-label">Y:</span><span class="pos-value">${Math.round(state.y * 10) / 10}</span><span class="pos-unit">mm</span></div>
      <div class="pos-row"><span class="pos-label">Z:</span><span class="pos-value">${Math.round(state.z * 10) / 10}</span><span class="pos-unit">mm</span></div>
      <div class="pos-row"><span class="pos-label">R:</span><span class="pos-value">${Math.round(state.rotation * 10) / 10}</span><span class="pos-unit">°</span></div>
      <div class="pos-row" style="border-top:1px solid #e2e8f0;padding-top:4px;margin-top:4px;"><span class="pos-label">J1:</span><span class="pos-value">${Math.round(state.j1 * 10) / 10}</span><span class="pos-unit">°</span></div>
      <div class="pos-row"><span class="pos-label">J2:</span><span class="pos-value">${Math.round(state.j2 * 10) / 10}</span><span class="pos-unit">°</span></div>
      <div class="pos-row"><span class="pos-label">J3:</span><span class="pos-value">${Math.round(state.j3 * 10) / 10}</span><span class="pos-unit">°</span></div>
      <div class="pos-row"><span class="pos-label">J4:</span><span class="pos-value">${Math.round(state.j4 * 10) / 10}</span><span class="pos-unit">°</span></div>
    `;
  };

  /** Simplified inverse kinematics to approximate joint angles from X,Y,Z */
  const updateJointAnglesFromXYZ = () => {
    // J1 = base rotation (derived from X, Y)
    state.j1 = Math.atan2(state.y, state.x) * (180 / Math.PI);
    // J4 = end effector rotation
    state.j4 = state.rotation;
    // Simplified arm IK (Dobot has L1≈135mm, L2≈147mm)
    const L1 = 135, L2 = 147;
    const reach = Math.sqrt(state.x * state.x + state.y * state.y);
    const h = state.z;
    const d = Math.sqrt(reach * reach + h * h);
    const dClamped = Math.min(d, L1 + L2 - 1);
    if (dClamped > 0) {
      const cosJ3 = (L1 * L1 + L2 * L2 - dClamped * dClamped) / (2 * L1 * L2);
      state.j3 = Math.acos(Math.max(-1, Math.min(1, cosJ3))) * (180 / Math.PI);
      const alpha = Math.atan2(h, reach) * (180 / Math.PI);
      const cosB = (L1 * L1 + dClamped * dClamped - L2 * L2) / (2 * L1 * dClamped);
      const beta = Math.acos(Math.max(-1, Math.min(1, cosB))) * (180 / Math.PI);
      state.j2 = alpha + beta;
    }
  };

  /** Check if a position is within workspace bounds */
  const checkBounds = (x, y, z) => {
    const warnings = [];
    if (x < BOUNDS.X_MIN || x > BOUNDS.X_MAX) warnings.push(`X=${Math.round(x)} out of range [${BOUNDS.X_MIN}, ${BOUNDS.X_MAX}]`);
    if (y < BOUNDS.Y_MIN || y > BOUNDS.Y_MAX) warnings.push(`Y=${Math.round(y)} out of range [${BOUNDS.Y_MIN}, ${BOUNDS.Y_MAX}]`);
    if (z < BOUNDS.Z_MIN || z > BOUNDS.Z_MAX) warnings.push(`Z=${Math.round(z)} out of range [${BOUNDS.Z_MIN}, ${BOUNDS.Z_MAX}]`);
    return warnings;
  };

  /** Clamp values to safe workspace bounds */
  const clampToBounds = (x, y, z) => ({
    x: Math.max(BOUNDS.X_MIN, Math.min(BOUNDS.X_MAX, x)),
    y: Math.max(BOUNDS.Y_MIN, Math.min(BOUNDS.Y_MAX, y)),
    z: Math.max(BOUNDS.Z_MIN, Math.min(BOUNDS.Z_MAX, z)),
  });

  const getState = () => ({ ...state });

  /* ---- Init ---- */
  const init = (canvasId) => {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width  = rect.width  + 'px';
    canvas.style.height = rect.height + 'px';

    draw();

    // D-pad button bindings
    const bindDpad = (id, type, args) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => execute([{ type, args }]));
    };
    bindDpad('dpad-up',    'move_forward',  [15]);
    bindDpad('dpad-down',  'move_backward', [15]);
    bindDpad('dpad-left',  'move_left',     [15]);
    bindDpad('dpad-right', 'move_right',    [15]);
    bindDpad('dpad-up2',   'move_up',       [10]);
    bindDpad('dpad-down2', 'move_down',     [10]);
    bindDpad('dpad-home',  'move_home',     []);
    bindDpad('btn-grab',   'grab',          []);
    bindDpad('btn-release','release',       []);

    log('🤖 Simulator ready', 'success');
    return commands;
  };

  return { init, execute, stop, reset, log, commands, getState, updatePositionDisplay };
})();
