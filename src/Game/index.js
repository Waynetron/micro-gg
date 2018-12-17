import React from 'react';

const Game = ({sprites, rules})=> (
  <div id="game">
    <h3>Sprites</h3>
    {sprites.map((sprite)=> <p>{sprite.name}, {sprite.src}</p>)}
    <h3>Rules</h3>
    {rules.map((rule)=> <p>{rule}</p>)}
  </div>
);

export default Game;
