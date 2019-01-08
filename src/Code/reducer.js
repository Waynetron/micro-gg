const defaultState = {
  code: `
Player player
QuestionBrick question-brick
Brick brick
Spike spike
Goomba goomba

##################
#                #
#         P      #
#                #
#                #
#          G     #
#    ####?###    #
#                #
#   P         ^^ #
##################

P = Player
? = QuestionBrick
# = Brick
G = Goomba
^ = Spike

[ Brick ] -> [ STATIC Brick ]
[ QuestionBrick ] -> [ STATIC QuestionBrick ]
[ Spike ] -> [ STATIC Spike ]
[ Goomba ] -> [ UP Goomba ]
[ Goomba ] -> [ RIGHT Goomba ]
[ Player ] -> [ DOWN Player ]
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