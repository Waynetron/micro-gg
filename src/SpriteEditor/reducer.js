
const initialTileSets = [
  [
    [0, 1, 1, 0,],
    [1, 1, 1, 1,],
    [1, 1, 1, 1,],
    [0, 1, 1, 0,]
  ],
  [
    [0, 1, 1, 0,],
    [1, 0, 0, 1,],
    [1, 0, 0, 1,],
    [0, 1, 1, 0,]
  ]
]

const defaultState = {
  tileSets: initialTileSets,
  open: true
}

const spriteEditorReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'spriteEditor/SET_OPEN':
      return {...state, open: action.open}
    case 'spriteEditor/UPDATE_TILESETS':
      return {...state, tileSets: action.tileSets}
    default:
      return state
  }
}

export default spriteEditorReducer