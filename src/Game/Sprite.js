import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import './Sprite.css';

const safelyLoadSrc = (img)=> {
  const images = ['player', 'brick', 'questionbrick', 'spike', 'goomba', 'goombared'];
  return images.includes(img)
    ? require(`./images/${img}.png`)
    : null
};

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const Sprite = ({x, y, img, sprite, debug})=> (
  <div className="sprite" style={getPositionStyle(x, y)}>
    <img src={safelyLoadSrc(img)} alt='' />
    {debug && <DebugColliding sprite={sprite} />}
  </div>
);

export default Sprite;
