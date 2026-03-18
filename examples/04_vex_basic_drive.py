# Example 4 — VEX Robot Basic Drive
# Controls a VEX V5 robot with simple movement commands.
# The vex module is available when running inside VEXcode or a VEX environment.

# Note: This runs on the VEX V5 brain directly.
# Upload this file to your VEX V5 robot using the VEXcode app.

# ─── VEX V5 Python API ───────────────────────────────────────────────
# This uses the standard VEX Python API available on VEX V5 brains.

import math
from vex import *

brain = Brain()
left_motor  = Motor(Ports.PORT1,  GearSetting.RATIO_18_1, False)
right_motor = Motor(Ports.PORT2,  GearSetting.RATIO_18_1, True)

def drive_forward(inches):
    """Drive the robot forward by the given number of inches."""
    rotations = inches / (3.25 * math.pi)  # Adjust for wheel diameter
    left_motor.spin_for(FORWARD, rotations, TURNS)
    right_motor.spin_for(FORWARD, rotations, TURNS)
    brain.screen.print(f"Drove forward {inches} inches")

def turn_left(degrees):
    """Turn the robot to the left by the given number of degrees."""
    rotations = degrees / 360 * 2.0  # Adjust for robot width
    left_motor.spin_for(REVERSE, rotations, TURNS)
    right_motor.spin_for(FORWARD, rotations, TURNS)
    brain.screen.print(f"Turned left {degrees} degrees")

def turn_right(degrees):
    """Turn the robot to the right by the given number of degrees."""
    rotations = degrees / 360 * 2.0
    left_motor.spin_for(FORWARD, rotations, TURNS)
    right_motor.spin_for(REVERSE, rotations, TURNS)
    brain.screen.print(f"Turned right {degrees} degrees")

# ─── Main Program ────────────────────────────────────────────────────

brain.screen.clear_screen()
brain.screen.set_cursor(1, 1)
brain.screen.print("VEX Robot Started!")

# Drive in a square
print("Driving in a square...")
for side in range(4):
    drive_forward(24)   # Drive forward 24 inches
    wait(0.5, SECONDS)
    turn_right(90)       # Turn right 90 degrees
    wait(0.5, SECONDS)

brain.screen.print("Done!")
