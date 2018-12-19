import React from 'react';
import Sprite from './Sprite.js';

const TILE_SIZE = 32;

const Game = ({sprites, rules, width_in_tiles, height_in_tiles})=> {
  const width = width_in_tiles * TILE_SIZE;
  const height = height_in_tiles * TILE_SIZE;

  console.log(width, height);
  
  return (
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
};

export default Game;
