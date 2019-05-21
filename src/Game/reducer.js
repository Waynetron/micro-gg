import {parseRules, parseSprites, parseLegend, parseLevel, parseNames,
  parseVariables, getLevelDimensions} from '../util/parse.js'
import {getStateTransitions, isAlive, getNewStateToAdd, addNewState,
  applyStateTransitions, flagDeadForRemoval, flashDead} from '../util/state.js'
import {storePreviousPosition, applyAcceleration, applyVelocity, applyFriction,
  updateSpriteCollidingState, updateSpritePositioningState,
  applySpriteCollisions, applyWallCollisions, roundToPixels,
  resetColliding, resetPositioning
} from './physics';
import {TILE_SIZE} from '../Game/constants.js'
import Plain from 'slate-plain-serializer';

const defaultState = {
  currentView: 'game',
  sprites: [],
  effects: [],
  names: {},
  width_in_tiles: 0,
  height_in_tiles: 0,
  active: false,
  debug: false,
  imageMap: {},
  rules: {
    regular: [],
    collisionCreate: [],
    collisionModify: []
  },
  stateTransitions: {
    regular: {}
  },
  availableImages: ['Player', 'Brick', 'QuestionBrick', 'Spike', 'Goomba', 'GoombaRed'],
  freezeFrames: 0,
  shake: false
}

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

    case 'TOGGLE_DEBUG': {
      return {
        ...state,
        debug: !state.debug
      }
    }
    
    case 'SET_IMAGE': {
      const imageMap = {...state.imageMap}
      const {variableName, imageName} = action
      imageMap[variableName] = imageName
      
      return {
        ...state,
        imageMap
      }
    }
    
    case 'SET_NO_IMAGE': {
      const imageMap = {...state.imageMap}
      const {variableName} = action
      imageMap[variableName] = null
      // null means the user intended to use ascii
      // whereas undefined is a lack of choice - we do not know what the user wants
      // So we can switch on undefined in places to show default images for some
      // sprites: Player, Goomba etc
      
      return {
        ...state,
        imageMap
      }
    }
    
    case 'COMPILE': {
      try {
        const {serialize} = Plain
        const level = action.code |> serialize |> removeComments |> parseLevel
        const legend = action.code |> serialize |> removeComments |> parseLegend
        const sprites = parseSprites(level, legend)
    
      // Names is the legend mapped to have the values as keys. Used for fast name lookup.
      // this used to use the legend before the random features were added.
      // For this to work though, names needs to include all possible names, including those that might not be rendered onto
      // the map the first time it is loaded. I suppose later on this should also include things spawned within rules that may
      // not also appear in the legend.
      // Ideally, I could refactor out this names object entirely. It seems like that should be possible.
      const namesArr = parseNames(action.code |> serialize);
      const names = arrayToObject(namesArr);

      const variables = parseVariables(action.code |> serialize);
      
      // const imageMap = {...state.imageMap};
      // for (const name of namesArr) {
      //   if (!imageMap[name]) {
      //     const imageAvailable = state.images.includes(name)
      //     imageMap[name] = imageAvailable ? name : 'player';
      //   }
      // }

        // A rule consists of a before and an after state
        const rules = parseRules(
          action.code |> serialize |> removeComments,
          names,
          variables
        )

        const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

        return {
          ...defaultState,
          sprites,
          rules,
          width: width_in_tiles * TILE_SIZE,
          height: height_in_tiles * TILE_SIZE,
          names,
          imageMap: {...state.imageMap}
          // imageMap
        }
      }
      catch(err) {
        console.error(err);
        return {
          ...defaultState,
          error: 'Compilation error 😞'
        }
      }
    }

    case 'UPDATE': {
      if (state.currentView !== 'game') {
        return state;
      }

      // Decrement freezeFrames
      if (state.freezeFrames > 0) {
        return {
          ...state,
          freezeFrames: state.freezeFrames - 1
        }
      }

      const spritesToKeep = state.sprites.filter((sprite)=> !sprite.remove)
      
      const alive = spritesToKeep.filter(isAlive)
      const somethingDied = spritesToKeep.length - alive.length > 0

      if (somethingDied) {
        const newSprites = spritesToKeep
        |> ((sprites)=> sprites.map(flashDead))
        |> ((sprites)=> sprites.map(flagDeadForRemoval))

        return {
          ...state,
          sprites: newSprites,
          freezeFrames: 5,
          shake: true
        }
      }

      const previousState = {...state};
      const stateToAdd = getNewStateToAdd(spritesToKeep, state.rules.create)
      
      const stateTransitions = {
        modify: getStateTransitions(state.rules.modify, spritesToKeep),
        create: getStateTransitions(state.rules.create, spritesToKeep),
      }

      const winners = spritesToKeep.filter((sprite)=> Boolean(sprite.win))

      // Dead sprites aren't removed right away, instead they are flashed
      // white then flagged for removal.
      // This allows for them to stay on screen in their flashed state for
      // the duration of the freezeFrames

      const newSprites = spritesToKeep
        |> ((sprites)=> addNewState(sprites, stateToAdd))
        |> ((sprites)=> sprites.map(resetColliding))
        |> ((sprites)=> sprites.map(resetPositioning))
        |> ((sprites)=> sprites.map((sprite)=> updateSpriteCollidingState(
          sprite, spritesToKeep, state.width, state.height
        )))
        |> ((sprites)=> sprites.map((sprite)=> updateSpritePositioningState(
          sprite, spritesToKeep
        )))
        |> ((sprites)=> sprites.map(storePreviousPosition))
        |> ((sprites)=> applyStateTransitions(stateTransitions.modify, sprites))
        |> ((sprites)=> sprites.map(applyFriction))
        |> ((sprites)=> sprites.map(applyAcceleration))
        |> ((sprites)=> sprites.map(applyVelocity))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applyWallCollisions(sprite, state.width, state.height)))
        |> ((sprites)=> sprites.map(roundToPixels))
        
      return {
          ...state,
          sprites: newSprites,
          stateTransitions,
          currentView: winners.length > 0 ? 'menu' : state.currentView,
          shake: false
      }
    }

    case 'SET_INPUT': {
      return {
        ...state,
        sprites: state.sprites.map(
          (sprite)=> ({...sprite, inputs: {...sprite.inputs, [action.input]: true}})
        )
      };
    }

    case 'CANCEL_INPUT': {
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
    }

    default: {
      return state
    }
  }
}

export default gameReducer