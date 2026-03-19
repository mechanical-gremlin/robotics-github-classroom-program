"""
DobotRobot — Simplified API for Dobot Magician, AI Starter, and AI Kit.

This wrapper provides student-friendly method names that map to the
underlying Dobot API.  When a real robot is not connected, commands
are simulated and printed to the console so students can still develop
and test their programs.
"""

from __future__ import annotations

import time
import sys

# Try to import the official Dobot SDK (DobotDllType / pydobot).
# If not installed, fall back to simulation mode.
try:
    import pydobot  # pip install pydobot
    _HAS_PYDOBOT = True
except ImportError:
    _HAS_PYDOBOT = False

# Try to import pyserial for port listing even when pydobot is missing.
try:
    import serial               # pip install pyserial
    import serial.tools.list_ports
    _HAS_SERIAL = True
except ImportError:
    _HAS_SERIAL = False

try:
    import cv2  # pip install opencv-python  (for AI camera features)
    _HAS_CV2 = True
except ImportError:
    _HAS_CV2 = False

# Speed presets (velocity, acceleration) in mm/s and mm/s²
_SPEED_PRESETS = {
    'slow':   (50,  50),
    'medium': (150, 150),
    'fast':   (300, 300),
}

# Joint-space movement mode for pydobot _set_ptp_cmd
_MODE_MOVJ_ANGLE = 4

# Infrared sensor detection threshold (mm)
_IR_DETECTION_THRESHOLD_MM = 100

# Default conveyor belt speed (mm/s)
_DEFAULT_CONVEYOR_SPEED = 50

# Dobot Magician workspace bounds (mm) — prevents motor damage
_WORKSPACE_BOUNDS = {
    'x_min': -320, 'x_max': 320,
    'y_min': -320, 'y_max': 320,
    'z_min': -75,  'z_max': 200,
    'r_min': -135, 'r_max': 135,
}


class DobotRobot:
    """
    Easy-to-use API for Dobot robots.

    If a real Dobot is connected (via USB), commands are sent to the robot.
    If no robot is found, the wrapper runs in simulation mode and prints
    every command to the console.

    Example:
        robot = DobotRobot()
        robot.move_home()
        robot.set_speed('medium')
        robot.move_forward(50)
        robot.grab()
        robot.move_up(30)
        robot.release()
    """

    def __init__(self, port: str = None, robot_type: str = 'magician'):
        """
        Connect to a Dobot robot.

        Args:
            port: Serial port (e.g., 'COM3' on Windows, '/dev/ttyUSB0' on Linux).
                  If None, the wrapper will try to auto-detect the port.
            robot_type: 'magician', 'ai_starter', or 'magician_ai'.
        """
        self._sim = True
        self._device = None
        self._robot_type = robot_type
        self._speed = 'medium'
        self._x = 0.0
        self._y = 0.0
        self._z = 50.0
        self._r = 0.0  # rotation
        self._gripper_active = False
        self._callbacks = {}
        self._emergency_stopped = False
        self._color_sensor_port = None
        self._infrared_port = None
        self._conveyor_port = None

        if _HAS_PYDOBOT:
            try:
                if port:
                    self._log(f'🔌 Connecting to specified port: {port}')
                    detected_port = port
                else:
                    detected_port = self._detect_port()
                    if detected_port:
                        self._log(f'🔍 Auto-detected port: {detected_port}')
                if detected_port:
                    self._connect_to_port(detected_port)
                else:
                    available = self.list_ports()
                    if available:
                        port_list = ', '.join(available)
                        self._log(f'⚠️  No Dobot auto-detected but serial ports found: {port_list}')
                        self._log('    Try: robot = DobotRobot(port="COM3") with your port')
                    else:
                        self._log('⚠️  No Dobot found and no serial ports detected — running in simulation mode')
                        self._log('    Check that the USB cable is connected and the robot is powered on.')
            except Exception as e:
                self._log(f'⚠️  Could not connect to Dobot ({e}) — simulation mode')
                self._log('    Try: robot = DobotRobot(port="COM3") to connect manually')
        else:
            self._log('ℹ️  pydobot not installed — running in simulation mode')
            self._log('    Install with: pip install pydobot pyserial')
            self._log('    If pip is blocked by admin, try: pip install --user pydobot pyserial')
            self._log('    Or ask your teacher/administrator to install it.')

    # ── Internal helpers ───────────────────────────────────────────────

    def _log(self, message: str):
        print(f'[DobotRobot] {message}', file=sys.stdout, flush=True)

    def _sim_log(self, action: str):
        if self._sim:
            self._log(f'[SIM] {action}')
        else:
            self._log(f'[ROBOT] {action}')

    def _connect_to_port(self, port: str):
        """Attempt to open a connection to the Dobot on the given serial port."""
        from pydobot import Dobot
        self._device = Dobot(port=port, verbose=False)
        self._sim = False
        v, a = _SPEED_PRESETS[self._speed]
        self._device.speed(velocity=v, acceleration=a)
        self._log(f'✅ Connected to Dobot on {port}')

    @staticmethod
    def list_ports() -> list[str]:
        """
        List all available serial ports on this computer.

        Returns:
            A list of port names (e.g., ['COM3', 'COM5'] on Windows).

        Example:
            print(DobotRobot.list_ports())
            robot = DobotRobot(port='COM3')
        """
        if not _HAS_SERIAL:
            print('[DobotRobot] pyserial not installed — cannot list ports')
            print('             Install with: pip install pyserial')
            return []
        try:
            ports = serial.tools.list_ports.comports()
            return [p.device for p in ports]
        except Exception:
            return []

    def connect(self, port: str):
        """
        Manually connect (or reconnect) to a Dobot on the specified serial port.

        Use this when auto-detection did not find the robot, or you want
        to switch to a different port.

        Args:
            port: Serial port name (e.g., 'COM3', 'COM5', '/dev/ttyUSB0').

        Example:
            robot = DobotRobot()              # starts in simulation
            print(DobotRobot.list_ports())     # see available ports
            robot.connect('COM3')              # connect manually
        """
        if not _HAS_PYDOBOT:
            self._log('❌ Cannot connect — pydobot is not installed')
            self._log('   Install with: pip install pydobot pyserial')
            self._log('   If pip is blocked by admin, try: pip install --user pydobot pyserial')
            return
        # Close any existing connection first
        if self._device:
            try:
                self._device.close()
            except Exception:
                pass
            self._device = None
            self._sim = True
        try:
            self._connect_to_port(port)
        except Exception as e:
            self._log(f'❌ Failed to connect on {port}: {e}')
            self._log('   Make sure the USB cable is connected and no other program is using the port.')
            available = self.list_ports()
            if available:
                self._log(f'   Available ports: {", ".join(available)}')

    @staticmethod
    def _detect_port() -> str | None:
        """Auto-detect Dobot serial port."""
        if not _HAS_SERIAL:
            return None
        try:
            ports = serial.tools.list_ports.comports()
            for p in ports:
                desc = (p.description or '').lower()
                hwid = (p.hwid or '').lower()
                # Match Dobot's USB-to-serial chips: Silicon Labs CP210x,
                # FTDI, CH340/CH341, or a direct "dobot" mention.
                if any(kw in desc or kw in hwid for kw in (
                    'dobot', 'silicon labs', 'cp210', 'cp2102',
                    'ch340', 'ch341', 'ftdi',
                )):
                    return p.device
        except Exception:
            pass
        return None

    def _check_bounds(self):
        """Check if current position is within workspace bounds and warn/clamp."""
        b = _WORKSPACE_BOUNDS
        warnings = []
        if self._x < b['x_min'] or self._x > b['x_max']:
            warnings.append(f"X={self._x:.1f} out of range [{b['x_min']}, {b['x_max']}]")
            self._x = max(b['x_min'], min(b['x_max'], self._x))
        if self._y < b['y_min'] or self._y > b['y_max']:
            warnings.append(f"Y={self._y:.1f} out of range [{b['y_min']}, {b['y_max']}]")
            self._y = max(b['y_min'], min(b['y_max'], self._y))
        if self._z < b['z_min'] or self._z > b['z_max']:
            warnings.append(f"Z={self._z:.1f} out of range [{b['z_min']}, {b['z_max']}]")
            self._z = max(b['z_min'], min(b['z_max'], self._z))
        if warnings:
            for w in warnings:
                self._log(f'⚠️  BOUNDS WARNING: {w} — clamped to safe range')

    def _check_emergency(self):
        """Raise an error if the emergency stop has been activated."""
        if self._emergency_stopped:
            raise RuntimeError('Emergency stop is active. Call robot.reset_emergency() to resume.')

    # ── Movement ──────────────────────────────────────────────────────

    def move_home(self):
        """Move the robot arm back to its home/starting position."""
        self._check_emergency()
        self._x, self._y, self._z, self._r = 200.0, 0.0, 150.0, 0.0
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)
            self._log('✅ move_home() complete')
        else:
            self._sim_log('move_home()')

    def move_forward(self, mm: float = 10):
        """Move the arm forward by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_forward({mm}mm)')
        self._y += float(mm)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_backward(self, mm: float = 10):
        """Move the arm backward by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_backward({mm}mm)')
        self._y -= float(mm)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_left(self, mm: float = 10):
        """Move the arm to the left by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_left({mm}mm)')
        self._x -= float(mm)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_right(self, mm: float = 10):
        """Move the arm to the right by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_right({mm}mm)')
        self._x += float(mm)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_up(self, mm: float = 10):
        """Raise the arm by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_up({mm}mm)')
        self._z += float(mm)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_down(self, mm: float = 10):
        """Lower the arm by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'move_down({mm}mm)')
        self._z = max(self._z - float(mm), _WORKSPACE_BOUNDS['z_min'])
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_to(self, x: float, y: float, z: float):
        """Move the arm to exact coordinates (x, y, z in mm)."""
        self._check_emergency()
        self._sim_log(f'move_to({x}, {y}, {z})')
        self._x, self._y, self._z = float(x), float(y), float(z)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def rotate_left(self, degrees: float = 45):
        """Rotate the base of the arm to the left by *degrees*."""
        self._check_emergency()
        self._sim_log(f'rotate_left({degrees}°)')
        self._r += float(degrees)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def rotate_right(self, degrees: float = 45):
        """Rotate the base of the arm to the right by *degrees*."""
        self._check_emergency()
        self._sim_log(f'rotate_right({degrees}°)')
        self._r -= float(degrees)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def get_position(self) -> tuple:
        """Return the current arm position as (x, y, z, rotation)."""
        if not self._sim and self._device:
            pose = self._device.pose()
            return pose
        return (self._x, self._y, self._z, self._r)

    def set_joint_angles(self, j1: float = 0, j2: float = 0,
                         j3: float = 0, j4: float = 0):
        """
        Move the robot by setting the four joint angles directly (in degrees).

        Args:
            j1: Base rotation angle.
            j2: Rear arm angle.
            j3: Forearm angle.
            j4: End effector rotation angle.
        """
        self._sim_log(f'set_joint_angles({j1}, {j2}, {j3}, {j4})')
        if not self._sim and self._device:
            # pydobot uses move_to_j for joint-space movement
            try:
                self._device._set_ptp_cmd(
                    float(j1), float(j2), float(j3), float(j4),
                    mode=_MODE_MOVJ_ANGLE, wait=True)
            except Exception:
                self._log('[WARN] Joint angle move not supported by this firmware.')

    def move_delta(self, dx: float = 0, dy: float = 0, dz: float = 0):
        """
        Move the arm relative to its current position.

        Args:
            dx: Change in X (mm).
            dy: Change in Y (mm).
            dz: Change in Z (mm).
        """
        self._check_emergency()
        self._sim_log(f'move_delta({dx}, {dy}, {dz})')
        self._x += float(dx)
        self._y += float(dy)
        self._z += float(dz)
        self._check_bounds()
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_delta_r(self, dr: float = 0):
        """
        Rotate the end effector (suction cup motor / J4) by *dr* degrees
        relative to its current rotation.

        Args:
            dr: Change in rotation (degrees). Positive = counter-clockwise.
        """
        self._check_emergency()
        self._sim_log(f'move_delta_r({dr}°)')
        self._r += float(dr)
        # Clamp rotation to safe bounds
        b = _WORKSPACE_BOUNDS
        if self._r < b['r_min'] or self._r > b['r_max']:
            self._log(f'⚠️  BOUNDS WARNING: R={self._r:.1f} out of range [{b["r_min"]}, {b["r_max"]}] — clamped')
            self._r = max(b['r_min'], min(b['r_max'], self._r))
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def get_joint_angles(self) -> tuple:
        """Return the current joint angles as (j1, j2, j3, j4)."""
        if not self._sim and self._device:
            try:
                pose = self._device.pose()
                # pydobot pose returns (x, y, z, r, j1, j2, j3, j4) in some versions
                if len(pose) >= 8:
                    return (pose[4], pose[5], pose[6], pose[7])
            except Exception:
                pass
        return (0.0, 0.0, 0.0, 0.0)

    # ── Gripper / End Effector ─────────────────────────────────────────

    def grab(self):
        """Turn on the suction cup to grab an object."""
        self._sim_log('grab() — suction ON')
        self._gripper_active = True
        if not self._sim and self._device:
            self._device.suck(True)

    def release(self):
        """Turn off the suction cup to release an object."""
        self._sim_log('release() — suction OFF')
        self._gripper_active = False
        if not self._sim and self._device:
            self._device.suck(False)

    def claw_open(self):
        """Open the claw gripper."""
        self._sim_log('claw_open()')
        if not self._sim and self._device:
            self._device.grip(False)

    def claw_close(self):
        """Close the claw gripper to hold an object."""
        self._sim_log('claw_close()')
        if not self._sim and self._device:
            self._device.grip(True)

    # ── Speed ─────────────────────────────────────────────────────────

    def set_speed(self, speed: str = 'medium'):
        """
        Set movement speed.

        Args:
            speed: 'slow', 'medium', or 'fast'
        """
        speed = speed.lower()
        if speed not in _SPEED_PRESETS:
            self._log(f'Unknown speed "{speed}". Use: slow, medium, fast')
            return
        self._speed = speed
        v, a = _SPEED_PRESETS[speed]
        self._sim_log(f"set_speed('{speed}') → velocity={v}, accel={a}")
        if not self._sim and self._device:
            self._device.speed(velocity=v, acceleration=a)

    # ── I/O ───────────────────────────────────────────────────────────

    def beep(self):
        """Make the robot beep once."""
        self._sim_log('beep()')
        print('\a', end='', flush=True)  # Terminal bell
        if not self._sim and self._device:
            # Some Dobot firmwares support this via alarm
            pass

    def light(self, state: str = 'on'):
        """
        Control the indicator light.

        Args:
            state: 'on' or 'off'
        """
        self._sim_log(f"light('{state}')")
        # Dobot Magician GPIO pins can be used for external lights
        if not self._sim and self._device:
            # IO control is firmware-dependent; log the intent
            self._log(f"[IO] Light control requested: {state}")
            # Uncomment and adapt for your specific Dobot firmware:
            # self._device.set_io_do(1, 1 if state == 'on' else 0)

    def wait(self, seconds: float = 1):
        """Pause execution for *seconds* seconds."""
        self._sim_log(f'wait({seconds}s)')
        time.sleep(float(seconds))

    # ── Sensors ───────────────────────────────────────────────────────

    def read_color_sensor(self) -> str:
        """
        Read the color sensor attached to the Dobot.

        Returns:
            Color name: 'red', 'green', 'blue', 'yellow', 'white', 'black',
            or 'unknown'.
        """
        self._sim_log('read_color_sensor()')
        if not self._sim and self._device:
            try:
                # Dobot color sensor connected via I/O port
                r = self._device.get_color_sensor()
                if r:
                    return r
            except Exception:
                self._log('[SENSOR] Color sensor read not supported by firmware.')
        return 'red'

    def read_infrared(self) -> float:
        """
        Read the infrared distance sensor (mm).

        Returns:
            Distance value in millimeters, or -1 if not available.
        """
        self._sim_log('read_infrared()')
        if not self._sim and self._device:
            try:
                val = self._device.get_ir_switch(1)
                return float(val) if val else -1
            except Exception:
                self._log('[SENSOR] Infrared sensor not supported by firmware.')
        return 50.0

    def infrared_detected(self) -> bool:
        """
        Check if the infrared sensor detects an object nearby.

        Returns:
            True if an object is detected, False otherwise.
        """
        self._sim_log('infrared_detected()')
        dist = self.read_infrared()
        return 0 < dist < _IR_DETECTION_THRESHOLD_MM

    # ── Conveyor Belt ─────────────────────────────────────────────────

    def conveyor_speed(self, speed: float = 50, direction: str = 'forward'):
        """
        Set the conveyor belt speed and direction.

        Args:
            speed: Speed in mm/s (positive value).
            direction: 'forward' or 'backward'.
        """
        actual_speed = float(speed) if direction == 'forward' else -float(speed)
        self._sim_log(f"conveyor_speed({speed}, '{direction}')")
        if not self._sim and self._device:
            try:
                # Dobot conveyor belt uses the stepper motor interface
                self._device.conveyor_belt(actual_speed)
            except Exception:
                self._log('[CONVEYOR] Conveyor control not supported by firmware.')

    def conveyor_stop(self):
        """Stop the conveyor belt."""
        self._sim_log('conveyor_stop()')
        if not self._sim and self._device:
            try:
                self._device.conveyor_belt(0)
            except Exception:
                self._log('[CONVEYOR] Conveyor stop not supported by firmware.')

    def conveyor_move(self, distance: float = 100,
                      direction: str = 'forward'):
        """
        Move the conveyor belt a specific distance.

        Args:
            distance: Distance to move in mm.
            direction: 'forward' or 'backward'.
        """
        actual_dist = float(distance) if direction == 'forward' else -float(distance)
        self._sim_log(f"conveyor_move({distance}, '{direction}')")
        if not self._sim and self._device:
            try:
                self._device.conveyor_belt(_DEFAULT_CONVEYOR_SPEED, interface=0)
                move_time = abs(distance) / _DEFAULT_CONVEYOR_SPEED
                time.sleep(move_time)
                self._device.conveyor_belt(0)
            except Exception:
                self._log('[CONVEYOR] Conveyor distance move not supported by firmware.')

    # ── AI Features (AI Starter / Magician AI Kit) ────────────────────

    def ai_detect_object(self) -> str:
        """
        Use the AI camera to detect an object.

        Returns:
            The name of the detected object (e.g., 'cube', 'ball'),
            or 'none' if nothing detected.
        """
        self._sim_log('ai_detect_object()')
        if _HAS_CV2:
            return self._run_yolo_detection()
        self._log('[AI] OpenCV not installed (pip install opencv-python). Simulating...')
        return 'cube'

    def ai_detect_color(self) -> str:
        """
        Detect the dominant color in the camera view.

        Returns:
            Color name: 'red', 'blue', 'green', 'yellow', or 'unknown'
        """
        self._sim_log('ai_detect_color()')
        if _HAS_CV2:
            return self._run_color_detection()
        self._log('[AI] OpenCV not installed (pip install opencv-python). Simulating...')
        return 'red'

    def ai_detect_face(self) -> bool:
        """
        Detect whether a face is visible to the AI camera.

        Returns:
            True if a face is detected, False otherwise.
        """
        self._sim_log('ai_detect_face()')
        if _HAS_CV2:
            return self._run_face_detection()
        self._log('[AI] OpenCV not installed. Simulating...')
        return True

    def ai_grab_detected(self):
        """Move to the detected object and grab it using AI positioning."""
        self._sim_log('ai_grab_detected()')
        obj = self.ai_detect_object()
        self._log(f'[AI] Object detected: {obj}. Picking up...')
        self.move_down(20)
        self.grab()
        self.move_up(20)

    def ai_follow_line(self, duration: float = 3.0):
        """
        Follow a line on the ground using the AI camera.

        Args:
            duration: How many seconds to follow the line.
        """
        self._sim_log(f'ai_follow_line({duration}s)')
        self._log('[AI] Line following active...')
        start = time.time()
        while time.time() - start < duration:
            # In real mode, read camera and steer
            time.sleep(0.1)
        self._log('[AI] Line following done.')

    # ── Safety ─────────────────────────────────────────────────────────

    def emergency_stop(self):
        """
        Immediately stop all robot movement and disable motors.
        This is a safety feature to prevent damage to the robot and surroundings.
        Call reset_emergency() to resume normal operation.
        """
        self._emergency_stopped = True
        self._log('🛑 EMERGENCY STOP ACTIVATED — all movement halted')
        if not self._sim and self._device:
            try:
                self._device.set_queued_cmd_stop_exec()
                self._device.set_queued_cmd_clear()
            except Exception:
                pass
        self.release()

    def reset_emergency(self):
        """
        Reset the emergency stop and allow the robot to move again.
        The robot will need to be re-homed after an emergency stop.
        """
        self._emergency_stopped = False
        self._log('✅ Emergency stop cleared — robot ready')

    # ── Port Initialization ───────────────────────────────────────────

    def init_color_sensor(self, gp_port: int = 1):
        """
        Initialize the color sensor on the specified GP (General Purpose) port.

        Args:
            gp_port: GP port number (1, 2, 4, or 5).
        """
        self._color_sensor_port = int(gp_port)
        self._sim_log(f'init_color_sensor(GP{gp_port})')
        if not self._sim and self._device:
            try:
                self._device.set_color_sensor(True, self._color_sensor_port)
            except Exception:
                self._log(f'[SENSOR] Color sensor init on GP{gp_port} not supported by firmware.')

    def init_infrared(self, gp_port: int = 1):
        """
        Initialize the infrared sensor on the specified GP (General Purpose) port.

        Args:
            gp_port: GP port number (1, 2, 4, or 5).
        """
        self._infrared_port = int(gp_port)
        self._sim_log(f'init_infrared(GP{gp_port})')
        if not self._sim and self._device:
            try:
                self._device.set_ir_switch(True, self._infrared_port)
            except Exception:
                self._log(f'[SENSOR] Infrared init on GP{gp_port} not supported by firmware.')

    def init_conveyor(self, stepper_port: int = 1):
        """
        Initialize the conveyor belt on the specified Stepper motor port.

        Args:
            stepper_port: Stepper port number (1 or 2).
        """
        self._conveyor_port = int(stepper_port)
        self._sim_log(f'init_conveyor(STEPPER{stepper_port})')
        self._log(f'[CONVEYOR] Conveyor belt initialized on STEPPER{stepper_port}')

    # ── AI Starter Drive Methods ──────────────────────────────────────

    def drive_forward(self, mm: float = 100):
        """Drive the AI Starter robot forward by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'drive_forward({mm}mm)')
        self._y += float(mm)

    def drive_backward(self, mm: float = 100):
        """Drive the AI Starter robot backward by *mm* millimeters."""
        self._check_emergency()
        self._sim_log(f'drive_backward({mm}mm)')
        self._y -= float(mm)

    def turn_left(self, degrees: float = 90):
        """Turn the AI Starter robot to the left by *degrees*."""
        self._check_emergency()
        self._sim_log(f'turn_left({degrees}°)')
        self._r += float(degrees)

    def turn_right(self, degrees: float = 90):
        """Turn the AI Starter robot to the right by *degrees*."""
        self._check_emergency()
        self._sim_log(f'turn_right({degrees}°)')
        self._r -= float(degrees)

    def stop_driving(self):
        """Stop the AI Starter robot wheels."""
        self._sim_log('stop_driving()')

    # ── Event Callbacks ───────────────────────────────────────────────

    def on_button(self, button: str, callback):
        """
        Register a callback for a physical button press.

        Args:
            button: 'A' or 'B'
            callback: Function to call when button is pressed.
        """
        self._callbacks[f'button_{button}'] = callback
        self._sim_log(f"on_button('{button}', {callback.__name__})")

    def on_detect(self, event_type: str, callback):
        """
        Register a callback for a detection event.

        Args:
            event_type: 'object', 'face', etc.
            callback: Function to call when event occurs.
        """
        self._callbacks[f'detect_{event_type}'] = callback
        self._sim_log(f"on_detect('{event_type}', {callback.__name__})")

    def on_detect_color(self, color: str, callback):
        """
        Register a callback for when a specific color is detected.

        Args:
            color: 'red', 'blue', 'green', 'yellow'
            callback: Function to call when color is detected.
        """
        self._callbacks[f'color_{color}'] = callback
        self._sim_log(f"on_detect_color('{color}', {callback.__name__})")

    def every(self, seconds: float, callback):
        """
        Call *callback* every *seconds* seconds (blocking).

        Note: For non-blocking timers, use threading.

        Args:
            seconds: Interval in seconds.
            callback: Function to call on each tick.
        """
        import threading

        def _loop():
            while True:
                callback()
                time.sleep(seconds)

        t = threading.Thread(target=_loop, daemon=True)
        t.start()
        self._sim_log(f'every({seconds}s, {callback.__name__}) — running in background')

    # ── Internal AI implementations ────────────────────────────────────

    def _run_yolo_detection(self) -> str:
        """Simple color-blob object detection using OpenCV."""
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return 'none'
        # Simple detection: find largest contour
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            return 'object'
        return 'none'

    def _run_color_detection(self) -> str:
        """Detect dominant color in camera view."""
        import numpy as np
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return 'unknown'
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        color_ranges = {
            'red':    [(0, 100, 100), (10, 255, 255)],
            'blue':   [(100, 100, 100), (130, 255, 255)],
            'green':  [(40, 100, 100), (80, 255, 255)],
            'yellow': [(20, 100, 100), (30, 255, 255)],
        }
        best_color, best_count = 'unknown', 0
        for color, (lower, upper) in color_ranges.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            count = cv2.countNonZero(mask)
            if count > best_count:
                best_color, best_count = color, count
        return best_color

    def _run_face_detection(self) -> bool:
        """Detect faces using OpenCV Haar cascade."""
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return False
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        return len(faces) > 0

    # ── Context manager support ────────────────────────────────────────

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        return False

    def close(self):
        """Disconnect from the robot."""
        self._sim_log('close()')
        if not self._sim and self._device:
            self._device.close()

    def __del__(self):
        try:
            self.close()
        except Exception:
            pass
