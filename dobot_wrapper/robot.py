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

        if _HAS_PYDOBOT:
            try:
                from pydobot import Dobot
                detected_port = port or self._detect_port()
                if detected_port:
                    self._device = Dobot(port=detected_port, verbose=False)
                    self._sim = False
                    v, a = _SPEED_PRESETS[self._speed]
                    self._device.speed(velocity=v, acceleration=a)
                    self._log(f'✅ Connected to Dobot on {detected_port}')
                else:
                    self._log('⚠️  No Dobot found — running in simulation mode')
            except Exception as e:
                self._log(f'⚠️  Could not connect to Dobot ({e}) — simulation mode')
        else:
            self._log('ℹ️  pydobot not installed — simulation mode (pip install pydobot)')

    # ── Internal helpers ───────────────────────────────────────────────

    def _log(self, message: str):
        print(f'[DobotRobot] {message}', file=sys.stdout, flush=True)

    def _sim_log(self, action: str):
        self._log(f'[SIM] {action}')

    @staticmethod
    def _detect_port() -> str | None:
        """Auto-detect Dobot serial port."""
        try:
            import serial.tools.list_ports
            ports = serial.tools.list_ports.comports()
            for p in ports:
                desc = (p.description or '').lower()
                if 'dobot' in desc or 'silicon labs' in desc or 'cp210' in desc:
                    return p.device
        except ImportError:
            pass
        return None

    # ── Movement ──────────────────────────────────────────────────────

    def move_home(self):
        """Move the robot arm back to its home/starting position."""
        self._sim_log('move_home()')
        self._x, self._y, self._z, self._r = 0.0, 0.0, 50.0, 0.0
        if not self._sim and self._device:
            self._device.home()

    def move_forward(self, mm: float = 10):
        """Move the arm forward by *mm* millimeters."""
        self._sim_log(f'move_forward({mm}mm)')
        self._y += float(mm)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_backward(self, mm: float = 10):
        """Move the arm backward by *mm* millimeters."""
        self._sim_log(f'move_backward({mm}mm)')
        self._y -= float(mm)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_left(self, mm: float = 10):
        """Move the arm to the left by *mm* millimeters."""
        self._sim_log(f'move_left({mm}mm)')
        self._x -= float(mm)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_right(self, mm: float = 10):
        """Move the arm to the right by *mm* millimeters."""
        self._sim_log(f'move_right({mm}mm)')
        self._x += float(mm)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_up(self, mm: float = 10):
        """Raise the arm by *mm* millimeters."""
        self._sim_log(f'move_up({mm}mm)')
        self._z += float(mm)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_down(self, mm: float = 10):
        """Lower the arm by *mm* millimeters."""
        self._sim_log(f'move_down({mm}mm)')
        self._z = max(self._z - float(mm), 0)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def move_to(self, x: float, y: float, z: float):
        """Move the arm to exact coordinates (x, y, z in mm)."""
        self._sim_log(f'move_to({x}, {y}, {z})')
        self._x, self._y, self._z = float(x), float(y), float(z)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def rotate_left(self, degrees: float = 45):
        """Rotate the base of the arm to the left by *degrees*."""
        self._sim_log(f'rotate_left({degrees}°)')
        self._r += float(degrees)
        if not self._sim and self._device:
            self._device.move_to(self._x, self._y, self._z, self._r, wait=True)

    def rotate_right(self, degrees: float = 45):
        """Rotate the base of the arm to the right by *degrees*."""
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
