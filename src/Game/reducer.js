import {parseRules, parseSprites, parseLegend,
  parseLevel, parseAssets, getLevelDimensions} from '../Parse/util.js';

const TILE_SIZE = 32;

const defaultState = {
  sprites: [],
  legend: [],
  rules: [],
  assets: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  elapsed: Date.now(),
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
          elapsed: Date.now() - elapsed,
          frame: state.frame += 1
      }
    default:
      return state
  }
}

export default gameReducer