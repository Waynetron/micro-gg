const defaultState = {
  code: `
Player player
QuestionBrick question-brick
Brick brick
Spike spike
Goomba goomba

##################
#B              B#
#         P      #
#                #
#               #
#          G     #
#    BBBB?BBB    #
#                #
#B  P         ^^ #
##################

P = Player
? = QuestionBrick
B = Brick
G = Goomba
^ = Spike

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