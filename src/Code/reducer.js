import Plain from 'slate-plain-serializer';

const initialCode = `
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
? = QuestionBrick or Brick
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
`;

const defaultState = {
  code: initialCode
}

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_CODE':
      return {...state, code: action.code}
    default:
      return state
  }
}

export default gameReducer