import {parseRules, parseSprites, parseLegend,
  parseLevel, parseAssets, getLevelDimensions} from '../Parse/util.js';
import {TILE_SIZE} from '../Game/constants.js'

const defaultState = {
  sprites: [],
  legend: [],
  rules: [],
  assets: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  elapsed: {
    sinceLastFrame: Date.now(),
    totalFrames: 0
  },
  frame: 0,
};

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_CODE':
      const {code} = action;
      const level = parseLevel(code);
      const legend = parseLegend(code);
      const assets = parseAssets(code);
      const sprites = parseSprites(level, legend, assets);
      const rules = parseRules(code);
      const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

      return {
        ...state,
        sprites,
        legend,
        rules,
        assets,
        width: width_in_tiles * TILE_SIZE,
        height: height_in_tiles * TILE_SIZE,
      }
    case 'UPDATE_ELAPSED':
      const {elapsed} = action;
      return {
          ...state,
          // Using object with a frame counter inside the object to make sure
          // it always rerenders when used in components
          // My thinking is that if I just use elapsed, then it's possible for the same elapsed value
          // to fire twice in a row, and the 2nd render might not be called (optimised away)
          elapsed: {
            sinceLastFrame: Date.now() - elapsed,
            totalFrames: state.elapsed.totalFrames + 1
          },
          sprites: state.sprites.map((sprite)=> {
            if (sprite.static === false) {
              return {
                ...sprite,
                velocity: {
                  x: sprite.velocity.x + sprite.acceleration.x,
                  y: sprite.velocity.y + sprite.acceleration.y
                },
                position: {
                  x: sprite.position.x + sprite.velocity.x,
                  y: sprite.position.y + sprite.velocity.y
                }
              }
            }
      
            return sprite;
          })
      }
    default:
      return state
  }
}

export default gameReducer