import uniqid from 'uniqid';
import {EMPTY_GAME} from '../Examples/exampleCode'
import Plain from 'slate-plain-serializer'

const defaultState = {
  name: 'Untitled game',
  code: Plain.deserialize(EMPTY_GAME), 
  id: uniqid(),
  games: [],
  user: null
}


const appReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.user
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
    case 'LOAD_PRESET':
      return {
        ...state,
        code: action.code
      }
    default:
      return state
  }
}

export default appReducer