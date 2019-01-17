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
#       ^        #
#                #
#                #
##################

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
[ COLLIDE_RIGHT Player | COLLIDE_LEFT Goomba ] -> [ DEAD Player | DEAD Goomba ]  
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