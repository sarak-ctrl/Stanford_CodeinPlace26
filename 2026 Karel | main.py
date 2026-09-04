from karel.stanfordkarel import *

"""
When you finish writing this file, Karel should be able to 
place 20 beepers, then 26 beepers, and end facing East to 
the right of the 26 beepers.
"""
def main():
    # Places 20 beepers
    for i in range(20):
        put_beeper()
    move()
    # Places 26 beepers
    for i in range(26):
        put_beeper()
    move()

    


if __name__ == '__main__':
    main()
