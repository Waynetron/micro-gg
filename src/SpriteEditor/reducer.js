
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

const tileImages = ['tile0', 'tile1', 'tile2', 'tile3']

const rasterise = (tileSet)=> {
  const width = 128
  const height = 128

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  let ctx = canvas.getContext('2d')
  tileSet.map((row, rowIndex)=> (
    tileSet[rowIndex].map((col, colIndex)=> {
      const tileImage = tileImages[tileSet[rowIndex][colIndex]]
      const image = new Image(32, 32);
      image.onload = function() {
          console.log('loaded')
          ctx.drawImage(image, col * 32, row * 32);
      };
      image.src = `../Game/images/tiles/${tileImage}.png`
      // the src needs to be set after the onload because apparently
      // sometimes the src can be loaded instantly (eg: if the image is cached)
    })
  ))

  // produce png from canvas
  var dataUri = canvas.toDataURL()

  return dataUri
}

const defaultState = {
  tileSets: initialTileSets,
  open: false,
  images: initialTileSets.map((tileSet)=> rasterise(tileSet)),
  tileImages
}

const spriteEditorReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'spriteEditor/SET_OPEN':
      return {
        ...state,
        open: action.open
      }
    case 'spriteEditor/UPDATE_TILESETS':
      return {
        ...state,
        tileSets: action.tileSets,
        images: action.tileSets.map((tileSet)=> rasterise(tileSet))
      }
    default:
      return state
  }
}

export default spriteEditorReducer