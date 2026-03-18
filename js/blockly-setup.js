/**
 * Blockly Setup + Dobot Robot Blocks
 * Configures Blockly with simplified, student-friendly Dobot commands.
 * Robots supported: Dobot Magician, Dobot AI Starter, Dobot Magician AI
 */
const BlocklySetup = (() => {

  let workspace = null;

  /* ---- Color palette for block categories ---- */
  const COLORS = {
    movement:  '#1e40af',
    gripper:   '#6d28d9',
    speed:     '#059669',
    io:        '#d97706',
    ai:        '#dc2626',
    control:   '#0891b2',
    math:      '#4f46e5',
    vex:       '#f59e0b',
  };

  /* ---- Register all custom Dobot blocks ---- */
  const defineBlocks = () => {

    // ── MOVEMENT BLOCKS ──────────────────────────────────────────────────

    Blockly.Blocks['dobot_move_home'] = {
      init() {
        this.appendDummyInput()
          .appendField('🏠 Move Robot to Home Position');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm back to its starting position.');
        this.setHelpUrl('');
      }
    };

    Blockly.Blocks['dobot_move_forward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('⬆️ Move Forward');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm forward by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_move_backward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('⬇️ Move Backward');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm backward by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_move_left'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('⬅️ Move Left');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm to the left by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_move_right'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('➡️ Move Right');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm to the right by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_move_up'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🔼 Move Up');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm up by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_move_down'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🔽 Move Down');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm down by the given distance in millimeters.');
      }
    };

    Blockly.Blocks['dobot_rotate'] = {
      init() {
        this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('🔄 Rotate')
          .appendField(new Blockly.FieldDropdown([
            ['⬅️ Left', 'left'],
            ['➡️ Right', 'right'],
          ]), 'DIRECTION');
        this.appendDummyInput().appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Rotate the robot arm left or right by the given number of degrees.');
      }
    };

    Blockly.Blocks['dobot_move_to_point'] = {
      init() {
        this.appendDummyInput().appendField('📍 Move to Position');
        this.appendValueInput('X').setCheck('Number').appendField('X:');
        this.appendValueInput('Y').setCheck('Number').appendField('Y:');
        this.appendValueInput('Z').setCheck('Number').appendField('Z:');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm to exact X, Y, Z coordinates.');
      }
    };

    // ── GRIPPER / END EFFECTOR BLOCKS ───────────────────────────────────

    Blockly.Blocks['dobot_grab'] = {
      init() {
        this.appendDummyInput()
          .appendField('🟣 Grab Object (Suction ON)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.gripper);
        this.setTooltip('Turn on the suction cup to grab an object.');
      }
    };

    Blockly.Blocks['dobot_release'] = {
      init() {
        this.appendDummyInput()
          .appendField('⚪ Release Object (Suction OFF)');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.gripper);
        this.setTooltip('Turn off the suction cup to release an object.');
      }
    };

    Blockly.Blocks['dobot_claw_open'] = {
      init() {
        this.appendDummyInput()
          .appendField('✋ Open Claw');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.gripper);
        this.setTooltip('Open the claw gripper.');
      }
    };

    Blockly.Blocks['dobot_claw_close'] = {
      init() {
        this.appendDummyInput()
          .appendField('✊ Close Claw');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.gripper);
        this.setTooltip('Close the claw gripper to hold an object.');
      }
    };

    // ── SPEED BLOCKS ─────────────────────────────────────────────────────

    Blockly.Blocks['dobot_set_speed'] = {
      init() {
        this.appendDummyInput()
          .appendField('⚡ Set Robot Speed to')
          .appendField(new Blockly.FieldDropdown([
            ['🐢 Slow',   'slow'],
            ['🚶 Medium', 'medium'],
            ['🚀 Fast',   'fast'],
          ]), 'SPEED');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.speed);
        this.setTooltip('Set the movement speed of the robot.');
      }
    };

    // ── I/O & WAIT BLOCKS ────────────────────────────────────────────────

    Blockly.Blocks['dobot_wait'] = {
      init() {
        this.appendValueInput('SECONDS')
          .setCheck('Number')
          .appendField('⏳ Wait');
        this.appendDummyInput().appendField('seconds');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.io);
        this.setTooltip('Pause the robot for the given number of seconds.');
      }
    };

    Blockly.Blocks['dobot_beep'] = {
      init() {
        this.appendDummyInput().appendField('🔔 Beep');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.io);
        this.setTooltip('Make the robot beep once.');
      }
    };

    Blockly.Blocks['dobot_print'] = {
      init() {
        this.appendValueInput('TEXT')
          .setCheck('String')
          .appendField('💬 Show Message:');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.io);
        this.setTooltip('Show a message in the output log.');
      }
    };

    Blockly.Blocks['dobot_light_on'] = {
      init() {
        this.appendDummyInput()
          .appendField('💡 Turn Light')
          .appendField(new Blockly.FieldDropdown([
            ['ON', 'on'],
            ['OFF', 'off'],
          ]), 'STATE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.io);
        this.setTooltip('Turn the robot indicator light on or off.');
      }
    };

    // ── AI BLOCKS (Dobot AI Starter / AI Kit) ────────────────────────────

    Blockly.Blocks['dobot_ai_detect_object'] = {
      init() {
        this.appendDummyInput()
          .appendField('🤖 Detect Object (AI Camera)');
        this.setOutput(true, 'String');
        this.setColour(COLORS.ai);
        this.setTooltip('Use the AI camera to detect the nearest object. Returns the object name.');
      }
    };

    Blockly.Blocks['dobot_ai_follow_line'] = {
      init() {
        this.appendDummyInput().appendField('📏 Follow Line');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.ai);
        this.setTooltip('Activate line-following mode for the Dobot AI Starter.');
      }
    };

    Blockly.Blocks['dobot_ai_color_detect'] = {
      init() {
        this.appendDummyInput().appendField('🎨 Detected Color');
        this.setOutput(true, 'String');
        this.setColour(COLORS.ai);
        this.setTooltip('Returns the color detected by the AI camera (e.g., "red", "blue", "green").');
      }
    };

    Blockly.Blocks['dobot_ai_face_detect'] = {
      init() {
        this.appendDummyInput().appendField('😊 Face Detected?');
        this.setOutput(true, 'Boolean');
        this.setColour(COLORS.ai);
        this.setTooltip('Returns true if the AI camera detects a face.');
      }
    };

    Blockly.Blocks['dobot_ai_grab_detected'] = {
      init() {
        this.appendDummyInput()
          .appendField('🤖 AI: Grab Detected Object');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.ai);
        this.setTooltip('Automatically move to and grab the object detected by AI camera.');
      }
    };

    // ── VEX BLOCKS ───────────────────────────────────────────────────────

    Blockly.Blocks['vex_drive_forward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🚗 VEX Drive Forward');
        this.appendDummyInput().appendField('inches');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Drive the VEX robot forward by the given number of inches.');
      }
    };

    Blockly.Blocks['vex_turn'] = {
      init() {
        this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('↩️ VEX Turn')
          .appendField(new Blockly.FieldDropdown([
            ['Left', 'left'],
            ['Right', 'right'],
          ]), 'DIRECTION');
        this.appendDummyInput().appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Turn the VEX robot left or right by the given number of degrees.');
      }
    };

    Blockly.Blocks['vex_motor_spin'] = {
      init() {
        this.appendDummyInput()
          .appendField('⚙️ VEX Motor Port')
          .appendField(new Blockly.FieldDropdown([
            ['1','1'],['2','2'],['3','3'],['4','4'],
            ['5','5'],['6','6'],['7','7'],['8','8'],
          ]), 'PORT')
          .appendField('Spin')
          .appendField(new Blockly.FieldDropdown([
            ['Forward', 'fwd'],
            ['Backward', 'rev'],
            ['Stop', 'stop'],
          ]), 'DIRECTION');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Control a VEX motor on the specified port.');
      }
    };
  };

  /* ---- Python code generators for each block ---- */
  const defineGenerators = () => {
    if (typeof Blockly.Python === 'undefined') return;
    const P = Blockly.Python;

    P['dobot_move_home']     = () => 'robot.move_home()\n';
    P['dobot_move_forward']  = (b) => `robot.move_forward(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_move_backward'] = (b) => `robot.move_backward(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_move_left']     = (b) => `robot.move_left(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_move_right']    = (b) => `robot.move_right(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_move_up']       = (b) => `robot.move_up(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_move_down']     = (b) => `robot.move_down(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 10})\n`;
    P['dobot_rotate']        = (b) => {
      const dir = b.getFieldValue('DIRECTION');
      const deg = P.valueToCode(b, 'DEGREES', P.ORDER_NONE) || 45;
      return `robot.rotate_${dir}(${deg})\n`;
    };
    P['dobot_move_to_point'] = (b) => {
      const x = P.valueToCode(b, 'X', P.ORDER_NONE) || 0;
      const y = P.valueToCode(b, 'Y', P.ORDER_NONE) || 0;
      const z = P.valueToCode(b, 'Z', P.ORDER_NONE) || 0;
      return `robot.move_to(${x}, ${y}, ${z})\n`;
    };
    P['dobot_grab']          = () => 'robot.grab()\n';
    P['dobot_release']       = () => 'robot.release()\n';
    P['dobot_claw_open']     = () => 'robot.claw_open()\n';
    P['dobot_claw_close']    = () => 'robot.claw_close()\n';
    P['dobot_set_speed']     = (b) => `robot.set_speed('${b.getFieldValue('SPEED')}')\n`;
    P['dobot_wait']          = (b) => `time.sleep(${P.valueToCode(b, 'SECONDS', P.ORDER_NONE) || 1})\n`;
    P['dobot_beep']          = () => 'robot.beep()\n';
    P['dobot_print']         = (b) => `print(${P.valueToCode(b, 'TEXT', P.ORDER_NONE) || '""'})\n`;
    P['dobot_light_on']      = (b) => `robot.light('${b.getFieldValue('STATE')}')\n`;
    P['dobot_ai_detect_object'] = () => ['robot.ai_detect_object()', P.ORDER_FUNCTION_CALL];
    P['dobot_ai_follow_line']= () => 'robot.ai_follow_line()\n';
    P['dobot_ai_color_detect']= () => ['robot.ai_detect_color()', P.ORDER_FUNCTION_CALL];
    P['dobot_ai_face_detect'] = () => ['robot.ai_detect_face()', P.ORDER_FUNCTION_CALL];
    P['dobot_ai_grab_detected'] = () => 'robot.ai_grab_detected()\n';
    P['vex_drive_forward']   = (b) => `drive_forward(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 12})\n`;
    P['vex_turn']            = (b) => {
      const dir = b.getFieldValue('DIRECTION');
      const deg = P.valueToCode(b, 'DEGREES', P.ORDER_NONE) || 90;
      return `vex_turn_${dir}(${deg})\n`;
    };
    P['vex_motor_spin']      = (b) => `vex_motor(${b.getFieldValue('PORT')}, '${b.getFieldValue('DIRECTION')}')\n`;
  };

  /* ---- Toolbox XML ---- */
  const TOOLBOX = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: '🏠 Movement',
        colour: COLORS.movement,
        contents: [
          { kind: 'block', type: 'dobot_move_home' },
          { kind: 'block', type: 'dobot_move_forward',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_move_backward',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_move_left',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_move_right',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_move_up',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_move_down',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 10 } } } } },
          { kind: 'block', type: 'dobot_rotate',
            inputs: { DEGREES: { block: { type: 'math_number', fields: { NUM: 45 } } } } },
          { kind: 'block', type: 'dobot_move_to_point',
            inputs: {
              X: { block: { type: 'math_number', fields: { NUM: 0 } } },
              Y: { block: { type: 'math_number', fields: { NUM: 0 } } },
              Z: { block: { type: 'math_number', fields: { NUM: 0 } } },
            }
          },
        ]
      },
      {
        kind: 'category',
        name: '✋ Gripper',
        colour: COLORS.gripper,
        contents: [
          { kind: 'block', type: 'dobot_grab' },
          { kind: 'block', type: 'dobot_release' },
          { kind: 'block', type: 'dobot_claw_open' },
          { kind: 'block', type: 'dobot_claw_close' },
        ]
      },
      {
        kind: 'category',
        name: '⚡ Speed',
        colour: COLORS.speed,
        contents: [
          { kind: 'block', type: 'dobot_set_speed' },
        ]
      },
      {
        kind: 'category',
        name: '⏱️ Actions',
        colour: COLORS.io,
        contents: [
          { kind: 'block', type: 'dobot_wait',
            inputs: { SECONDS: { block: { type: 'math_number', fields: { NUM: 1 } } } } },
          { kind: 'block', type: 'dobot_beep' },
          { kind: 'block', type: 'dobot_print',
            inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hello!' } } } } },
          { kind: 'block', type: 'dobot_light_on' },
        ]
      },
      {
        kind: 'category',
        name: '🤖 AI Features',
        colour: COLORS.ai,
        contents: [
          { kind: 'block', type: 'dobot_ai_detect_object' },
          { kind: 'block', type: 'dobot_ai_color_detect' },
          { kind: 'block', type: 'dobot_ai_face_detect' },
          { kind: 'block', type: 'dobot_ai_follow_line' },
          { kind: 'block', type: 'dobot_ai_grab_detected' },
        ]
      },
      {
        kind: 'category',
        name: '🎮 VEX Robot',
        colour: COLORS.vex,
        contents: [
          { kind: 'block', type: 'vex_drive_forward',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 12 } } } } },
          { kind: 'block', type: 'vex_turn',
            inputs: { DEGREES: { block: { type: 'math_number', fields: { NUM: 90 } } } } },
          { kind: 'block', type: 'vex_motor_spin' },
        ]
      },
      { kind: 'sep' },
      {
        kind: 'category', name: '🔁 Control', colour: COLORS.control,
        contents: [
          { kind: 'block', type: 'controls_repeat_ext',
            inputs: { TIMES: { block: { type: 'math_number', fields: { NUM: 5 } } } } },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_ifelse' },
          { kind: 'block', type: 'controls_for' },
        ]
      },
      {
        kind: 'category', name: '🔢 Numbers', colour: COLORS.math,
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_random_int' },
        ]
      },
      {
        kind: 'category', name: '📝 Text', colour: '#64748b',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_join' },
          { kind: 'block', type: 'text_print' },
        ]
      },
      {
        kind: 'category', name: '📦 Variables', colour: '#7c3aed',
        custom: 'VARIABLE',
      },
    ]
  };

  /* ---- Initialize Blockly workspace ---- */
  const init = (containerId) => {
    defineBlocks();
    defineGenerators();

    workspace = Blockly.inject(containerId, {
      toolbox: TOOLBOX,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#e2e8f0',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      theme: {
        name: 'robotics',
        base: Blockly.Themes.Classic,
        fontStyle: { family: 'Inter, system-ui, sans-serif', size: 13 },
      },
    });

    // Add starter block on fresh workspace
    if (workspace.getAllBlocks(false).length === 0) {
      addStarterBlocks();
    }

    return workspace;
  };

  const addStarterBlocks = () => {
    const xml = Blockly.utils.xml.textToDom(`
      <xml>
        <block type="dobot_move_home" x="40" y="40"></block>
      </xml>
    `);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };

  const getWorkspace  = () => workspace;

  const getPythonCode = () => {
    if (!workspace) return '';
    try {
      const code = Blockly.Python.workspaceToCode(workspace);
      return `# Auto-generated Python code from Blockly blocks\nimport time\nfrom dobot_wrapper import DobotRobot\n\nrobot = DobotRobot()\n\n${code}`;
    } catch (e) {
      return `# Could not generate Python code: ${e.message}`;
    }
  };

  const getWorkspaceXml = () => {
    if (!workspace) return '';
    return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  };

  const loadWorkspaceXml = (xmlText) => {
    if (!workspace || !xmlText) return;
    workspace.clear();
    const xml = Blockly.utils.xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };

  return { init, getWorkspace, getPythonCode, getWorkspaceXml, loadWorkspaceXml };
})();
