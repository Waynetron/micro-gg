const defaultState = {
  code: `
Player player
QuestionBrick question-brick
Brick brick
Spike spike
Goomba goomba

##################
#                #
#                #
#                #
#    P      G    #
#                #
#    ####?###    #
#                #
#   P         ^^ #
##################

P = Player
? = QuestionBrick
# = Brick
G = Goomba
^ = Spike

[ <RIGHT> Player ] -> [ RIGHT Player ]
[ <DOWN> Player ] -> [ DOWN Player ]
[ BOTTOM Player | TOP Spike ] ->  [ Player | DEAD Spike ]
`
}

const gameReducer = (state = defaultState, {type, code}) => {
  switch (type) {
    case 'UPDATE_CODE':
      return {...state, code}
    default:
      return state
  }
}

export default gameReducer