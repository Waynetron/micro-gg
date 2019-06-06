import React from 'react';
import styled from 'styled-components'

const random = (seed)=> {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const randomColor = (letter)=> {
  const seed = letter.codePointAt(0)

  const [h, s, l] = [
    random(seed) * 255,           // 0 to 255
    random(seed + 1) * 35 + 65,   // 65% to 100%
    random(seed + 2) * 20 + 40    // 40% to 60%
  ]

  return `hsl(${h}, ${s}%, ${l}%)`
}

const LetterImageContainer = styled.div`
  display: inline-block;
  text-align: center;
  width: 32px;
  height: 32px;
  border-radius: 0.3rem;
  color: black;
  background-color: ${props => randomColor(props.letter)};
  
  p {
    display: inline;
    font-weight: 800;
    font-size: 1.6rem;
    user-select: none;
  }
`

const LetterImage = (props)=> {
  const {letter} = props

  return (
    <LetterImageContainer letter={letter} {...props}>
      <p>{letter}</p>
    </LetterImageContainer>
  );
}

export default LetterImage