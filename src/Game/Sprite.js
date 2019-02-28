import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import './Sprite.css';

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const Sprite = ({x, y, img, sprite, debug})=> (
  <div className="sprite" style={getPositionStyle(x, y)}>
    <img src={require(`./images/${img}.png`)} alt='' />
    {debug && <DebugColliding sprite={sprite} />}
  </div>
);

export default Sprite;
