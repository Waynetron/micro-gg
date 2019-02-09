import React from 'react';
import Sprite from './Sprite.js';
import {connect} from 'react-redux'

const Game = ({sprites, rules, width, height, error, debug})=> (
  <div id="game">
    <div className='stage' style={{width, height}}>
      {error && <p className='error' >{error}</p>}
      {sprites.map((sprite)=>
        <Sprite
          key={sprite.id}
          x={sprite.position.x}
          y={sprite.position.y}
          img={sprite.name.toLowerCase()}
          sprite={sprite} // used for debug visualisation
          debug={debug}
        />
      )}
    </div>
  </div>
)

const mapStateToProps = ({game})=> {
  const {sprites, rules, width, height, debug, error} = game;
  return {
    sprites,
    rules,
    width,
    height,
    error,
    debug
  }
}

export default connect(
  mapStateToProps
)(Game);
