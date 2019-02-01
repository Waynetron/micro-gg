const defaultState = {
  code: `
##################
#                #
#                #
#     P          #
#                #
#     #####      #
#     ### #      #
#######           #
######        G  #
##################

P = Player
# = Brick
? = QuestionBrick or Brick or Empty
G = Goomba
R = GoombaRed
^ = Spike

[ Player ] -> [ DOWN Player ]

<HORIZONTAL> [ Player ] -> [ HORIZONTAL Player ]

[ Player | Goomba ] -> [ DEAD Player | Goomba ]

UP [ <ACTION> Player | Brick ] -> [ JUMP Player ]
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