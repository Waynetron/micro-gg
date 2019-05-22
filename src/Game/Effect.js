import React from 'react';
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  width: 0;
  height: 0;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
`

const Explosion = styled.div`
  width: 32px;
  height: 32px;
  outline: var(--light-color);
  outline-width: 20px;
  outline-style: solid;

  @keyframes expand {
    0% {
      transform: scale(0.8);
    }
    100% {
      transform: scale(2);
      outline-width: 0px;
    }
  }

  animation-name: expand;
  animation-duration: ${props => props.duration}s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-out;
`

const Effect = ({effect})=>
  <Container
    x={effect.position.x}
    y={effect.position.y}
  >
    <Explosion duration={effect.duration / 60} />
  </Container>

export default Effect;
