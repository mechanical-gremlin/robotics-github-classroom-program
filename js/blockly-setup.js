/**
 * Blockly Setup + Dobot Robot Blocks + VEX V5 Blocks
 * Configures Blockly with simplified, student-friendly robot commands.
 * Robots supported: Dobot Magician, Dobot AI Starter, Dobot Magician AI, VEX V5
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
    sensor:    '#0d9488',
    conveyor:  '#7c3aed',
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
        this.appendValueInput('R').setCheck('Number').appendField('R:');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm to exact X, Y, Z coordinates with end-effector rotation R (degrees).');
      }
    };

    Blockly.Blocks['dobot_set_joint_angles'] = {
      init() {
        this.appendDummyInput().appendField('🔩 Set Joint Angles');
        this.appendValueInput('J1').setCheck('Number').appendField('J1:');
        this.appendValueInput('J2').setCheck('Number').appendField('J2:');
        this.appendValueInput('J3').setCheck('Number').appendField('J3:');
        this.appendValueInput('J4').setCheck('Number').appendField('J4:');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot by setting the four joint angles (degrees) directly.');
      }
    };

    Blockly.Blocks['dobot_move_delta'] = {
      init() {
        this.appendDummyInput().appendField('↗️ Move Delta');
        this.appendValueInput('DX').setCheck('Number').appendField('ΔX:');
        this.appendValueInput('DY').setCheck('Number').appendField('ΔY:');
        this.appendValueInput('DZ').setCheck('Number').appendField('ΔZ:');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Move the robot arm relative to its current position by the given deltas.');
      }
    };

    Blockly.Blocks['dobot_get_position'] = {
      init() {
        this.appendDummyInput()
          .appendField('📐 Get Current Position');
        this.setOutput(true, 'String');
        this.setColour(COLORS.movement);
        this.setTooltip('Returns the current robot position as (x, y, z, r).');
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

    // ── SENSOR BLOCKS ──────────────────────────────────────────────────────

    Blockly.Blocks['dobot_read_color_sensor'] = {
      init() {
        this.appendDummyInput()
          .appendField('🎨 Read Color Sensor on GP Port')
          .appendField(new Blockly.FieldDropdown([
            ['GP1','1'],['GP2','2'],['GP4','4'],['GP5','5'],
          ]), 'PORT');
        this.setOutput(true, 'String');
        this.setColour(COLORS.sensor);
        this.setTooltip('Read the color sensor on the specified GP port. Returns the detected color (e.g., "red", "green", "blue").');
      }
    };

    Blockly.Blocks['dobot_read_infrared'] = {
      init() {
        this.appendDummyInput()
          .appendField('📡 Read Infrared Sensor on GP Port')
          .appendField(new Blockly.FieldDropdown([
            ['GP1','1'],['GP2','2'],['GP4','4'],['GP5','5'],
          ]), 'PORT');
        this.setOutput(true, 'Number');
        this.setColour(COLORS.sensor);
        this.setTooltip('Read the infrared sensor distance value (mm) on the specified GP port.');
      }
    };

    Blockly.Blocks['dobot_infrared_detected'] = {
      init() {
        this.appendDummyInput()
          .appendField('📡 Infrared Object Detected? on GP Port')
          .appendField(new Blockly.FieldDropdown([
            ['GP1','1'],['GP2','2'],['GP4','4'],['GP5','5'],
          ]), 'PORT');
        this.setOutput(true, 'Boolean');
        this.setColour(COLORS.sensor);
        this.setTooltip('Returns true if the infrared sensor on the specified GP port detects an object nearby.');
      }
    };

    // ── CONVEYOR BELT BLOCKS ─────────────────────────────────────────────

    Blockly.Blocks['dobot_conveyor_speed'] = {
      init() {
        this.appendValueInput('SPEED')
          .setCheck('Number')
          .appendField('🏭 Set Conveyor')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1','1'],['STEPPER2','2'],
          ]), 'PORT')
          .appendField('Speed');
        this.appendDummyInput()
          .appendField('mm/s')
          .appendField(new Blockly.FieldDropdown([
            ['Forward', 'forward'],
            ['Backward', 'backward'],
          ]), 'DIRECTION')
          .appendField('on')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1', '1'],
            ['STEPPER2', '2'],
          ]), 'PORT');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.conveyor);
        this.setTooltip('Set the conveyor belt speed and direction on the selected Stepper port.');
      }
    };

    Blockly.Blocks['dobot_conveyor_stop'] = {
      init() {
        this.appendDummyInput()
          .appendField('⏹️ Stop Conveyor Belt on')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1', '1'],
            ['STEPPER2', '2'],
          ]), 'PORT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.conveyor);
        this.setTooltip('Stop the conveyor belt on the selected Stepper port.');
      }
    };

    Blockly.Blocks['dobot_conveyor_distance'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🏭 Move Conveyor')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1','1'],['STEPPER2','2'],
          ]), 'PORT');
        this.appendDummyInput()
          .appendField('mm')
          .appendField(new Blockly.FieldDropdown([
            ['Forward', 'forward'],
            ['Backward', 'backward'],
          ]), 'DIRECTION')
          .appendField('on')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1', '1'],
            ['STEPPER2', '2'],
          ]), 'PORT');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.conveyor);
        this.setTooltip('Move the conveyor belt a specific distance on the selected Stepper port.');
      }
    };

    // ── DELTA R BLOCK (suction cup motor rotation) ──────────────────────

    Blockly.Blocks['dobot_move_delta_r'] = {
      init() {
        this.appendValueInput('DR')
          .setCheck('Number')
          .appendField('🔄 Rotate End Effector ΔR');
        this.appendDummyInput().appendField('degrees');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Rotate the suction cup / end effector by ΔR degrees (positive = counter-clockwise).');
      }
    };

    Blockly.Blocks['dobot_get_joint_angles'] = {
      init() {
        this.appendDummyInput()
          .appendField('🔩 Get Joint Angles');
        this.setOutput(true, 'String');
        this.setColour(COLORS.movement);
        this.setTooltip('Returns the current joint angles as (J1, J2, J3, J4).');
      }
    };

    // ── PORT INITIALIZATION BLOCKS ─────────────────────────────────────

    Blockly.Blocks['dobot_init_color_sensor'] = {
      init() {
        this.appendDummyInput()
          .appendField('🎨 Init Color Sensor on GP Port')
          .appendField(new Blockly.FieldDropdown([
            ['GP1','1'],['GP2','2'],['GP4','4'],['GP5','5'],
          ]), 'PORT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.sensor);
        this.setTooltip('Initialize the color sensor on the specified GP (General Purpose) port.');
      }
    };

    Blockly.Blocks['dobot_init_infrared'] = {
      init() {
        this.appendDummyInput()
          .appendField('📡 Init Infrared Sensor on GP Port')
          .appendField(new Blockly.FieldDropdown([
            ['GP1','1'],['GP2','2'],['GP4','4'],['GP5','5'],
          ]), 'PORT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.sensor);
        this.setTooltip('Initialize the infrared sensor on the specified GP (General Purpose) port.');
      }
    };

    Blockly.Blocks['dobot_init_conveyor'] = {
      init() {
        this.appendDummyInput()
          .appendField('🏭 Init Conveyor Belt on Stepper Port')
          .appendField(new Blockly.FieldDropdown([
            ['STEPPER1','1'],['STEPPER2','2'],
          ]), 'PORT');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.conveyor);
        this.setTooltip('Initialize the conveyor belt on the specified Stepper motor port.');
      }
    };

    // ── EMERGENCY STOP BLOCK ───────────────────────────────────────────

    Blockly.Blocks['dobot_emergency_stop'] = {
      init() {
        this.appendDummyInput()
          .appendField('🛑 Emergency Stop');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#dc2626');
        this.setTooltip('Immediately stop all robot movement and disable motors.');
      }
    };

    // ── AI STARTER DRIVE BLOCKS ────────────────────────────────────────

    Blockly.Blocks['ai_starter_drive_forward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🚗 Drive Forward');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Drive the AI Starter robot forward by the given distance.');
      }
    };

    Blockly.Blocks['ai_starter_drive_backward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🚗 Drive Backward');
        this.appendDummyInput().appendField('mm');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Drive the AI Starter robot backward by the given distance.');
      }
    };

    Blockly.Blocks['ai_starter_turn'] = {
      init() {
        this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('↩️ Turn')
          .appendField(new Blockly.FieldDropdown([
            ['Left', 'left'],
            ['Right', 'right'],
          ]), 'DIRECTION');
        this.appendDummyInput().appendField('degrees');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Turn the AI Starter robot left or right by the given angle.');
      }
    };

    Blockly.Blocks['ai_starter_stop'] = {
      init() {
        this.appendDummyInput()
          .appendField('⏹️ Stop Driving');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.movement);
        this.setTooltip('Stop the AI Starter robot wheels.');
      }
    };

    // ── VEX V5 BLOCKS ─────────────────────────────────────────────────

    Blockly.Blocks['vex_drive_forward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🚗 VEX Drive Forward');
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['inches', 'INCHES'],
            ['mm', 'MM'],
            ['cm', 'CM'],
          ]), 'UNITS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Drive the VEX V5 robot forward by the given distance.');
      }
    };

    Blockly.Blocks['vex_drive_backward'] = {
      init() {
        this.appendValueInput('DISTANCE')
          .setCheck('Number')
          .appendField('🚗 VEX Drive Backward');
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['inches', 'INCHES'],
            ['mm', 'MM'],
            ['cm', 'CM'],
          ]), 'UNITS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Drive the VEX V5 robot backward by the given distance.');
      }
    };

    Blockly.Blocks['vex_turn'] = {
      init() {
        this.appendValueInput('DEGREES')
          .setCheck('Number')
          .appendField('↩️ VEX Turn')
          .appendField(new Blockly.FieldDropdown([
            ['Left', 'LEFT'],
            ['Right', 'RIGHT'],
          ]), 'DIRECTION');
        this.appendDummyInput().appendField('degrees');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Turn the VEX V5 robot left or right by the given angle.');
      }
    };

    Blockly.Blocks['vex_drive_stop'] = {
      init() {
        this.appendDummyInput()
          .appendField('⏹️ VEX Stop')
          .appendField(new Blockly.FieldDropdown([
            ['Brake', 'BRAKE'],
            ['Coast', 'COAST'],
            ['Hold', 'HOLD'],
          ]), 'MODE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Stop the VEX V5 drivetrain using Brake, Coast, or Hold mode.');
      }
    };

    Blockly.Blocks['vex_drive_speed'] = {
      init() {
        this.appendValueInput('SPEED')
          .setCheck('Number')
          .appendField('⚡ VEX Set Drive Speed');
        this.appendDummyInput().appendField('%');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Set the VEX V5 drivetrain speed (0–100%).');
      }
    };

    Blockly.Blocks['vex_motor_spin'] = {
      init() {
        this.appendDummyInput()
          .appendField('⚙️ VEX Motor')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],['PORT9','PORT9'],
            ['PORT10','PORT10'],['PORT11','PORT11'],
          ]), 'PORT')
          .appendField('Spin')
          .appendField(new Blockly.FieldDropdown([
            ['Forward', 'FORWARD'],
            ['Reverse', 'REVERSE'],
          ]), 'DIRECTION');
        this.appendValueInput('SPEED')
          .setCheck('Number')
          .appendField('at');
        this.appendDummyInput().appendField('% speed');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Spin a VEX V5 motor on the selected port at the given speed and direction.');
      }
    };

    Blockly.Blocks['vex_motor_stop'] = {
      init() {
        this.appendDummyInput()
          .appendField('⏹️ VEX Motor')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],['PORT9','PORT9'],
            ['PORT10','PORT10'],['PORT11','PORT11'],
          ]), 'PORT')
          .appendField('Stop')
          .appendField(new Blockly.FieldDropdown([
            ['Brake', 'BRAKE'],
            ['Coast', 'COAST'],
            ['Hold', 'HOLD'],
          ]), 'MODE');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Stop a VEX V5 motor on the selected port.');
      }
    };

    Blockly.Blocks['vex_motor_spin_for'] = {
      init() {
        this.appendDummyInput()
          .appendField('⚙️ VEX Motor')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],['PORT9','PORT9'],
            ['PORT10','PORT10'],['PORT11','PORT11'],
          ]), 'PORT')
          .appendField('Spin')
          .appendField(new Blockly.FieldDropdown([
            ['Forward', 'FORWARD'],
            ['Reverse', 'REVERSE'],
          ]), 'DIRECTION');
        this.appendValueInput('AMOUNT')
          .setCheck('Number')
          .appendField('for');
        this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ['degrees', 'DEGREES'],
            ['revolutions', 'TURNS'],
            ['seconds', 'SECONDS'],
          ]), 'UNITS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Spin a VEX V5 motor for a specific amount of degrees, revolutions, or seconds.');
      }
    };

    Blockly.Blocks['vex_sensor_distance'] = {
      init() {
        this.appendDummyInput()
          .appendField('📏 VEX Distance Sensor')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],
          ]), 'PORT');
        this.setOutput(true, 'Number');
        this.setColour(COLORS.vex);
        this.setTooltip('Read the distance value (mm) from the VEX V5 Distance Sensor on the selected port.');
      }
    };

    Blockly.Blocks['vex_sensor_color'] = {
      init() {
        this.appendDummyInput()
          .appendField('🎨 VEX Color Sensor')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],
          ]), 'PORT');
        this.setOutput(true, 'String');
        this.setColour(COLORS.vex);
        this.setTooltip('Read the detected color from the VEX V5 Color Sensor on the selected port.');
      }
    };

    Blockly.Blocks['vex_sensor_bumper'] = {
      init() {
        this.appendDummyInput()
          .appendField('🔘 VEX Bumper Switch')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],
          ]), 'PORT')
          .appendField('pressed?');
        this.setOutput(true, 'Boolean');
        this.setColour(COLORS.vex);
        this.setTooltip('Returns True if the VEX V5 Bumper Switch on the selected port is pressed.');
      }
    };

    Blockly.Blocks['vex_sensor_gyro'] = {
      init() {
        this.appendDummyInput()
          .appendField('🔄 VEX Gyro Heading')
          .appendField(new Blockly.FieldDropdown([
            ['PORT1','PORT1'],['PORT2','PORT2'],['PORT3','PORT3'],
            ['PORT4','PORT4'],['PORT5','PORT5'],['PORT6','PORT6'],
            ['PORT7','PORT7'],['PORT8','PORT8'],
          ]), 'PORT');
        this.setOutput(true, 'Number');
        this.setColour(COLORS.vex);
        this.setTooltip('Read the current heading (0–360°) from the VEX V5 Gyro/Inertial Sensor on the selected port.');
      }
    };

    Blockly.Blocks['vex_wait'] = {
      init() {
        this.appendValueInput('MSEC')
          .setCheck('Number')
          .appendField('⏱️ VEX Wait');
        this.appendDummyInput().appendField('msec');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Pause the VEX program for the given number of milliseconds.');
      }
    };

    Blockly.Blocks['vex_print'] = {
      init() {
        this.appendValueInput('TEXT')
          .setCheck('String')
          .appendField('🖨️ VEX Brain Print');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.vex);
        this.setTooltip('Print a message on the VEX V5 Brain screen.');
      }
    };

    Blockly.Blocks['vex_controller_button'] = {
      init() {
        this.appendDummyInput()
          .appendField('🎮 VEX Controller Button')
          .appendField(new Blockly.FieldDropdown([
            ['A','ButtonA'],['B','ButtonB'],['X','ButtonX'],['Y','ButtonY'],
            ['Up','ButtonUp'],['Down','ButtonDown'],
            ['Left','ButtonLeft'],['Right','ButtonRight'],
            ['L1','ButtonL1'],['L2','ButtonL2'],
            ['R1','ButtonR1'],['R2','ButtonR2'],
          ]), 'BUTTON')
          .appendField('pressed?');
        this.setOutput(true, 'Boolean');
        this.setColour(COLORS.vex);
        this.setTooltip('Returns True if the selected VEX V5 Controller button is currently pressed.');
      }
    };

    Blockly.Blocks['vex_controller_axis'] = {
      init() {
        this.appendDummyInput()
          .appendField('🕹️ VEX Controller Axis')
          .appendField(new Blockly.FieldDropdown([
            ['Axis1 (Right X)', 'Axis1'],
            ['Axis2 (Right Y)', 'Axis2'],
            ['Axis3 (Left Y)', 'Axis3'],
            ['Axis4 (Left X)', 'Axis4'],
          ]), 'AXIS');
        this.setOutput(true, 'Number');
        this.setColour(COLORS.vex);
        this.setTooltip('Read the position (-100 to 100) of a VEX V5 Controller joystick axis.');
      }
    };
  };  // end defineBlocks


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
      const r = P.valueToCode(b, 'R', P.ORDER_NONE) || 0;
      return `robot.move_to(${x}, ${y}, ${z}, ${r})\n`;
    };
    P['dobot_set_joint_angles'] = (b) => {
      const j1 = P.valueToCode(b, 'J1', P.ORDER_NONE) || 0;
      const j2 = P.valueToCode(b, 'J2', P.ORDER_NONE) || 0;
      const j3 = P.valueToCode(b, 'J3', P.ORDER_NONE) || 0;
      const j4 = P.valueToCode(b, 'J4', P.ORDER_NONE) || 0;
      return `robot.set_joint_angles(${j1}, ${j2}, ${j3}, ${j4})\n`;
    };
    P['dobot_move_delta'] = (b) => {
      const dx = P.valueToCode(b, 'DX', P.ORDER_NONE) || 0;
      const dy = P.valueToCode(b, 'DY', P.ORDER_NONE) || 0;
      const dz = P.valueToCode(b, 'DZ', P.ORDER_NONE) || 0;
      return `robot.move_delta(${dx}, ${dy}, ${dz})\n`;
    };
    P['dobot_get_position']  = () => ['robot.get_position()', P.ORDER_FUNCTION_CALL];
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
    P['dobot_read_color_sensor'] = (b) => {
      const port = b.getFieldValue('PORT') || 1;
      return [`robot.read_color_sensor()  # GP${port} (init first with robot.init_color_sensor(${port}))`, P.ORDER_FUNCTION_CALL];
    };
    P['dobot_read_infrared']     = (b) => {
      const port = b.getFieldValue('PORT') || 1;
      return [`robot.read_infrared()  # GP${port} (init first with robot.init_infrared(${port}))`, P.ORDER_FUNCTION_CALL];
    };
    P['dobot_infrared_detected'] = (b) => {
      const port = b.getFieldValue('PORT') || 1;
      return [`robot.infrared_detected()  # GP${port} (init first with robot.init_infrared(${port}))`, P.ORDER_FUNCTION_CALL];
    };
    P['dobot_conveyor_speed']    = (b) => {
      const speed = P.valueToCode(b, 'SPEED', P.ORDER_NONE) || 50;
      const dir = b.getFieldValue('DIRECTION');
      const port = b.getFieldValue('PORT') || '1';
      return `robot.conveyor_speed(${speed}, '${dir}', port=${port})\n`;
    };
    P['dobot_conveyor_stop']     = (b) => {
      const port = b.getFieldValue('PORT') || '1';
      return `robot.conveyor_stop(port=${port})\n`;
    };
    P['dobot_conveyor_distance'] = (b) => {
      const dist = P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 100;
      const dir = b.getFieldValue('DIRECTION');
      const port = b.getFieldValue('PORT') || '1';
      return `robot.conveyor_move(${dist}, '${dir}', port=${port})\n`;
    };
    P['dobot_move_delta_r']  = (b) => {
      const dr = P.valueToCode(b, 'DR', P.ORDER_NONE) || 0;
      return `robot.move_delta_r(${dr})\n`;
    };
    P['dobot_get_joint_angles'] = () => ['robot.get_joint_angles()', P.ORDER_FUNCTION_CALL];
    P['dobot_init_color_sensor'] = (b) => `robot.init_color_sensor(${b.getFieldValue('PORT')})\n`;
    P['dobot_init_infrared']     = (b) => `robot.init_infrared(${b.getFieldValue('PORT')})\n`;
    P['dobot_init_conveyor']     = (b) => `robot.init_conveyor(${b.getFieldValue('PORT')})\n`;
    P['dobot_emergency_stop']    = () => 'robot.emergency_stop()\n';
    P['ai_starter_drive_forward']  = (b) => `robot.drive_forward(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 100})\n`;
    P['ai_starter_drive_backward'] = (b) => `robot.drive_backward(${P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 100})\n`;
    P['ai_starter_turn'] = (b) => {
      const dir = b.getFieldValue('DIRECTION');
      const deg = P.valueToCode(b, 'DEGREES', P.ORDER_NONE) || 90;
      return `robot.turn_${dir}(${deg})\n`;
    };
    P['ai_starter_stop'] = () => 'robot.stop_driving()\n';

    // ── VEX V5 generators ───────────────────────────────────────────────
    P['vex_drive_forward']  = (b) => {
      const dist = P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 12;
      const units = b.getFieldValue('UNITS');
      return `drivetrain.drive_for(FORWARD, ${dist}, ${units})\n`;
    };
    P['vex_drive_backward'] = (b) => {
      const dist = P.valueToCode(b, 'DISTANCE', P.ORDER_NONE) || 12;
      const units = b.getFieldValue('UNITS');
      return `drivetrain.drive_for(REVERSE, ${dist}, ${units})\n`;
    };
    P['vex_turn'] = (b) => {
      const dir = b.getFieldValue('DIRECTION');
      const deg = P.valueToCode(b, 'DEGREES', P.ORDER_NONE) || 90;
      return `drivetrain.turn_for(${dir}, ${deg}, DEGREES)\n`;
    };
    P['vex_drive_stop'] = (b) => {
      const mode = b.getFieldValue('MODE');
      return `drivetrain.stop(${mode})\n`;
    };
    P['vex_drive_speed'] = (b) => {
      const spd = P.valueToCode(b, 'SPEED', P.ORDER_NONE) || 50;
      return `drivetrain.set_drive_velocity(${spd}, PERCENT)\n`;
    };
    P['vex_motor_spin'] = (b) => {
      const port = b.getFieldValue('PORT');
      const dir = b.getFieldValue('DIRECTION');
      const spd = P.valueToCode(b, 'SPEED', P.ORDER_NONE) || 50;
      return `Motor(Ports.${port}).spin(${dir}, ${spd}, PERCENT)\n`;
    };
    P['vex_motor_stop'] = (b) => {
      const port = b.getFieldValue('PORT');
      const mode = b.getFieldValue('MODE');
      return `Motor(Ports.${port}).stop(${mode})\n`;
    };
    P['vex_motor_spin_for'] = (b) => {
      const port = b.getFieldValue('PORT');
      const dir = b.getFieldValue('DIRECTION');
      const amt = P.valueToCode(b, 'AMOUNT', P.ORDER_NONE) || 90;
      const units = b.getFieldValue('UNITS');
      return `Motor(Ports.${port}).spin_for(${dir}, ${amt}, ${units})\n`;
    };
    P['vex_sensor_distance'] = (b) => {
      const port = b.getFieldValue('PORT');
      return [`Distance(Ports.${port}).object_distance(MM)`, P.ORDER_FUNCTION_CALL];
    };
    P['vex_sensor_color'] = (b) => {
      const port = b.getFieldValue('PORT');
      return [`Color(Ports.${port}).color()`, P.ORDER_FUNCTION_CALL];
    };
    P['vex_sensor_bumper'] = (b) => {
      const port = b.getFieldValue('PORT');
      return [`Bumper(Ports.${port}).pressing()`, P.ORDER_FUNCTION_CALL];
    };
    P['vex_sensor_gyro'] = (b) => {
      const port = b.getFieldValue('PORT');
      return [`Inertial(Ports.${port}).heading()`, P.ORDER_FUNCTION_CALL];
    };
    P['vex_wait']  = (b) => {
      const ms = P.valueToCode(b, 'MSEC', P.ORDER_NONE) || 1000;
      return `wait(${ms}, MSEC)\n`;
    };
    P['vex_print'] = (b) => {
      const txt = P.valueToCode(b, 'TEXT', P.ORDER_NONE) || '""';
      return `brain.screen.print(${txt})\nbrain.screen.next_row()\n`;
    };
    P['vex_controller_button'] = (b) => {
      const btn = b.getFieldValue('BUTTON');
      return [`controller.${btn}.pressing()`, P.ORDER_FUNCTION_CALL];
    };
    P['vex_controller_axis'] = (b) => {
      const axis = b.getFieldValue('AXIS');
      return [`controller.${axis}.position()`, P.ORDER_FUNCTION_CALL];
    };
  };

  /* ---- Toolbox XML (dynamic based on robot type) ---- */
  const getToolbox = (robotType) => {
    const contents = [];

    // ── VEX V5 robot — completely separate toolbox ──────────────────────
    if (robotType === 'vex_v5') {
      contents.push({
        kind: 'category', name: '🚗 Drivetrain', colour: COLORS.vex,
        contents: [
          { kind: 'block', type: 'vex_drive_forward',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 12 } } } } },
          { kind: 'block', type: 'vex_drive_backward',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 12 } } } } },
          { kind: 'block', type: 'vex_turn',
            inputs: { DEGREES: { block: { type: 'math_number', fields: { NUM: 90 } } } } },
          { kind: 'block', type: 'vex_drive_stop' },
          { kind: 'block', type: 'vex_drive_speed',
            inputs: { SPEED: { block: { type: 'math_number', fields: { NUM: 50 } } } } },
        ]
      });
      contents.push({
        kind: 'category', name: '⚙️ Motors', colour: COLORS.vex,
        contents: [
          { kind: 'block', type: 'vex_motor_spin',
            inputs: { SPEED: { block: { type: 'math_number', fields: { NUM: 50 } } } } },
          { kind: 'block', type: 'vex_motor_stop' },
          { kind: 'block', type: 'vex_motor_spin_for',
            inputs: { AMOUNT: { block: { type: 'math_number', fields: { NUM: 90 } } } } },
        ]
      });
      contents.push({
        kind: 'category', name: '📡 Sensors', colour: COLORS.sensor,
        contents: [
          { kind: 'block', type: 'vex_sensor_distance' },
          { kind: 'block', type: 'vex_sensor_color' },
          { kind: 'block', type: 'vex_sensor_bumper' },
          { kind: 'block', type: 'vex_sensor_gyro' },
        ]
      });
      contents.push({
        kind: 'category', name: '🎮 Controller', colour: COLORS.vex,
        contents: [
          { kind: 'block', type: 'vex_controller_button' },
          { kind: 'block', type: 'vex_controller_axis' },
        ]
      });
      contents.push({
        kind: 'category', name: '⏱️ Actions', colour: COLORS.io,
        contents: [
          { kind: 'block', type: 'vex_wait',
            inputs: { MSEC: { block: { type: 'math_number', fields: { NUM: 1000 } } } } },
          { kind: 'block', type: 'vex_print',
            inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hello VEX!' } } } } },
        ]
      });
      // Standard Blockly categories still useful for VEX
      contents.push({ kind: 'sep' });
      contents.push({
        kind: 'category', name: '🔀 Logic', colour: '#5b80a5',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'controls_ifelse' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' },
          { kind: 'block', type: 'logic_boolean' },
        ]
      });
      contents.push({
        kind: 'category', name: '🔁 Loops', colour: COLORS.control,
        contents: [
          { kind: 'block', type: 'controls_repeat_ext',
            inputs: { TIMES: { block: { type: 'math_number', fields: { NUM: 5 } } } } },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' },
        ]
      });
      contents.push({
        kind: 'category', name: '🔢 Math', colour: COLORS.math,
        contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single' },
          { kind: 'block', type: 'math_round' },
          { kind: 'block', type: 'math_random_int' },
        ]
      });
      contents.push({
        kind: 'category', name: '📝 Text', colour: '#64748b',
        contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_join' },
        ]
      });
      contents.push({ kind: 'category', name: '📦 Variables', colour: '#7c3aed', custom: 'VARIABLE' });
      contents.push({ kind: 'category', name: '🧩 Functions', colour: '#9333ea', custom: 'PROCEDURE' });
      return { kind: 'categoryToolbox', contents };
    }

    // ── Dobot / AI Starter toolbox ──────────────────────────────────────

    // ── Movement ──
    let movementBlocks;

    if (robotType === 'ai_starter') {
      // AI Starter is a wheeled robot — only drive/turn blocks
      movementBlocks = [
        { kind: 'block', type: 'ai_starter_drive_forward',
          inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 100 } } } } },
        { kind: 'block', type: 'ai_starter_drive_backward',
          inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 100 } } } } },
        { kind: 'block', type: 'ai_starter_turn',
          inputs: { DEGREES: { block: { type: 'math_number', fields: { NUM: 90 } } } } },
        { kind: 'block', type: 'ai_starter_stop' },
      ];
    } else {
      // Dobot Magician / Magician+AI — arm movement blocks
      movementBlocks = [
        { kind: 'block', type: 'dobot_move_home' },
        { kind: 'block', type: 'dobot_move_to_point',
          inputs: {
            X: { block: { type: 'math_number', fields: { NUM: 0 } } },
            Y: { block: { type: 'math_number', fields: { NUM: 0 } } },
            Z: { block: { type: 'math_number', fields: { NUM: 0 } } },
          }
        },
        { kind: 'block', type: 'dobot_move_delta',
          inputs: {
            DX: { block: { type: 'math_number', fields: { NUM: 0 } } },
            DY: { block: { type: 'math_number', fields: { NUM: 0 } } },
            DZ: { block: { type: 'math_number', fields: { NUM: 0 } } },
          }
        },
        { kind: 'block', type: 'dobot_move_delta_r',
          inputs: { DR: { block: { type: 'math_number', fields: { NUM: 0 } } } } },
        { kind: 'block', type: 'dobot_set_joint_angles',
          inputs: {
            J1: { block: { type: 'math_number', fields: { NUM: 0 } } },
            J2: { block: { type: 'math_number', fields: { NUM: 0 } } },
            J3: { block: { type: 'math_number', fields: { NUM: 0 } } },
            J4: { block: { type: 'math_number', fields: { NUM: 0 } } },
          }
        },
        { kind: 'block', type: 'dobot_rotate',
          inputs: { DEGREES: { block: { type: 'math_number', fields: { NUM: 45 } } } } },
        { kind: 'block', type: 'dobot_get_position' },
        { kind: 'block', type: 'dobot_get_joint_angles' },
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
      ];
    }

    contents.push({
      kind: 'category', name: '🏠 Movement', colour: COLORS.movement,
      contents: movementBlocks,
    });

    // ── Gripper (arm robots only) ──
    if (robotType !== 'ai_starter') {
      contents.push({
        kind: 'category', name: '✋ Gripper', colour: COLORS.gripper,
        contents: [
          { kind: 'block', type: 'dobot_grab' },
          { kind: 'block', type: 'dobot_release' },
          { kind: 'block', type: 'dobot_claw_open' },
          { kind: 'block', type: 'dobot_claw_close' },
        ]
      });
    }

    // ── Speed ──
    contents.push({
      kind: 'category', name: '⚡ Speed', colour: COLORS.speed,
      contents: [
        { kind: 'block', type: 'dobot_set_speed' },
      ]
    });

    // ── Actions / I/O ──
    contents.push({
      kind: 'category', name: '⏱️ Actions', colour: COLORS.io,
      contents: [
        { kind: 'block', type: 'dobot_wait',
          inputs: { SECONDS: { block: { type: 'math_number', fields: { NUM: 1 } } } } },
        { kind: 'block', type: 'dobot_beep' },
        { kind: 'block', type: 'dobot_print',
          inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hello!' } } } } },
        { kind: 'block', type: 'dobot_light_on' },
        { kind: 'block', type: 'dobot_emergency_stop' },
      ]
    });

    // ── AI Features (only for ai_starter and magician_ai) ──
    if (robotType === 'ai_starter' || robotType === 'magician_ai') {
      contents.push({
        kind: 'category', name: '🤖 AI Features', colour: COLORS.ai,
        contents: [
          { kind: 'block', type: 'dobot_ai_detect_object' },
          { kind: 'block', type: 'dobot_ai_color_detect' },
          { kind: 'block', type: 'dobot_ai_face_detect' },
          { kind: 'block', type: 'dobot_ai_follow_line' },
          { kind: 'block', type: 'dobot_ai_grab_detected' },
        ]
      });
    }

    // ── Sensors (arm robots) ──
    if (robotType !== 'ai_starter') {
      contents.push({
        kind: 'category', name: '📡 Sensors', colour: COLORS.sensor,
        contents: [
          { kind: 'block', type: 'dobot_init_color_sensor' },
          { kind: 'block', type: 'dobot_init_infrared' },
          { kind: 'block', type: 'dobot_read_color_sensor' },
          { kind: 'block', type: 'dobot_read_infrared' },
          { kind: 'block', type: 'dobot_infrared_detected' },
        ]
      });
    }

    // ── Conveyor Belt (arm robots) ──
    if (robotType !== 'ai_starter') {
      contents.push({
        kind: 'category', name: '🏭 Conveyor Belt', colour: COLORS.conveyor,
        contents: [
          { kind: 'block', type: 'dobot_init_conveyor' },
          { kind: 'block', type: 'dobot_conveyor_speed',
            inputs: { SPEED: { block: { type: 'math_number', fields: { NUM: 50 } } } } },
          { kind: 'block', type: 'dobot_conveyor_stop' },
          { kind: 'block', type: 'dobot_conveyor_distance',
            inputs: { DISTANCE: { block: { type: 'math_number', fields: { NUM: 100 } } } } },
        ]
      });
    }

    // Separator
    contents.push({ kind: 'sep' });

    // ── Logic (conditionals, comparisons, booleans) ──
    contents.push({
      kind: 'category', name: '🔀 Logic', colour: '#5b80a5',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_ifelse' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' },
      ]
    });

    // ── Control (loops) ──
    contents.push({
      kind: 'category', name: '🔁 Loops', colour: COLORS.control,
      contents: [
        { kind: 'block', type: 'controls_repeat_ext',
          inputs: { TIMES: { block: { type: 'math_number', fields: { NUM: 5 } } } } },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
      ]
    });

    // ── Math ──
    contents.push({
      kind: 'category', name: '🔢 Math', colour: COLORS.math,
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_round' },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_constrain',
          inputs: {
            LOW: { block: { type: 'math_number', fields: { NUM: 0 } } },
            HIGH: { block: { type: 'math_number', fields: { NUM: 200 } } },
          }
        },
        { kind: 'block', type: 'math_random_int' },
      ]
    });

    // ── Text ──
    contents.push({
      kind: 'category', name: '📝 Text', colour: '#64748b',
      contents: [
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_print' },
      ]
    });

    // ── Variables ──
    contents.push({
      kind: 'category', name: '📦 Variables', colour: '#7c3aed',
      custom: 'VARIABLE',
    });

    // ── Functions (custom functions with inputs) ──
    contents.push({
      kind: 'category', name: '🧩 Functions', colour: '#9333ea',
      custom: 'PROCEDURE',
    });

    return { kind: 'categoryToolbox', contents };
  };

  let _currentRobotType = 'magician';

  /* ---- Initialize Blockly workspace ---- */
  const init = (containerId, robotType) => {
    _currentRobotType = robotType || 'magician';
    defineBlocks();
    defineGenerators();

    const toolbox = getToolbox(_currentRobotType);

    workspace = Blockly.inject(containerId, {
      toolbox: toolbox,
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
      addStarterBlocks(_currentRobotType);
    }

    _currentRobotType = robotType || 'magician';

    return workspace;
  };

  /** Update the toolbox when robot type changes */
  const updateToolbox = (robotType) => {
    _currentRobotType = robotType || 'magician';
    if (!workspace) return;
    const toolbox = getToolbox(_currentRobotType);
    workspace.updateToolbox(toolbox);
  };

  const addStarterBlocks = (robotType) => {
    const rt = robotType || _currentRobotType || 'magician';
    const starterType = (rt === 'vex_v5') ? 'vex_drive_forward'
      : (rt === 'ai_starter') ? 'ai_starter_drive_forward'
      : 'dobot_move_home';
    const xml = Blockly.utils.xml.textToDom(`
      <xml>
        <block type="${starterType}" x="40" y="40"></block>
      </xml>
    `);
    Blockly.Xml.domToWorkspace(xml, workspace);
  };

  const getWorkspace  = () => workspace;

  const getPythonCode = () => {
    if (!workspace) return '';
    try {
      const code = Blockly.Python.workspaceToCode(workspace);
      if (_currentRobotType === 'vex_v5') {
        return [
          '# Auto-generated VEX V5 Python code from Blockly blocks',
          '# Run this file using VEXcode V5 or the VEX VS Code extension.',
          'from vex import *',
          '',
          '# --- VEX V5 device setup ---',
          '# Configure your motors and sensors below.',
          '# Adjust port numbers to match your physical wiring.',
          'brain      = Brain()',
          'controller = Controller()',
          '# Drivetrain: left motor on PORT1, right motor on PORT10',
          'left_motor  = Motor(Ports.PORT1,  GearSetting.RATIO18_1, False)',
          'right_motor = Motor(Ports.PORT10, GearSetting.RATIO18_1, True)',
          'drivetrain  = SmartDrive(left_motor, right_motor, Gyro(Ports.PORT2))',
          '',
          '# --- Your program ---',
          code,
        ].join('\n');
      }
      return `# Auto-generated Python code from Blockly blocks\nimport time\nfrom dobot_wrapper import DobotRobot\n\n# Change the port to match your robot's COM port (check Device Manager)\nrobot = DobotRobot(port='${localStorage.getItem('robot_port') || 'COM3'}')\n\n${code}`;
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

  return { init, updateToolbox, getWorkspace, getPythonCode, getWorkspaceXml, loadWorkspaceXml };
})();
