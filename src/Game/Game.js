import React from 'react';
import Sprite from './Sprite.js';
import {connect} from 'react-redux'
import {HotKeys} from 'react-hotkeys';
import { setInput } from './actions.js';

const keyMap = {
  'up': 'up',
  'down': 'down',
  'left': 'left',
  'right': 'right',
  'action1': 'x',
  'action2': 'z',
};

const handlers = (onSetInput)=> ({
  'up': ()=> onSetInput('up'),
  'down': ()=> onSetInput('down'),
  'left': ()=> onSetInput('left'),
  'right': ()=> onSetInput('right'),
  'action1': ()=> onSetInput('action1'),
  'action2': ()=> onSetInput('action2'),
});

const Game = ({sprites, rules, width, height, onSetInput})=> (
  <HotKeys handlers={handlers(onSetInput)} keyMap={keyMap}>
    <div id="game">
      <div className="stage" style={{width, height}}>
        {sprites.map((sprite)=>
          <Sprite
            key={sprite.id}
            x={sprite.position.x}
            y={sprite.position.y}
            img={sprite.src}
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
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
