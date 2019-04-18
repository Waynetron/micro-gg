import React from 'react';
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys';

import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Code from '../Code/Code.js';
import SpriteEditor from '../SpriteEditor/SpriteEditor';
import ExamplesModal from '../Examples/ExamplesModal';
import {toggleDebug} from '../Game/actions.js';
import {setInput, cancelInput, toggleTheme} from './actions.js';
import CustomProperties from 'react-custom-properties';
import './App.scss';

const darkColors = {
  primary: '#F1A0A0',
  secondary: '#87FFAE',
  dark: '#000000',
  light: '#FDF6E2'
}

const lightColors = {
  primary: '#43153F',
  secondary: '#87FFAE',
  dark: '#FDF6E2',
  light: '#FFFFFF'
}

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

const App = ({
    legend, level, rules, compile, theme, sprites, imageMap, width, height, debug,
    error, isGameActive, currentView, setGameActive, onToggleDebug, onSetInput,
    onCancelInput, onToggleTheme, onOpenCloseSpriteEditor
})=> {
  const colors = theme === 'light' ? lightColors : darkColors;
  
  return (
    <CustomProperties className="custom-properties-container" properties={{
      '--primary-color': colors.primary,
      '--secondary-color': colors.secondary,
      '--dark-color': colors.dark,
      '--light-color': colors.light,
      '--hover-color': `${colors.primary}22`  // 22 is is the alpha in hex
    }}>
      <div className="main">
        <div className="left">
          <header>
            <h1 className='logo'>micro gg</h1>
            <ExamplesModal />
            <button className='primary' onClick={()=> onToggleTheme()}>
              {theme === 'dark' ? 'light' : 'dark'}
            </button>
          </header>
          <Code imageMap={imageMap} />
        </div>
        <HotKeys
          handlers={handlers(
            onSetInput,
            onCancelInput,
            ()=> compile(level, legend, rules),
            (active)=> setGameActive(active),
            ()=> onToggleDebug(),
            isGameActive
          )}
          keyMap={keyMap}
        >
          <div className="right">
            <header>
              <button
                className='primary'
                onClick={()=> compile(level, legend, rules)}>
                compile
              </button>
              <button className='secondary' onClick={()=> setGameActive(!isGameActive)}>
                {isGameActive ? 'pause' : 'run'}
              </button>
              {isGameActive && <Loop />}
            </header>
            <div className="game-container">
              <SpriteEditor
                onClose={()=> onOpenCloseSpriteEditor(false)}
              />
              {currentView === 'game'
                ? <Game
                    sprites={sprites}
                    imageMap={imageMap}
                    width={width}
                    height={height}
                    debug={debug}
                    error={error}
                  />
                : <p>You are a winner</p>
              }
            </div>
          </div>
        </HotKeys>
      </div>
    </CustomProperties>
  );
};

const mapStateToProps = ({code, game})=> ({
  level: code.level,
  legend: code.legend,
  rules: code.rules,
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
  compile: (level, legend, rules)=> {
    dispatch({
      type: 'COMPILE',
      level, legend, rules
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
