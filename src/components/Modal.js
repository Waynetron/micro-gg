import React from 'react'
import styled from 'styled-components'

const Blanket = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  background-color: ${props => props.colors.dark};
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Contents = styled.div`
  width: 80%;
  color: ${props => props.colors.dark};
  background-color: ${props => props.colors.primary};
  border-radius: 0.5rem;
  padding: 2rem;
  top: 10%;
  position: absolute;
  margin-bottom: 10%;

  h2 {
    margin-top: 1.5rem;
    line-height: 2rem;
  }
`

const Modal = ({colors, onClose, children})=> (
  <Blanket colors={colors} onClick={onClose}>
    <Contents colors={colors} onClick={(e)=> e.stopPropagation()}>
      {children}
    </Contents>
  </Blanket>
)

export default Modal
