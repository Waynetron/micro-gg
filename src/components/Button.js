import styled, {css} from 'styled-components'

const alpha = '22' // hex

const Button = styled.button`
  border: none;
  border-radius: 0.4rem;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 0.8rem;
  min-width: 6rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: ${props => props.colors.dark};
  color: ${props => props.colors.primary};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    opacity: 1.0;
    background-color: ${props => props.colors.primary}${alpha};
  }

  &:focus {
    outline: 0;
  }

  ${props => props.secondary && css`
    color: ${props.colors.dark};
    background-color: transparent;
    border: solid 2px ${props.colors.dark};

    &:hover {
      color: ${props => props.colors.primary};
      background-color: ${props => props.colors.dark};
    }
  `}
  
  ${props => props.inverted && css`
    color: ${props.colors.dark};
    background-color: ${props => props.colors.primary};
  `}
`

export default Button
