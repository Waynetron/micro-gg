import React from 'react';
import Sprite from './Sprite.js';
import {connect} from 'react-redux'

const TILE_SIZE = 32;

const Game = ({sprites, rules, width, height})=> (
  <div id="game">
    <div className="stage" style={{width, height}}>
      {sprites.map((sprite)=>
        <Sprite
          x={sprite.tilePosition.col * TILE_SIZE}
          y={sprite.tilePosition.row * TILE_SIZE}
          img={sprite.src}
        />
      )}
    </div>
    <h3>Rules</h3>
      {rules.map((rule)=> <p>{rule}</p>)}
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
