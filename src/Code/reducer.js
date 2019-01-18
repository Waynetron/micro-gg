const defaultState = {
  code: `
#######################
#                     #
#                     #
#                     #
#                     #
#                     #
#       ^             #
#   ###?#             #
#  P           G      #
#######################

P = Player
? = QuestionBrick
# = Brick
G = Goomba
^ = Spike

[ Goomba ] -> [ DOWN Goomba ]
[ Player ] -> [ DOWN Player ]
[ <LEFT> Player ] -> [ LEFT Player ]
[ <RIGHT> Player ] -> [ RIGHT Player ]
[ <UP> Player ] -> [ JUMP Player ]
[ COLLIDE_RIGHT Player | COLLIDE_LEFT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_LEFT Player | COLLIDE_RIGHT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_BOTTOM Player | COLLIDE_TOP Goomba ] -> [ Player | DEAD Goomba ]
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