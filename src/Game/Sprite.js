import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'
import './Sprite.css';

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const Sprite = ({x, y, imageName, availableImages, letter, imageMap, sprite, debug})=> {
  const imageFilename = getImageFilename(imageName, imageMap, availableImages)

  return <div className="sprite" style={getPositionStyle(x, y)}>
    {imageFilename
      ? <img
          alt=''
          src={require(`../Game/images/${imageFilename}.png`)}
        />
      : <LetterImage
          letter={letter}
        />
    }
    {debug && <DebugColliding sprite={sprite} />}
  </div>
};

export default Sprite;
