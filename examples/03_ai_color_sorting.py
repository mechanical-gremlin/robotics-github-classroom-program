# Example 3 — AI Color Sorting
# This program uses the Dobot AI camera to detect the color of an object,
# then sorts it into the correct bin. Requires the Dobot AI kit.

import time
from dobot_wrapper import DobotRobot

robot = DobotRobot(robot_type='magician_ai')
robot.move_home()
robot.set_speed('medium')

# Bin positions for each color
color_bins = {
    'red':    (100,  50, 20),
    'blue':   (100,   0, 20),
    'green':  (100, -50, 20),
    'yellow': (100, -100, 20),
}

pickup_zone = (0, 100, 20)

print("AI Color Sorting Program")
print("=" * 30)
print("Place colored objects in the pickup zone.")
print("The robot will sort them by color!\n")

for round_num in range(5):  # Sort 5 objects
    print(f"Round {round_num + 1}: Looking for object...")

    # Move to pickup zone and detect color
    px, py, pz = pickup_zone
    robot.move_to(px, py, pz + 30)

    # Use AI camera to detect color
    detected_color = robot.ai_detect_color()
    print(f"  Detected color: {detected_color}")

    if detected_color not in color_bins:
        print(f"  Unknown color '{detected_color}' — skipping")
        time.sleep(2)
        continue

    # Pick up the object
    robot.move_to(px, py, pz)
    robot.grab()
    time.sleep(0.5)
    robot.move_up(40)

    # Move to the correct color bin
    bx, by, bz = color_bins[detected_color]
    print(f"  Moving to {detected_color} bin at ({bx}, {by})")
    robot.move_to(bx, by, bz + 40)
    robot.move_to(bx, by, bz)
    robot.release()
    time.sleep(0.5)
    robot.move_up(30)

    robot.beep()  # Signal success
    print(f"  ✅ Sorted '{detected_color}' object!")
    time.sleep(1)

robot.move_home()
print("\nSorting complete! Great work!")
