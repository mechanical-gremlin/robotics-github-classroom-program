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
      log(`📍 Moving to (${x}, ${y}, ${z})`, 'info');
      await animate((t, s) => {
        state.x = s.x + (x - s.x) * t;
        state.y = s.y + (y - s.y) * t;
        state.z = s.z + (z - s.z) * t;
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
  };

  /* ---- Execute a sequence of commands ---- */
  let running = false;
  let stopRequested = false;

  const execute = async (commandList) => {
    if (running) return;
    running = true;
    stopRequested = false;
    log('▶️ Starting program...', 'info');

    for (const cmd of commandList) {
      if (stopRequested) break;
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

    log('⏹️ Program finished', 'info');
    running = false;
  };

  const stop = () => {
    stopRequested = true;
    running = false;
    log('⏹️ Program stopped by user', 'warn');
  };

  const reset = () => {
    state = { x: 0, y: 0, z: 50, rotation: 0, gripper: false, clawOpen: true, speed: 'medium', log: [] };
    draw();
    renderLog();
  };

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

  return { init, execute, stop, reset, log, commands };
})();
