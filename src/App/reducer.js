import uniqid from 'uniqid';
import {EMPTY_GAME, examples} from '../ExamplesModal/exampleCode'
import Plain from 'slate-plain-serializer'


const initialGame = {
  name: 'UNTITILED GAME',
  id: uniqid(),
  code: Plain.deserialize(examples.gravity_flip)
}

const defaultState = {
  name: initialGame.name,
  code: initialGame.code,
  id: initialGame.id,
  games: [initialGame],
  theme: 'dark',
  user: null,
  active: false
}


const appReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_ACTIVE':
      return {
        ...state,
        active: action.active
      }
    case 'TOGGLE_THEME': {
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    }
    case 'SET_NAME':
      return {
        ...state,
        name: action.name
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.user
      }
    case 'SIGN_OUT':
      return {
        ...state,
        user: null
      }
    case 'SET_GAMES':
      return {
        ...state,
        games: action.games
      }
    case 'SET_CURRENT_GAME':
      return {
        ...state,
        currentGame: action.currentGame
      }
    case 'UPDATE_CODE':
      return {...state, code: action.code}
    case 'LOAD_SUCCESS':
      return {
        ...state,
        code: action.code
      }
    case 'LOAD_CODE':
      return {
        ...state,
        code: action.code
      }
    default:
      return state
  }
}

export default appReducer