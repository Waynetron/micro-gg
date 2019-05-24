import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'
import styled, {css} from 'styled-components'
import {TILE_SIZE} from './constants'

const SpriteContainer = styled.div.attrs(({ position, flash }) => ({
  style: {
    left: position.x,
    top: position.y,
    filter: flash ? 'brightness(2)' : 'none'
  }
}))
`
  position: relative;
  width: 0;
  height: 0;
`;

const Inner = styled.div.attrs(({ flip, mirror, rotation }) => ({
  style: {
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    // transform: `${flip && 'transform: scaleY(-1)'} ${mirror && 'transform: scaleX(-1)'} ${rotation && `transform: rotation3d(0, 0, 1, ${rotation}deg)`}`
  transform: `
    ${flip ? 'scaleY(-1)' : ''}
    ${mirror ? 'scaleX(-1)' : ''}
    ${rotation ? `rotate3d(0, 0, 1, ${rotation}deg)` : ''}
  `
  }
}))
`
  width: ${TILE_SIZE}px;
  height: ${TILE_SIZE}px;
`;

const Sprite = ({availableImages, imageMap, sprite, debug})=> {
  const {position, letter, name, flash, flip, mirror, rotation} = sprite
  const imageFilename = getImageFilename(name, imageMap, availableImages)

  return <SpriteContainer
    position={position}
    flash={flash}
  >
    <Inner
      mirror={mirror}
      flip={flip}
      rotation={rotation}
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
    </Inner>
  </SpriteContainer>
};

export default Sprite;
