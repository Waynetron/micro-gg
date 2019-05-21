import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'
import styled, {css} from 'styled-components'

const getPositionStyle = (x, y)=> ({
  position: 'relative', left: x, top: y
});

const SpriteContainer = styled.div`
  width: 0;
  height: 0;

  ${props => props.flash && css`
    filter: brightness(2);
  `}
`

const Sprite = ({x, y, imageName, availableImages, letter, imageMap, sprite, debug})=> {
  const imageFilename = getImageFilename(imageName, imageMap, availableImages)

  return <SpriteContainer
    style={getPositionStyle(x, y)}
    flash={sprite.flash}
  >
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
  </SpriteContainer>
};

export default Sprite;
