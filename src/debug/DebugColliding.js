import React from 'react';
import './debug.scss';

export const DebugColliding = ({sprite})=> (
  <div className='debug-colliding'>
    {Object.entries(sprite.colliding).map(([key, value], index)=> 
      <p className={`number ${key} ${value.length > 0 && 'active'}`}>
        {value.length}
      </p>
    )}
  </div>
)