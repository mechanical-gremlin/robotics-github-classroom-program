# Example 2 — Pick and Place with Loop
# This program picks up 3 objects one at a time and places them
# in a row. Great for learning loops and repetition!

import time
from dobot_wrapper import DobotRobot

robot = DobotRobot()
robot.move_home()
robot.set_speed('slow')

# Positions where objects are picked up (X, Y, Z)
pickup_positions = [
    (0,   100, 20),   # Object 1
    (30,  100, 20),   # Object 2
    (60,  100, 20),   # Object 3
]

# Positions where objects are placed
place_positions = [
    (0,   -100, 20),  # Drop 1
    (30,  -100, 20),  # Drop 2
    (60,  -100, 20),  # Drop 3
]

print(f"Moving {len(pickup_positions)} objects...")

for i in range(len(pickup_positions)):
    print(f"\n--- Object {i + 1} ---")

    # Go to pickup position
    px, py, pz = pickup_positions[i]
    print(f"  Going to pickup: ({px}, {py}, {pz})")
    robot.move_to(px, py, pz + 30)   # Hover above
    robot.move_to(px, py, pz)         # Move down
    robot.grab()
    time.sleep(0.3)

    # Lift up
    robot.move_up(30)

    # Go to place position
    dx, dy, dz = place_positions[i]
    print(f"  Moving to place: ({dx}, {dy}, {dz})")
    robot.move_to(dx, dy, dz + 30)   # Hover above drop
    robot.move_to(dx, dy, dz)         # Move down
    robot.release()
    time.sleep(0.3)

    # Lift back up
    robot.move_up(30)
    print(f"  Object {i + 1} placed!")

robot.move_home()
print("\nAll objects moved! Great job!")
