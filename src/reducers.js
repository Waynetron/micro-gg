import {combineReducers} from 'redux';
import codeReducer from './Code/reducer.js';
import gameReducer from './Game/reducer.js';

export default combineReducers({
  code: codeReducer,
  game: gameReducer
})