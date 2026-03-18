/**
 * Event Sheet Module
 * Provides a "When [Event] → Do [Action]" visual programming interface.
 * Inspired by Construct 3 / GDevelop event sheet style.
 */
const EventSheet = (() => {

  /* ---- Event and Action definitions ---- */

  const EVENT_TYPES = [
    { id: 'on_start',        icon: '▶️',  label: 'On Program Start',       desc: 'Runs when the program begins',         category: 'Program' },
    { id: 'on_button_a',     icon: '🔴',  label: 'When Button A Pressed',   desc: 'Dobot front-panel button A',           category: 'Input' },
    { id: 'on_button_b',     icon: '🔵',  label: 'When Button B Pressed',   desc: 'Dobot front-panel button B',           category: 'Input' },
    { id: 'on_key_pressed',  icon: '⌨️',  label: 'When Key Pressed',        desc: 'Any keyboard key pressed',            category: 'Input' },
    { id: 'on_object_found', icon: '👁️',  label: 'When Object Detected',    desc: 'AI camera sees an object',            category: 'AI' },
    { id: 'on_color_red',    icon: '🔴',  label: 'When Red Detected',       desc: 'AI camera detects red color',         category: 'AI' },
    { id: 'on_color_blue',   icon: '🔵',  label: 'When Blue Detected',      desc: 'AI camera detects blue color',        category: 'AI' },
    { id: 'on_face_found',   icon: '😊',  label: 'When Face Detected',      desc: 'AI camera detects a face',            category: 'AI' },
    { id: 'on_timer',        icon: '⏱️',  label: 'Every N Seconds',         desc: 'Repeats on a timer interval',         category: 'Timing', param: { label: 'Seconds', default: 2, type: 'number' } },
    { id: 'on_loop',         icon: '🔁',  label: 'Repeat N Times',          desc: 'Repeat a set number of times',        category: 'Control', param: { label: 'Times', default: 5, type: 'number' } },
    { id: 'on_always',       icon: '♾️',  label: 'Always (Loop Forever)',   desc: 'Runs in a continuous loop',           category: 'Control' },
  ];

  const ACTION_TYPES = [
    { id: 'move_home',       icon: '🏠',  label: 'Move to Home',            desc: 'Robot returns to home position',      category: 'Movement' },
    { id: 'move_forward',    icon: '⬆️',  label: 'Move Forward',            desc: 'Move arm forward',                    category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'move_backward',   icon: '⬇️',  label: 'Move Backward',           desc: 'Move arm backward',                   category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'move_left',       icon: '⬅️',  label: 'Move Left',               desc: 'Move arm to the left',                category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'move_right',      icon: '➡️',  label: 'Move Right',              desc: 'Move arm to the right',               category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'move_up',         icon: '🔼',  label: 'Move Up',                 desc: 'Raise the arm',                       category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'move_down',       icon: '🔽',  label: 'Move Down',               desc: 'Lower the arm',                       category: 'Movement', param: { label: 'mm', default: 10, type: 'number' } },
    { id: 'rotate_left',     icon: '↩️',  label: 'Rotate Left',             desc: 'Rotate arm left',                     category: 'Movement', param: { label: 'degrees', default: 45, type: 'number' } },
    { id: 'rotate_right',    icon: '↪️',  label: 'Rotate Right',            desc: 'Rotate arm right',                    category: 'Movement', param: { label: 'degrees', default: 45, type: 'number' } },
    { id: 'grab',            icon: '🟣',  label: 'Grab (Suction ON)',       desc: 'Turn on suction cup',                 category: 'Gripper' },
    { id: 'release',         icon: '⚪',  label: 'Release (Suction OFF)',   desc: 'Turn off suction cup',                category: 'Gripper' },
    { id: 'claw_open',       icon: '✋',  label: 'Open Claw',               desc: 'Open the claw gripper',               category: 'Gripper' },
    { id: 'claw_close',      icon: '✊',  label: 'Close Claw',              desc: 'Close the claw gripper',              category: 'Gripper' },
    { id: 'set_speed_slow',  icon: '🐢',  label: 'Set Speed: Slow',         desc: 'Switch to slow speed',                category: 'Speed' },
    { id: 'set_speed_med',   icon: '🚶',  label: 'Set Speed: Medium',       desc: 'Switch to medium speed',              category: 'Speed' },
    { id: 'set_speed_fast',  icon: '🚀',  label: 'Set Speed: Fast',         desc: 'Switch to fast speed',                category: 'Speed' },
    { id: 'wait',            icon: '⏳',  label: 'Wait',                    desc: 'Pause execution',                     category: 'Control', param: { label: 'seconds', default: 1, type: 'number' } },
    { id: 'beep',            icon: '🔔',  label: 'Beep',                    desc: 'Make the robot beep',                 category: 'Actions' },
    { id: 'light_on',        icon: '💡',  label: 'Light ON',                desc: 'Turn indicator light on',             category: 'Actions' },
    { id: 'light_off',       icon: '🔦',  label: 'Light OFF',               desc: 'Turn indicator light off',            category: 'Actions' },
    { id: 'print_msg',       icon: '💬',  label: 'Show Message',            desc: 'Display text in output',              category: 'Actions', param: { label: 'message', default: 'Hello!', type: 'text' } },
    { id: 'ai_grab',         icon: '🤖',  label: 'AI Grab Object',          desc: 'Grab what the AI camera sees',        category: 'AI' },
    { id: 'ai_follow_line',  icon: '📏',  label: 'AI Follow Line',          desc: 'Activate line-following mode',        category: 'AI' },
    { id: 'save_to_github',  icon: '💾',  label: 'Save to GitHub',          desc: 'Push current work to GitHub',         category: 'GitHub' },
  ];

  /* ---- State ---- */
  let rows = [];
  let container = null;
  let onChangeCb = null;
  let nextId = 1;

  /* ---- Helpers ---- */
  const findEvent  = (id) => EVENT_TYPES.find(e => e.id === id);
  const findAction = (id) => ACTION_TYPES.find(a => a.id === id);

  /* ---- Render ---- */
  const render = () => {
    if (!container) return;
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'event-sheet-header';
    header.innerHTML = `
      <div>
        <div class="section-title">⚡ Event Sheet</div>
        <div class="section-subtitle">Build your robot program by connecting events to actions</div>
      </div>
    `;
    container.appendChild(header);

    if (rows.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <div class="empty-state-icon">⚡</div>
        <div class="empty-state-title">No Events Yet</div>
        <div class="empty-state-desc">Click "Add Event" to start building your robot program.</div>
      `;
      container.appendChild(empty);
    }

    rows.forEach((row, idx) => {
      const ev = findEvent(row.eventId);
      container.appendChild(renderRow(row, ev, idx));
    });

    // Add Event button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-event-btn';
    addBtn.innerHTML = '➕ Add Event';
    addBtn.addEventListener('click', () => showEventPicker());
    container.appendChild(addBtn);

    if (onChangeCb) onChangeCb(rows);
  };

  const renderRow = (row, ev, idx) => {
    const div = document.createElement('div');
    div.className = 'event-row';
    div.dataset.rowId = row.id;

    // Event condition header
    const cond = document.createElement('div');
    cond.className = 'event-condition';
    cond.innerHTML = `
      <div class="event-condition-label">
        <span class="event-condition-icon">${ev ? ev.icon : '❓'}</span>
        <span>${ev ? ev.label : 'Unknown Event'}</span>
        ${row.eventParam !== undefined
          ? `<input type="${ev.param && ev.param.type === 'text' ? 'text' : 'number'}"
               value="${row.eventParam}"
               data-row="${row.id}"
               data-field="param"
               class="form-control rounded"
               style="width:60px;padding:3px 8px;font-size:12px;margin-left:8px;"
               title="${ev.param ? ev.param.label : ''}">`
          : ''}
      </div>
      <div style="flex:1"></div>
      <button class="btn btn-ghost btn-icon" title="Delete event" data-delete-row="${row.id}">🗑️</button>
    `;
    cond.querySelector(`[data-delete-row]`)?.addEventListener('click', () => removeRow(row.id));
    cond.querySelector(`input[data-field="param"]`)?.addEventListener('input', (e) => {
      row.eventParam = ev.param.type === 'number' ? Number(e.target.value) : e.target.value;
      if (onChangeCb) onChangeCb(rows);
    });
    div.appendChild(cond);

    // Actions list
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'event-actions';

    row.actions.forEach((action, aIdx) => {
      const act = findAction(action.id);
      const item = document.createElement('div');
      item.className = 'event-action-item';
      item.innerHTML = `
        <span class="event-action-icon">${act ? act.icon : '❓'}</span>
        <span style="flex:1;font-size:13px;font-weight:600;">${act ? act.label : action.id}</span>
        ${action.param !== undefined
          ? `<input type="${act.param && act.param.type === 'text' ? 'text' : 'number'}"
               value="${action.param}"
               class="form-control rounded"
               style="width:70px;padding:3px 8px;font-size:12px;"
               title="${act && act.param ? act.param.label : ''}">`
          : ''}
        <button class="btn btn-ghost btn-icon" title="Remove action" style="font-size:14px;padding:4px;">✕</button>
      `;
      item.querySelector('input')?.addEventListener('input', (e) => {
        action.param = act.param.type === 'number' ? Number(e.target.value) : e.target.value;
        if (onChangeCb) onChangeCb(rows);
      });
      item.querySelector('button').addEventListener('click', () => {
        row.actions.splice(aIdx, 1);
        render();
      });
      actionsDiv.appendChild(item);
    });

    // Add action button
    const addAct = document.createElement('button');
    addAct.className = 'add-action-btn';
    addAct.innerHTML = '  ➕ Add Action';
    addAct.style.justifyContent = 'flex-start';
    addAct.addEventListener('click', () => showActionPicker(row));
    actionsDiv.appendChild(addAct);
    div.appendChild(actionsDiv);

    return div;
  };

  /* ---- Pickers (Modal) ---- */
  const showEventPicker = () => {
    const categories = [...new Set(EVENT_TYPES.map(e => e.category))];
    let html = '';
    categories.forEach(cat => {
      html += `<div class="text-xs text-muted fw-700 mb-2 mt-3" style="text-transform:uppercase;letter-spacing:1px;">${cat}</div>`;
      html += '<div class="picker-grid">';
      EVENT_TYPES.filter(e => e.category === cat).forEach(ev => {
        html += `
          <div class="picker-item" data-event-id="${ev.id}" title="${ev.desc}">
            <div class="picker-item-icon">${ev.icon}</div>
            <div class="picker-item-label">${ev.label}</div>
          </div>`;
      });
      html += '</div>';
    });

    showModal('Choose an Event', html, (modalEl) => {
      modalEl.querySelectorAll('.picker-item').forEach(item => {
        item.addEventListener('click', () => {
          const evId = item.dataset.eventId;
          const ev = findEvent(evId);
          addRow(evId, ev && ev.param ? ev.param.default : undefined);
          closeModal();
        });
      });
    });
  };

  const showActionPicker = (row) => {
    const categories = [...new Set(ACTION_TYPES.map(a => a.category))];
    let html = '';
    categories.forEach(cat => {
      html += `<div class="text-xs text-muted fw-700 mb-2 mt-3" style="text-transform:uppercase;letter-spacing:1px;">${cat}</div>`;
      html += '<div class="picker-grid">';
      ACTION_TYPES.filter(a => a.category === cat).forEach(act => {
        html += `
          <div class="picker-item" data-action-id="${act.id}" title="${act.desc}">
            <div class="picker-item-icon">${act.icon}</div>
            <div class="picker-item-label">${act.label}</div>
          </div>`;
      });
      html += '</div>';
    });

    showModal('Choose an Action', html, (modalEl) => {
      modalEl.querySelectorAll('.picker-item').forEach(item => {
        item.addEventListener('click', () => {
          const actId = item.dataset.actionId;
          const act = findAction(actId);
          row.actions.push({
            id: actId,
            param: act && act.param ? act.param.default : undefined,
          });
          closeModal();
          render();
        });
      });
    });
  };

  let currentModal = null;

  const showModal = (title, bodyHtml, setupCb) => {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:640px;">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="btn btn-ghost btn-icon" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
          ${bodyHtml}
        </div>
      </div>
    `;
    overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    currentModal = overlay;
    if (setupCb) setupCb(overlay);
  };

  const closeModal = () => {
    if (currentModal) {
      currentModal.remove();
      currentModal = null;
    }
  };

  /* ---- Row Management ---- */
  const addRow = (eventId, eventParam) => {
    rows.push({ id: nextId++, eventId, eventParam, actions: [] });
    render();
  };

  const removeRow = (id) => {
    rows = rows.filter(r => r.id !== id);
    render();
  };

  /* ---- Code Generation ---- */
  const toPython = () => {
    const lines = [
      '# Auto-generated Python code from Event Sheet',
      'import time',
      'from dobot_wrapper import DobotRobot',
      '',
      'robot = DobotRobot()',
      '',
    ];

    const actionToPython = (action) => {
      const p = action.param !== undefined ? action.param : '';
      switch (action.id) {
        case 'move_home':      return 'robot.move_home()';
        case 'move_forward':   return `robot.move_forward(${p || 10})`;
        case 'move_backward':  return `robot.move_backward(${p || 10})`;
        case 'move_left':      return `robot.move_left(${p || 10})`;
        case 'move_right':     return `robot.move_right(${p || 10})`;
        case 'move_up':        return `robot.move_up(${p || 10})`;
        case 'move_down':      return `robot.move_down(${p || 10})`;
        case 'rotate_left':    return `robot.rotate_left(${p || 45})`;
        case 'rotate_right':   return `robot.rotate_right(${p || 45})`;
        case 'grab':           return 'robot.grab()';
        case 'release':        return 'robot.release()';
        case 'claw_open':      return 'robot.claw_open()';
        case 'claw_close':     return 'robot.claw_close()';
        case 'set_speed_slow': return "robot.set_speed('slow')";
        case 'set_speed_med':  return "robot.set_speed('medium')";
        case 'set_speed_fast': return "robot.set_speed('fast')";
        case 'wait':           return `time.sleep(${p || 1})`;
        case 'beep':           return 'robot.beep()';
        case 'light_on':       return "robot.light('on')";
        case 'light_off':      return "robot.light('off')";
        case 'print_msg':      return `print("${p || 'Hello!'}")`;
        case 'ai_grab':        return 'robot.ai_grab_detected()';
        case 'ai_follow_line': return 'robot.ai_follow_line()';
        case 'save_to_github': return '# [GitHub save handled by application]';
        default:               return `# Unknown action: ${action.id}`;
      }
    };

    rows.forEach((row) => {
      const ev = findEvent(row.eventId);
      const actionLines = row.actions.map(a => `    ${actionToPython(a)}`).join('\n') || '    pass';

      switch (row.eventId) {
        case 'on_start':
          lines.push('# On Start');
          lines.push('def on_start():');
          lines.push(actionLines);
          lines.push('');
          lines.push('on_start()');
          break;
        case 'on_button_a':
          lines.push('# When Button A Pressed');
          lines.push('def on_button_a():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_button('A', on_button_a)");
          break;
        case 'on_button_b':
          lines.push('# When Button B Pressed');
          lines.push('def on_button_b():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_button('B', on_button_b)");
          break;
        case 'on_timer':
          lines.push(`# Every ${row.eventParam || 2} seconds`);
          lines.push('def on_timer():');
          lines.push(actionLines);
          lines.push('');
          lines.push(`robot.every(${row.eventParam || 2}, on_timer)`);
          break;
        case 'on_loop':
          lines.push(`# Repeat ${row.eventParam || 5} times`);
          lines.push(`for _ in range(${row.eventParam || 5}):`);
          lines.push(actionLines);
          break;
        case 'on_always':
          lines.push('# Loop forever');
          lines.push('while True:');
          lines.push(actionLines);
          break;
        case 'on_object_found':
          lines.push('# When object detected');
          lines.push('def on_object_found():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_detect('object', on_object_found)");
          break;
        case 'on_color_red':
          lines.push('# When red color detected');
          lines.push('def on_color_red():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_detect_color('red', on_color_red)");
          break;
        case 'on_color_blue':
          lines.push('# When blue color detected');
          lines.push('def on_color_blue():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_detect_color('blue', on_color_blue)");
          break;
        case 'on_face_found':
          lines.push('# When face detected');
          lines.push('def on_face_found():');
          lines.push(actionLines);
          lines.push('');
          lines.push("robot.on_detect('face', on_face_found)");
          break;
        default:
          lines.push(`# ${ev ? ev.label : row.eventId}`);
          lines.push('def event_handler():');
          lines.push(actionLines);
          lines.push('');
          lines.push('event_handler()');
      }
      lines.push('');
    });

    return lines.join('\n');
  };

  const toJSON = () => JSON.stringify(rows, null, 2);

  const fromJSON = (json) => {
    try {
      rows = JSON.parse(json);
      nextId = rows.reduce((max, r) => Math.max(max, r.id + 1), 1);
      render();
    } catch (e) {
      console.error('Failed to load event sheet:', e);
    }
  };

  /* ---- Public Init ---- */
  const init = (containerId, onChange) => {
    container = document.getElementById(containerId);
    onChangeCb = onChange;
    render();
  };

  const clear = () => {
    rows = [];
    render();
  };

  return { init, addRow, removeRow, clear, render, toPython, toJSON, fromJSON };
})();
