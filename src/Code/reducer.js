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

debug

P = Player
? = QuestionBrick
# = Brick
G = Goomba
R = GoombaRed
^ = Spike

[ Goomba ] -> [ DOWN Goomba ]
[ Player ] -> [ DOWN Player ]

[ <LEFT> Player ] -> [ LEFT Player ]
[ <RIGHT> Player ] -> [ RIGHT Player ]
[ <UP> COLLIDE_BOTTOM Player | COLLIDE_TOP Wall ] -> [ JUMP Player | Wall ]
[ <UP> COLLIDE_LEFT Player | COLLIDE_RIGHT Wall ] -> [ JUMP Player | Wall ]
[ <UP> COLLIDE_RIGHT Player | COLLIDE_LEFT Wall ] -> [ JUMP Player | Wall ]

[ COLLIDE_LEFT Player | COLLIDE_RIGHT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_RIGHT Player | COLLIDE_LEFT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_TOP Player | COLLIDE_BOTTOM Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_BOTTOM Player | COLLIDE_TOP Goomba ] -> [ JUMP Player | DEAD Goomba ]

[ Goomba ] -> [ Gomba LEFT ]
[ COLLIDE_LEFT Goomba | COLLIDE_RIGHT Anything ] -> [ GoombaRed | Anything ]
[ GoombaRed ] -> [ GombaRed RIGHT ]
[ COLLIDE_RIGHT GoombaRed | COLLIDE_LEFT Anything ] -> [ Goomba | Anything ]

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