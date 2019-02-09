const defaultState = {
  code: `
##################
#                #
#                #
#                #
#                #
#                #
#                #
#    P           #
#             G  #
##################

P = Player
# = Brick
? = QuestionBrick or Brick or Empty
G = Goomba
R = GoombaRed
^ = Spike

[ <HORIZONTAL> Player ] -> [ HORIZONTAL Player ]
[ <UP> Player | Wall ] -> [ JUMP Player | Wall ]
[ <ACTION> Player | Wall ] -> [ JUMP Player | Wall ]
[ Player ] -> [ DOWN Player ]
[ Goomba ] -> [ DOWN Goomba ]

HORIZONTAL [ Player | Goomba ] -> [ DEAD Player | Goomba ]
DOWN [ Player | Goomba ] -> [ Player | DEAD Goomba ]
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