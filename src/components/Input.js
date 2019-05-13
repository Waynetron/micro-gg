import styled from 'styled-components'


const alpha = 30 // this is a number, but will end up a hex string

const Input = styled.input`
  background-color: ${props => props.colors.primary}${alpha};
  &:hover, &:focus{
    background-color: ${props => props.colors.primary}${alpha * 1.5};
  }
  &:focus{
    outline: none;
  }
  color: ${props => props.colors.primary};
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.5rem;
  border: none;
  border-radius: 0.3rem;
`

export default Input