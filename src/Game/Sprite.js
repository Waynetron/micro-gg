import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'
import styled, {css} from 'styled-components'

const SpriteContainer = styled.div`
  position: relative;
  width: 0;
  height: 0;
  left: ${props => props.x}px;
  top: ${props => props.y}px;

  ${props => props.flash && css`
    filter: brightness(2);
  `}
`

const Sprite = ({x, y, imageName, availableImages, letter, imageMap, sprite, debug})=> {
  const imageFilename = getImageFilename(imageName, imageMap, availableImages)

  return <SpriteContainer
    flash={sprite.flash}
    x= {x}
    y= {y}
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
