import React from 'react';
import {DebugColliding} from '../debug/DebugColliding.js';
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'
import styled, {css} from 'styled-components'
import {TILE_SIZE} from './constants'

const SpriteContainer = styled.div`
  position: relative;
  width: 0;
  height: 0;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;

  ${props => props.flash && css`
    filter: brightness(2);
  `}
`

const Inner = styled.div`
  width: ${TILE_SIZE}px;
  height: ${TILE_SIZE}px;

  ${props => props.flip && css`
    transform: scaleY(-1);
  `}

  ${props => props.mirror && css`
    transform: scaleX(-1);
  `}

  ${props => props.rotation && css`
    transform: rotate3d(0, 0, 1, ${props.rotation}deg);
  `}
`

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
