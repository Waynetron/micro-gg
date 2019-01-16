import React from 'react';
import Sprite from './Sprite.js';
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys';
import {setInput, cancelInput} from './actions.js';

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

const handlers = (onSetInput, onCancelInput)=> ({
  'up': ()=> onSetInput('up'),
  'down': ()=> onSetInput('down'),
  'left': ()=> onSetInput('left'),
  'right': ()=> onSetInput('right'),
  'action1': ()=> onSetInput('action1'),
  'action2': ()=> onSetInput('action2'),

  'cancel_up': ()=> onCancelInput('up'),
  'cancel_down': ()=> onCancelInput('down'),
  'cancel_left': ()=> onCancelInput('left'),
  'cancel_right': ()=> onCancelInput('right'),
  'cancel_action1': ()=> onCancelInput('action1'),
  'cancel_action2': ()=> onCancelInput('action2'),
});

const Game = ({sprites, rules, width, height, onSetInput, onCancelInput})=> (
  <HotKeys handlers={handlers(onSetInput, onCancelInput)} keyMap={keyMap}>
    <div id="game">
      <div className="stage" style={{width, height}}>
        {sprites.map((sprite)=>
          <Sprite
            key={sprite.id}
            x={sprite.position.x}
            y={sprite.position.y}
            img={sprite.name.toLowerCase()}
          />
        )}
      </div>
    </div>
  </HotKeys>
)

const mapStateToProps = ({game})=> {
  const {sprites, rules, width, height} = game;
  return {
    sprites,
    rules,
    width,
    height,
  }
}

const mapDispatchToProps = (dispatch)=> {
  return {
    onSetInput: (input)=> {
      dispatch(setInput(input));
    },
    onCancelInput: (input)=> {
      dispatch(cancelInput(input));
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
