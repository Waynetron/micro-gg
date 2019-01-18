import React, {Fragment} from 'react';
import {connect} from 'react-redux'
import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Code from '../Code/Code.js';
import {compile, setActive} from '../Code/actions';
import {HotKeys} from 'react-hotkeys';
import {setInput, cancelInput} from './actions.js';
import './App.css';

const keyMap = {
  'up': {sequence: 'up', action: 'keydown'},
  'down': {sequence: 'down', action: 'keydown'},
  'left': {sequence: 'left', action: 'keydown'},
  'right': {sequence: 'right', action: 'keydown'},
  'action1': {sequence: 'action1', action: 'keydown'},
  'action2': {sequence: 'action2', action: 'keydown'},

  'cancel_up': {sequence: 'up', action: 'keyup'},
  'cancel_down': {sequence: 'down', action: 'keyup'},
  'cancel_left': {sequence: 'left', action: 'keyup'},
  'cancel_right': {sequence: 'right', action: 'keyup'},
  'cancel_action1': {sequence: 'action1', action: 'keyup'},
  'cancel_action2': {sequence: 'action2', action: 'keyup'},
};

const handlers = (onSetInput, onCancelInput, onReset, onRun, isGameActive)=> ({
  'up': ()=> onSetInput('up'),
  'down': ()=> onSetInput('down'),
  'left': ()=> onSetInput('left'),
  'right': ()=> onSetInput('right'),
  'action1': ()=> onSetInput('action1'),
  'action2': ()=> onSetInput('action2'),
  'r': ()=> onReset(),
  'space': ()=> onRun(!isGameActive),

  'cancel_up': ()=> onCancelInput('up'),
  'cancel_down': ()=> onCancelInput('down'),
  'cancel_left': ()=> onCancelInput('left'),
  'cancel_right': ()=> onCancelInput('right'),
  'cancel_action1': ()=> onCancelInput('action1'),
  'cancel_action2': ()=> onCancelInput('action2'),
});

const App = ({code, compile, isGameActive, setGameActive, onSetInput, onCancelInput})=> {
  return (
    <HotKeys
      handlers={handlers(
        onSetInput,
        onCancelInput,
        ()=> compile(code),
        (active)=> setGameActive(active),
        isGameActive
      )}
      keyMap={keyMap}
    >
      <header>
        <button onClick={()=> compile(code)}>reset</button>
        <button onClick={()=> setGameActive(!isGameActive)}>
          {isGameActive ? 'pause' : 'run'}
        </button>
        {isGameActive && <Loop />}
      </header>
      <div className="content">
        <Code />
        <Game />
      </div>
    </HotKeys>
  );
};

const mapStateToProps = ({code, game})=> ({
  code: code.code,
  isGameActive: game.active
})

const mapDispatchToProps = (dispatch)=> ({
  compile: (code)=> {
    dispatch(compile(code));
  },
  setGameActive: (active)=> {
    dispatch(setActive(active));
  },
  onSetInput: (input)=> {
    dispatch(setInput(input));
  },
  onCancelInput: (input)=> {
    dispatch(cancelInput(input));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
