# Example 1 — Basic Robot Movements
# This program shows the basic movement commands for the Dobot Magician.
# Perfect for beginners!

import time
from dobot_wrapper import DobotRobot

# Create a robot connection
# (If no robot is plugged in, it will run in simulation mode and print each step)
robot = DobotRobot()

print("Starting robot program...")

# 1. Move to the home/starting position
robot.move_home()
time.sleep(1)

# 2. Set the speed to medium so movements aren't too fast
robot.set_speed('medium')

# 3. Move the arm forward 50 mm
robot.move_forward(50)
time.sleep(0.5)

# 4. Move the arm down to be close to an object
robot.move_down(30)
time.sleep(0.5)

# 5. Turn on the suction cup to grab the object
robot.grab()
time.sleep(0.5)

# 6. Lift the arm up
robot.move_up(40)
time.sleep(0.5)

# 7. Move the arm to the side
robot.move_right(80)
time.sleep(0.5)

# 8. Lower to place the object
robot.move_down(40)
time.sleep(0.5)

# 9. Release the object
robot.release()
time.sleep(0.5)

# 10. Return to home
robot.move_home()

print("Done! Robot program finished.")
