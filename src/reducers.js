import {combineReducers} from 'redux';
import appReducer from './App/reducer.js';
import gameReducer from './Game/reducer.js';
import spriteEditorReducer from './SpriteEditor/reducer.js';

export default combineReducers({
  app: appReducer,
  game: gameReducer,
  spriteEditor: spriteEditorReducer
})
