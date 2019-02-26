import React from 'react';
import Sprite from './Sprite.js';

const Game = ({sprites, width, height, imageMap, error, debug})=> (
  <div className='stage' style={{width, height}}>
    {error && <p className='error' >{error}</p>}
    {sprites.map((sprite)=>
      <Sprite
        key={sprite.id}
        x={sprite.position.x}
        y={sprite.position.y}
        img={imageMap[sprite.name]}
        sprite={sprite} // used for debug visualisation
        debug={debug}
      />
    )}
  </div>
);

export default Game