import Plain from 'slate-plain-serializer';

const initialCode = {
  level:
`##################
#                #
#                #
#                #
#                #
#                #
#     ###?#      #
#                #
#    P       G   #
##################`,
  legend:
`P = Player
# = Brick
? = QuestionBrick
G = Goomba`,
  rules:
`// Accelerate down, like gravity
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
UP { Player | QuestionBrick } -> { Player | JUMP Player }`
}

const defaultState = {
  level: Plain.deserialize(initialCode.level),
  legend: Plain.deserialize(initialCode.legend),
  rules: Plain.deserialize(initialCode.rules)
}

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_LEVEL':
      return {...state, level: action.level}
    case 'UPDATE_LEGEND':
      return {...state, legend: action.legend}
    case 'UPDATE_RULES':
      return {...state, rules: action.rules}
    case 'LOAD_SUCCESS':
      const {level, legend, rules} = action
      return {...state, level, legend, rules}
    default:
      return state
  }
}

export default gameReducer