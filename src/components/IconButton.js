import styled, {css} from 'styled-components'
import Button from './Button'


const alpha = '22' // hex

const IconButton = styled(Button)`
  @keyframes grow {
    0% {
      transform: scale(1.0);
      easing: 'ease-out'
    }
    30% {
      transform: scale(1.3);
      easing: 'ease-in-out'
    }
    100% {
      transform: scale(1.2);
    }
  }

  @keyframes shrink {
    0% {
      transform: scale(1.2);
      easing: 'ease-out'
    }
    30% {
      transform: scale(0.9);
      easing: 'ease-in-out'
    }
    100% {
      transform: scale(1.0);
    }
  }

  min-width: auto;
  padding: 0;
  background-color: transparent;

  animation-name: shrink;
  animation-duration: 0.2s;
  animation-fill-mode: forwards;

  &:hover {
    animation-name: grow;
    animation-duration: 0.2s;
    animation-fill-mode: forwards;
  }
`

export default IconButton
