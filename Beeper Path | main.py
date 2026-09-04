from karel.stanfordkarel import *

# The commands are used to follow the beepers placed 
# and pause at the end of the beepers using conditions. 

def main():
    while front_is_clear() and beepers_present():
        move()

# No need to change the code beyond this 
if __name__ == '__main__':
    main()
