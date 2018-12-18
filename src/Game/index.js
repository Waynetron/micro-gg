import React from 'react';
import Sprite from './Sprite.js';
import styles from './styles.css';

const Game = ({sprites, rules})=> (
  <div id="game">
    <div className="stage">
      {sprites.map((sprite)=>
        <Sprite x={10} y={10} img={sprite.src} />
      )}
    </div>
    <h3>Rules</h3>
      {rules.map((rule)=> <p>{rule}</p>)}
  </div>
);

export default Game;
