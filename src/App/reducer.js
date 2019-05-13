import uniqid from 'uniqid';
import {EMPTY_GAME} from '../ExamplesModal/exampleCode'
import Plain from 'slate-plain-serializer'


const createNewGame = ()=> ({
  name: 'UNTITILED GAME',
  id: uniqid(),
  code: Plain.deserialize(EMPTY_GAME)
})

const initialGame = createNewGame()

const defaultState = {
  name: initialGame.name,
  code: initialGame.code, 
  id: initialGame.id,
  games: [initialGame],
  user: null
}


const appReducer = (state = defaultState, action) => {
  switch (action.type) {
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