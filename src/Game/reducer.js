import {flatten} from 'lodash';
import {parseRules, parseSprites, parseLegend, parseLevel, parseNames,
  getLevelDimensions} from '../util/parse.js';
import {ruleToStateTransition, collisionRuleToStateTransitions, applyStateTransitions,
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
  stateTransitions: [],
  width_in_tiles: 0,
  height_in_tiles: 0,
  active: false,
  theme: 'dark',
  debug: false,
  imageMap: {},
  images: ['player', 'brick', 'questionbrick', 'spike', 'goomba', 'goombared']
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
      return {
        ...state,
        active: action.active
      }

    case 'TOGGLE_DEBUG':
      return {
        ...state,
        debug: !state.debug
      }
    
    case 'SELECT_IMAGE':
      const imageMap = {...state.imageMap}
      const {variableName, imageName} = action
      imageMap[variableName] = imageName;
      return {
        ...state,
        imageMap
      }
    
    case 'COMPILE':
      try {
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
      const namesArr = parseNames(code);
      const names = arrayToObject(namesArr);
      
      const imageMap = {...state.imageMap};
      for (const name of namesArr) {
        if (!imageMap[name]) {
          const imageAvailable = state.images.includes(name.toLowerCase())
          imageMap[name] = imageAvailable ? name.toLowerCase() : 'player';
        }
      }

        // A rule consists of a before and an after state referred to as a state transition
        const [rules, collisionRules] = parseRules(code);
        const stateTransitions = rules.map((rule)=> ruleToStateTransition(rule, names)); // [leftState, rightState]

        // collisionRules are a bit more complicated
        const collisionStateTransitionPairs = collisionRules.map(
          (rule)=> collisionRuleToStateTransitions(rule, names)
        );
        const collisionStateTransitions = flatten(collisionStateTransitionPairs);
        
        // separate the collisionStateTransitions into 2 groups: 
          // those that will spawn new state
          // and those that will modify existing state
        const collisionStateTransitionsCreate = collisionStateTransitions.filter(isCreateNewState);
        const collisionStateTransitionsModify = collisionStateTransitions.filter((e)=> !isCreateNewState(e));

        const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

        return {
          ...defaultState,
          sprites,
          legend,
          rules: [...rules, ...collisionRules],
          stateTransitions,
          collisionStateTransitionsCreate,
          collisionStateTransitionsModify,
          width: width_in_tiles * TILE_SIZE,
          height: height_in_tiles * TILE_SIZE,
          names,
          imageMap
        }
      }
      catch(err) {
        console.error(err);
        return {
          ...defaultState,
          error: 'Compilation error 😞'
        }
      }

    case 'UPDATE':
      const previousState = {...state};
      const stateToAdd = getNewStateToAdd(state.sprites, state.collisionStateTransitionsCreate);
      return {
          ...state,
          sprites: state.sprites.filter(isAlive)
              |> ((sprites)=> addNewState(sprites, stateToAdd))
              |> ((sprites)=> sprites.map(resetColliding))
              |> ((sprites)=> sprites.map((sprite)=> updateSpriteCollidingState(
                sprite, state.sprites, state.width, state.height
              )))
              |> ((sprites)=> sprites.map(storePreviousPosition))
              |> ((sprites)=> sprites.map((sprite)=> applyStateTransitions(sprite, state.stateTransitions)))
              |> ((sprites)=> sprites.map((sprite)=> applyStateTransitions(sprite, state.collisionStateTransitionsModify)))
              |> ((sprites)=> sprites.map(applyFriction))
              |> ((sprites)=> sprites.map(applyAcceleration))
              |> ((sprites)=> sprites.map(applyVelocity))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
              |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, state.sprites, previousState)))
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