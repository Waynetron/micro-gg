const defaultState = {
  code: `
#####################
#                   #
#                   #
#                   #
#                   #
#                   #
#     ###?#         #
#                   #
#  P           G    #
#####################

P = Player
? = QuestionBrick
# = Brick
G = Goomba
R = GoombaRed
^ = Spike

[ Goomba ] -> [ DOWN Goomba ]
[ Player ] -> [ DOWN Player ]

<LEFT> [ Player ] -> [ LEFT Player ]
<RIGHT> [ Player ] -> [ RIGHT Player ]
<UP> [ COLLIDE Player | COLLIDE Wall ] -> [ JUMP Player | Wall ]

[ COLLIDE Player | COLLIDE Goomba ] -> [ DEAD Player | Goomba ]
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