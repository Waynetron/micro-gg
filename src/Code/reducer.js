const defaultState = {
  code: `
#######################
#                     #
#                     #
#                     #
#                     #
#                     #
#     ###?#           #
#                     #
#  P             G    #
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


[ COLLIDE_LEFT Player | COLLIDE_RIGHT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_RIGHT Player | COLLIDE_LEFT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_TOP Player | COLLIDE_BOTTOM Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_BOTTOM Player | COLLIDE_TOP Goomba ] -> [ JUMP Player | DEAD Goomba ]

[ COLLIDE_TOP Player | COLLIDE_BOTTOM Brick ] -> [ Player | DEAD Brick ]
[ COLLIDE_TOP Player | COLLIDE_BOTTOM QuestionBrick ] -> [ Player | JUMP Goomba ]
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