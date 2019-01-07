import React from 'react';
import Sprite from './Sprite.js';
import {connect} from 'react-redux'

const Game = ({sprites, rules, width, height})=> (
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
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);
