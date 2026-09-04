from karel.stanfordkarel import *

# File: piles.py
# -----------------------------
# The warmup program defines a "main"
# function which should make Karel
# pick up all the beepers in the world.

# This will make Karel pick up all the beepers using
# for loop on the first row of this world. The move() command
# is used to make Karel move forward after picking all the 
# beepers on one place and to the second to pick up other beepers
# placed on other places on the same row. The move() command 
# has been used twice to make Karel move two more columns to
# right, and once at the end as it only needed to move once to
# complete the assigned task.
def main():
    move()
    # Pick 10 beepers 
    for i in range(10):
        pick_beeper()
    move()
    move()
    # Pick 10 beepers
    for i in range(10):
        pick_beeper()
    move()
    move()
    # Pick 10 beepers
    for i in range(10):
        pick_beeper()
    move()
   
   
   
# don't edit these next two lines
# they tell python to run your main function
if __name__ == '__main__':
    main()
