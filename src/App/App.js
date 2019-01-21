import React, {Fragment} from 'react';
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys';
import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Code from '../Code/Code.js';
import {compile, setActive} from '../Code/actions';
import {toggleDebug} from '../Game/actions.js';
import {setInput, cancelInput} from './actions.js';
import './App.scss';

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

const App = ({code, compile, isGameActive, setGameActive, onToggleDebug, onSetInput, onCancelInput})=> {
  return (
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
      <div className="main">
        <div className="left">
          <header><h1>micro gg</h1></header>
          <Code />
        </div>
        <div className="right">
          <header>
            <button className='primary' onClick={()=> compile(code)}>reset</button>
            <button className='secondary' onClick={()=> setGameActive(!isGameActive)}>
              {isGameActive ? 'pause' : 'run'}
            </button>
            {isGameActive && <Loop />}
          </header>
          <Game />
        </div>
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
  },
  onToggleDebug: ()=> {
    dispatch(toggleDebug());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
