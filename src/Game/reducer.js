import {flatten} from 'lodash-es';
import {parseRules, parseSprites, parseLegend, parseLevel, parseNames,
  getLevelDimensions} from '../util/parse.js';
import {ruleToStateMutation, collisionRuleToStateMutations, applyStateMutation,
  isAlive, isCreateNewState, getNewStateToAdd, addNewState} from '../util/state.js'
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
  stateMutations: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  active: false,
  theme: 'dark',
  debug: false
};

const arrayToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item] = true
     return obj
   }, {})

const removeComments = (code)=>
  code.split('\n').filter(
    (line)=> !line.includes('//')
  ).join('\n')

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_ACTIVE':
      return {...state, active: action.active}
      
    case 'UPDATE_CODE':
      return {...state, code: action.code}

    case 'TOGGLE_DEBUG':
      return {...state, debug: !state.debug}

    case 'COMPILE':
      const code = removeComments(action.code);
      const level = parseLevel(code);
      const legend = parseLegend(code);
      const sprites = parseSprites(level, legend);

      // Names is the legend mapped to have the values as keys. Used for fast name lookup.
      // this used to use the legend before the random features were added.
      // For this to work though, names needs to include all possible names, including those that might not be rendered onto
      // the map the first time it is loaded. I suppose later on this should also include things spawned within rules that may
      // not also appear in the legend.
      // Ideally, I could refactor out this names object entirely. It seems like that should be possible.
      const names = arrayToObject(parseNames(code));
      
      // A rule consists of a before and an after state referred to as a state mutation
      const [rules, collisionRules] = parseRules(code);
      const stateMutations = rules.map((rule)=> ruleToStateMutation(rule, names)); // [leftState, rightState]

      // collisionRules are a bit more complicated
      const collisionStateMutationPairs = collisionRules.map(
        (rule)=> collisionRuleToStateMutations(rule, names)
      );
      const collisionStateMutations = flatten(collisionStateMutationPairs);
      
      // separate the collisionStateMutations into 2 groups: 
        // those that will spawn new state
        // and those that will modify existing state
      const collisionStateMutationsCreate = collisionStateMutations.filter(isCreateNewState);
      const collisionStateMutationsModify = collisionStateMutations.filter((e)=> !isCreateNewState(e));

      const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

      return {
        ...defaultState,
        sprites,
        legend,
        names,
        rules: [...rules, ...collisionRules],
        stateMutations,
        collisionStateMutationsCreate,
        collisionStateMutationsModify,
        width: width_in_tiles * TILE_SIZE,
        height: height_in_tiles * TILE_SIZE
      }

    case 'UPDATE':
      const previousState = {...state};
      const stateToAdd = getNewStateToAdd(state.sprites, state.collisionStateMutationsCreate);
      return {
          ...state,
          sprites: state.sprites.filter(isAlive)
              |> ((sprites)=> addNewState(sprites, stateToAdd))
              |> ((sprites)=> sprites.map(resetColliding))
              |> ((sprites)=> sprites.map((sprite)=> updateSpriteCollidingState(
                sprite, state.sprites, state.width, state.height
              )))
              |> ((sprites)=> sprites.map(storePreviousPosition))
              |> ((sprites)=> sprites.map((sprite)=> applyStateMutation(sprite, state.stateMutations)))
              |> ((sprites)=> sprites.map((sprite)=> applyStateMutation(sprite, state.collisionStateMutationsModify)))
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

    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
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