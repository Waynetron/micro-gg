import React from 'react';
import Sprite from './Sprite.js';

const Game = ({sprites, width, height, availableImages, imageMap, error, debug})=> (
  <div className='stage' style={{width, height}}>
    {error && <p className='error' >{error}</p>}
    {sprites.map((sprite)=>
      <Sprite
        key={sprite.id}
        x={sprite.position.x}
        y={sprite.position.y}
        imageName={sprite.name}
        letter={sprite.letter}
        imageMap={imageMap}
        availableImages={availableImages}
        
        // debug visualisation
        sprite={sprite}
        debug={debug}
      />
    )}
  </div>
);

export default Game