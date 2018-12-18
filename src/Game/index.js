import React from 'react';
import Sprite from './Sprite.js';

const Game = ({sprites, rules})=> (
  <div id="game">
    <h3>Sprites</h3>
    {sprites.map((sprite)=>
      <Sprite x={10} y={10} img={sprite.src} />
    )}
    <h3>Rules</h3>
    {rules.map((rule)=> <p>{rule}</p>)}
  </div>
);

export default Game;
