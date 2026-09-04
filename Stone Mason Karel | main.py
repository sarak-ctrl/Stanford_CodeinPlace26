from karel.stanfordkarel import * 

"""
File: main.py
--------------------
When you finish writing this file, Karel should have repaired each 
of the columns in the temple. Karel starts at the bottom-left corner
facing east. The four columns are at positions 1, 5, 9, and 13, and
each column in exactly 5 beepers tall.
"""

def main():
    """
    Builds all four columns of the temple. Karel builds a column,
    moves 4 steps east to the next position, and repeats. The last
    column is built without moving afterward.
    """
    for i in range(3):
        build_column()
        move_to_next_column()
    build_column()

def build_column():
    """
    Builds a single column of 5 beepers directly above Karel's
    current position. Karel turns north, places a beepeer and moves
    up 4 times, places the final beeper at the top, then turns 
    around and walks back down to the base, finishing facing east.
    """
    turn_left()
    for i in range(4):
        put_beeper()
        move()
    put_beeper()
    turn_around()
    for i in range(4):
        move()
    turn_left()

def move_to_next_column():
    """
    Moves Karel exactly 4 steps east to reach the next
    column position (from col 1 to 5, 5 to 9, or
    9 to 13).
    """
    for i in range(4):
        move()
    
def turn_around():
    """
    Turns Karel 180 degrees by turning left twice,
    since Karel only has a turn_left() command available.
    """
    turn_left()
    turn_left()

if __name__ == '__main__':
    main()
