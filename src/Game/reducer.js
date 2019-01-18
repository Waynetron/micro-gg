import {flatten} from 'lodash-es';
import {parseRules, parseSprites, parseLegend, parseLevel,
  getLevelDimensions} from '../util/parse.js';
import {ruleToStateTransition, collisionRuleToStateTransitions, applyStateTransition,
  isAlive} from '../util/state.js'
import {storePreviousPosition, applyAcceleration, applyVelocity, applyFriction,
  updateSpriteCollidingState, applySpriteCollisions, roundToPixels,
  applyWallCollisions, resetColliding
} from './physics';
import {TILE_SIZE} from '../Game/constants.js'

const defaultState = {
  sprites: [],
  legend: {},
  names: {},
  rules: [],
  stateTransitions: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  elapsed: {
    sinceLastFrame: 0,
    totalFrames: 0
  },
  active: false,
  debug: false
};

const arrayToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item] = true
     return obj
   }, {})

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_ACTIVE':
      return {...state, active: action.active}
      
    case 'UPDATE_CODE':
      return {...state, code: action.code}

    case 'TOGGLE_DEBUG':
      return {...state, debug: !state.debug}

    case 'COMPILE':
      const {code} = action;
      const level = parseLevel(code);
      const legend = parseLegend(code);
      // names is the legend mapped to have the values as keys. Used for fast name lookup.
      const names = arrayToObject(Object.values(legend));
      const sprites = parseSprites(level, legend);
      
      // A rule consists of a before and an after state referred to as a state transition
      const [rules, collisionRules] = parseRules(code);
      const stateTransitions = rules.map((rule)=> ruleToStateTransition(rule, names)); // [leftState, rightState]

      // collisionRules are a bit more complicated
      const collisionStateTransitionPairs = collisionRules.map(
        (rule)=> collisionRuleToStateTransitions(rule, names)
      );
      const collisionStateTransitions = flatten(collisionStateTransitionPairs);

      const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

      return {
        ...defaultState,
        sprites,
        legend,
        names,
        rules,
        stateTransitions: [...stateTransitions, ...collisionStateTransitions],
        width: width_in_tiles * TILE_SIZE,
        height: height_in_tiles * TILE_SIZE
      }

    case 'UPDATE_ELAPSED':
      const {elapsed} = action;
      const previousState = {...state};
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
          sprites: state.sprites.filter(isAlive)
              |> ((sprites)=> sprites.map(resetColliding))
              |> ((sprites)=> sprites.map((sprite)=> updateSpriteCollidingState(
                sprite, state.sprites, state.width, state.height
              )))
              |> ((sprites)=> sprites.map(storePreviousPosition))
              |> ((sprites)=> sprites.map((sprite)=> applyStateTransition(sprite, state.stateTransitions)))
              |> ((sprites)=> sprites.map(applyFriction))
              |> ((sprites)=> sprites.map(applyAcceleration))
              |> ((sprites)=> sprites.map(applyVelocity))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
              // |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisionsCrossMethod(sprite, state.sprites, previousState)))
              |> ((sprites)=> sprites.map((sprite)=> applyWallCollisions(sprite, state.width, state.height)))
              |> ((sprites)=> sprites.map(roundToPixels))
      }
    case 'SET_INPUT':
      return {
        ...state,
        sprites: state.sprites.map(
          (sprite)=> ({...sprite, inputs: {...sprite.inputs, [action.input]: true}})
        )
      };

    case 'CANCEL_INPUT':
      return {
        ...state,
        sprites: state.sprites.map(
          (sprite)=> {
            const newInputs = {...sprite.inputs};
            newInputs[action.input] = undefined;
            return {...sprite, inputs: newInputs}
          }
        )
      };

    default:
      return state
  }
}

export default gameReducer