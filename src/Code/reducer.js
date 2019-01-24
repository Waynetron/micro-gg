const defaultState = {
  code: `
##################
#                #
#                #
#                #
#                #
#     ?????      #
#     ###?#      #
#                #
#  P          G  #
##################

P = Player
# = Brick
? = QuestionBrick or Brick or Empty
G = Goomba
R = GoombaRed
^ = Spike

[ Player ] -> [ DOWN Player ]

<LEFT> [ Player ] -> [ LEFT Player ]
<RIGHT> [ Player ] -> [ RIGHT Player ]
<UP> [ COLLIDE Player | COLLIDE Wall ] -> [ JUMP Player | Wall ]

[ COLLIDE_LEFT Player | COLLIDE_RIGHT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_RIGHT Player | COLLIDE_LEFT Goomba ] -> [ DEAD Player | Goomba ]
[ COLLIDE_BOTTOM Player | COLLIDE_TOP Goomba ] -> [ JUMP Player | DEAD Goomba ]
[ COLLIDE_BOTTOM Player | COLLIDE_TOP GoombaRed ] -> [ JUMP Player | DEAD GoombaRed ]

[ Goomba ] -> [ DOWN SLOW_LEFT Gomba ]
[ GoombaRed ] -> [ GombaRed DOWN SLOW_RIGHT ]
[ COLLIDE_LEFT Goomba | COLLIDE_RIGHT Wall ] -> [ GoombaRed | Wall ]
[ COLLIDE_RIGHT GoombaRed | COLLIDE_LEFT Wall ] -> [ Goomba | Wall ]

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