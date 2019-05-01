import React from 'react';
import './Menu.scss';

export const Menu = ({width, height, play})=> (
  <div className='menu' style={{width, height}}>
    <h1 className='title'>Tiny game</h1>
    <button className='inverted' onClick={play}>
      Play again
    </button>
  </div>
);
