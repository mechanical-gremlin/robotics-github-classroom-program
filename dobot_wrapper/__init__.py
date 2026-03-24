"""
dobot_wrapper — A simplified Python wrapper for Dobot robots.
Designed for introductory robotics students.

Supports: Dobot Magician, Dobot AI Starter, Dobot Magician AI Kit

Usage:
    from dobot_wrapper import DobotRobot

    robot = DobotRobot()
    robot.move_home()
    robot.set_speed('slow')
    robot.move_forward(50)
    robot.grab()
    robot.move_up(30)
    robot.move_backward(50)
    robot.release()

Manual connection (if auto-detect fails):
    from dobot_wrapper import DobotRobot

    print(DobotRobot.list_ports())   # see available serial ports
    robot = DobotRobot(port='COM3')  # connect to a specific port

Debug / advanced communication mode:
    robot = DobotRobot(port='COM3', debug=True)
    robot.print_debug_info()         # print connection diagnostics

Lock/unlock safety:
    robot.begin_program()            # enable lock/unlock safety
    # ... your robot commands ...
    robot.end_program()              # disable lock/unlock safety
"""

from .robot import DobotRobot

__all__ = ['DobotRobot']
__version__ = '1.2.0'
