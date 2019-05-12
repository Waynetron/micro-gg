import React from 'react'
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys'
import {setInput, cancelInput, toggleTheme} from '../App/actions.js'
import {toggleDebug} from '../Game/actions.js'


const keyMap = {
  'up': {sequence: 'up', action: 'keydown'},
  'down': {sequence: 'down', action: 'keydown'},
  'left': {sequence: 'left', action: 'keydown'},
  'right': {sequence: 'right', action: 'keydown'},
  'action1': {sequence: 'x', action: 'keydown'},
  'action2': {sequence: 'z', action: 'keydown'},

  'cancel_up': {sequence: 'up', action: 'keyup'},
  'cancel_down': {sequence: 'down', action: 'keyup'},
  'cancel_left': {sequence: 'left', action: 'keyup'},
  'cancel_right': {sequence: 'right', action: 'keyup'},
  'cancel_action1': {sequence: 'x', action: 'keyup'},
  'cancel_action2': {sequence: 'z', action: 'keyup'},
};

const handlers = (onSetInput, onCancelInput, onReset, onRun, onToggleDebug, isGameActive)=> ({
  'up': ()=> onSetInput('up'),
  'down': ()=> onSetInput('down'),
  'left': ()=> onSetInput('left'),
  'right': ()=> onSetInput('right'),
  'action1': ()=> onSetInput('action1'),
  'action2': ()=> onSetInput('action2'),
  'r': ()=> onReset(),
  'd': ()=> onToggleDebug(),
  'space': ()=> onRun(!isGameActive),

  'cancel_up': ()=> onCancelInput('up'),
  'cancel_down': ()=> onCancelInput('down'),
  'cancel_left': ()=> onCancelInput('left'),
  'cancel_right': ()=> onCancelInput('right'),
  'cancel_action1': ()=> onCancelInput('action1'),
  'cancel_action2': ()=> onCancelInput('action2'),
});

const Keyboard = ({
    code, compile, isGameActive, setGameActive, onToggleDebug,
    onSetInput, onCancelInput, children
})=>
  <HotKeys
    handlers={handlers(
      onSetInput,
      onCancelInput,
      ()=> compile(code),
      (active)=> setGameActive(active),
      ()=> onToggleDebug(),
      isGameActive
    )}
    keyMap={keyMap}
  >
  {children}
  </HotKeys>

const mapStateToProps = ({app, game})=> ({
  user: app.user,
  name: app.name,
  id: app.id,
  code: app.code,
  theme: game.theme,
  isGameActive: game.active,
  sprites: game.sprites,
  imageMap: game.imageMap,
  width: game.width,
  height: game.height,
  debug: game.debug,
  error: game.error,
  currentView: game.currentView
})

const mapDispatchToProps = (dispatch)=> ({
  compile: (code)=> {
    dispatch({
      type: 'COMPILE',
      code
    });
  },
  setGameActive: (active)=> {
    dispatch({
      type: 'SET_ACTIVE',
      active
    });
  },
  onSetInput: (input)=> {
    dispatch(setInput(input));
  },
  onCancelInput: (input)=> {
    dispatch(cancelInput(input));
  },
  onToggleDebug: ()=> {
    dispatch(toggleDebug());
  },
  onToggleTheme: ()=> {
    dispatch(toggleTheme());
  },
  onOpenCloseSpriteEditor: (open)=> {
    dispatch({type: 'spriteEditor/SET_OPEN', open: open})
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Keyboard);
