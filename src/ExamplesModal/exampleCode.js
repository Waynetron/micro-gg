export const EMPTY_GAME =
`#################
#               #
#               #
#       P       #
#               #
#               #
#################

// Legend
P = Player

// Rules
{ <MOVE> Player } -> { MOVE Player }
`

export const examples = {
simple_movement:
`
##################
#                #
#                #
#       P        #
#       #        #
#      ###       #
#     #####      #
#                #
#                #
##################
  
P = Player
# = Brick
  
// Accelerate down, like gravity
{ Player } -> { DOWN Player }

// Move sideways with <LEFT> and <RIGHT> arrow keys
{ <HORIZONTAL> Player } -> { HORIZONTAL Player }
`,

simple_platformer:
`
##################
#                #
#                #
#                #
#                #
#                #
#     ###?#      #
#                #
#    P       G   #
##################

P = Player
# = Brick
? = QuestionBrick
G = Goomba

// Accelerate down, like gravity
{ Player } -> { DOWN Player }
{ Goomba } -> { DOWN Goomba }

// Move sideways with <LEFT> and <RIGHT> arrow keys
{ <HORIZONTAL> Player } -> { HORIZONTAL Player }

// Jump when <UP> is pressed and when the bottom of Player
// is touching Wall (Wall = anything)
DOWN { <UP> Player | Wall } -> { JUMP Player | Wall }

// Player dies if touching Goomba on the side
HORIZONTAL { Player | Goomba } -> { DEAD Player | Goomba }

// Jumping on top of Goomba kills the Goomba
DOWN { Player | Goomba } -> { Player | DEAD Goomba }

// Break bricks by head-butting
UP { Player | Brick } -> { Player | DEAD Brick }

// Head-butting QuestionBrick turns it into another Player
UP { Player | QuestionBrick } -> { Player | JUMP Player }
`,

four_way_movement:
`
###############
#             #
#             #
#             #
#      P      #
#             #
#             #
###############

P = Player

// MOVE is shorthand for UP, DOWN, LEFT and RIGHT
// You can also use HORIZONTAL or VERTICAL
{ <MOVE> Player } -> { MOVE Player }
`,

follow_player:
`
##################
#                #
#   G            #
#                #
#                #
#                #
#                #
#           P    #
#                #
##################

P = Player
G = Goomba

{ <MOVE> Player } -> { MOVE Player }
UP { Bro > Player } -> { SLOW_UP Bro > Player }
DOWN { Bro > Player } -> { SLOW_DOWN Bro > Player }
LEFT { Bro > Player } -> { SLOW_LEFT Bro > Player }
RIGHT { Bro > Player } -> { SLOW_RIGHT Bro > Player }

`
}