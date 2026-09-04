from karel.stanfordkarel import *

"""
Karel should finish the puzzle by picking up the last beeper
(puzzle piece) and placing it in the right spot. Karel should
end in the same position Karel starts in -- the bottom left
corner of the world.
"""

def turn_right():
    turn_left()
    turn_left()
    turn_left()

def turn_around():
    turn_left()
    turn_left()

def pick_up_last_piece():
    # Move from col 1 to col 3, row 7
    move()
    move()
    pick_beeper()

def place_puzzle_piece():
    # At col 3, row 7, facing east
    move()               # move to col 4
    turn_left()          # face north
    move()               # row 6
    move()               # row 5
    put_beeper()         # place at col 4, row 5

def return_to_start():
    # At col 4, row 5, facing north
    turn_around()        # face south
    move()               # row 6
    move()               # row 7
    turn_right()         # face west
    move()               # col 3
    move()               # col 2
    move()               # col 1
    turn_around()        # face east

def main():
    pick_up_last_piece()
    place_puzzle_piece()
    return_to_start()

if __name__ == '__main__':
    main()
