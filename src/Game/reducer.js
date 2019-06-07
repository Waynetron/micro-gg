import {parseRules, parseSprites, parseVariables, parseMultiVariables, parseLevel, parseNames,
  parseObjects, parseLists, getLevelDimensions} from '../util/parse.js'
import {getStateTransitions, isAlive, getNewStateToAdd, addNewState,
  applyStateTransitions, flagDeadForRemoval, flashDead} from '../util/state.js'
import {storePreviousPosition, applyAcceleration, applyVelocity, applyFriction,
  updateSpriteCollidingState, updateSpritePositioningState,
  applySpriteCollisions, applyWallCollisions, roundToPixels,
  resetColliding, resetPositioning
} from './physics'
import {TILE_SIZE} from '../Game/constants.js'
import Plain from 'slate-plain-serializer'
import uniqid from 'uniqid'

const defaultState = {
  currentView: 'game',
  sprites: [],
  effects: [],
  names: {},
  width_in_tiles: 0,
  height_in_tiles: 0,
  debug: false,
  imageMap: {},
  rules: {
    regular: [],
    create: [],
    modify: []
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

const trimWhitespace = (code)=> {
  return code.split('\n')
    .map((line)=> line.trim())
    .join('\n')
}

const getNextView = (winners, losers)=> {
  if (winners.length > 0 || losers.length > 0) {
    return 'menu'
  } 

  return null
}

const gameReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'TOGGLE_DEBUG': {
      return {
        ...state,
        debug: !state.debug
      }
    }
    
    case 'SET_IMAGE': {
      const imageMap = {...state.imageMap}
      const {variableName, imageName} = action
      imageMap[variableName] = {type: 'image', imageName}
      
      return {
        ...state,
        imageMap
      }
    }
    
    case 'SET_LETTER_IMAGE': {
      const imageMap = {...state.imageMap}
      const {variableName, letter} = action
      imageMap[variableName] = {type: 'ascii', letter}
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
        const code = action.code |> Plain.serialize |> removeComments |> trimWhitespace
        const level = code |> parseLevel
        const variables = code |> parseVariables
        const multiVariables = code |> parseMultiVariables

        let newImageMap = {...state.imageMap}
        for (const [letter, getName] of Object.entries(variables)) {
          const name = getName()
          // Reset ascii characters on compile, because user may have changed the Letter but kept the name
          // We don't want to reset for images, because it's annoying to have that reset on compile
          if (!newImageMap[name] || newImageMap[name].type === 'ascii') {
            newImageMap[name] = {type: 'ascii', letter}
          }
        }
        
        const sprites = parseSprites(level, {...variables, ...multiVariables})
    
        // Names is the variables mapped to have the values as keys. Used for fast name lookup.
        // this used to use the variables before the random features were added.
        // For this to work though, names needs to include all possible names, including those that might
        // not be rendered onto the map the first time it is loaded.
        // I suppose later on this should also include things spawned within rules that may not also
        // appear in the variables.
        // Ideally, I could refactor out this names object entirely. It seems like that should be possible.
        const namesArr = code |> parseNames
        const names = arrayToObject(namesArr)
        
        const objects = code |> parseObjects
        const lists = code |> parseLists

        // A rule consists of a before and an after state
        const rules = parseRules(
          code,
          names,
          {...objects, ...lists}
        )

        const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

        return {
          ...defaultState,
          sprites,
          rules,
          width: width_in_tiles * TILE_SIZE,
          height: height_in_tiles * TILE_SIZE,
          names,
          imageMap: newImageMap
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
      const effectsToKeep = state.effects.filter((effect)=>
          effect.progress < effect.duration
        )
    
      // Freeze frames and add effects if something has died
      const dead = spritesToKeep.filter((sprite)=> isAlive(sprite) === false)
    
      if (dead.length > 0) {
        const newSprites = spritesToKeep
          |> ((sprites)=> sprites.map(flashDead))
          |> ((sprites)=> sprites.map(flagDeadForRemoval))

        const newEffects = dead.map((deadSprite)=> ({
          name: 'explosion',
          duration: 10, // frames
          progress: 0, // removed once progress reaches duration
          id: uniqid(),
          position: deadSprite.position
        }))

        return {
          ...state,
          sprites: newSprites,
          freezeFrames: 5,
          shake: true,
          effects: [...newEffects, ...effectsToKeep]
        }
      }

      const previousState = {...state};
      const stateToAdd = getNewStateToAdd(spritesToKeep, state.rules.create)
      
      const stateTransitions = {
        modify: getStateTransitions(state.rules.modify, spritesToKeep),
        create: getStateTransitions(state.rules.create, spritesToKeep),
      }

      const winners = spritesToKeep.filter((sprite)=> Boolean(sprite.win))
      const losers = spritesToKeep.filter((sprite)=> Boolean(sprite.lose))

      // Dead sprites aren't removed right away, instead they are flashed
      // white then flagged for removal.
      // This allows for them to stay on screen in their flashed state for
      // the duration of the freezeFrames

      const updatedSprites = spritesToKeep
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
        |> ((sprites)=> sprites.map(applyFriction))
        |> ((sprites)=> sprites.map(applyAcceleration))
        |> ((sprites)=> sprites.map(applyVelocity))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applySpriteCollisions(sprite, spritesToKeep, previousState)))
        |> ((sprites)=> sprites.map((sprite)=> applyWallCollisions(sprite, state.width, state.height)))
        |> ((sprites)=> sprites.map(roundToPixels))
        |> ((sprites)=> applyStateTransitions(stateTransitions.modify, sprites))
        
      const updatedEffects = effectsToKeep.map((effect)=> ({
        ...effect,
        progress: effect.progress + 1
      }))

      return {
          ...state,
          sprites: updatedSprites,
          stateTransitions,
          currentView: getNextView(winners, losers) || state.currentView,
          shake: false,
          effects: updatedEffects
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