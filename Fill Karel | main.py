from karel.stanfordkarel import *

"""
File: main.py
-----------------------------
This program directs Karel to fill the entire world with beepers,
regardless of the world's size. Karel starts at the bottom-left 
corner facing east. Each row is filled one at a time from left to
right. After filling each row, Karel returns to column 1 using the gap
in the wall on the left side, climbs up one row, and repeats.
Karel finishes in the top-right corner facing east.
"""

def main():
    """
    Fills the entire world row by row. Fills the first row, then
    repeatedly returns to column 1, climbs up, and fills the next
    row while there are rows remaining above. Finally, walks east
    to reach the top-right corner.
    """
    fill_row()

    return_to_column_one()

    # keep climbing and filling while a row above exists
    while left_is_clear():  # left of east = north, so checks if row above exists
        climb_up()
        fill_row()
        return_to_column_one()

    # at top-left corner facing east - walk to top-right 
    while front_is_clear():
        move()

def fill_row():
    """
    Places a beeper on every square in the current row by moving
    east and placing a beeper at each step until the wall is reached.
    """
    put_beeper()

    while front_is_clear():
        move()
        put_beeper()

def return_to_column_one():
    """
    Turns Karel around to face west and walks back to column 1
    (the left wall), then turns to face east again.
    """
    turn_around()

    while front_is_clear():
        move()

    turn_around()

def climb_up():
    """
    Moves Karel one square north through the gap on the left wall,
    so Karel can begin filling the next row. Ends facing east.
    """
    turn_left()
    move()
    turn_right()

def turn_right():
    """
    Turns Karel 90 degrees to the right using three left turns, 
    since Karel only has a turn_left() command available.
    """
    turn_left()
    turn_left()
    turn_left()

def turn_around():
    """
    Turns Karel 180 degrees using two left turns,
    since Karel only has a turn_left() command available.
    """
    turn_left()
    turn_left()

if __name__ == '__main__':
    main()
