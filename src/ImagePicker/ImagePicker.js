import React, {useState} from 'react'
import {connect} from 'react-redux'
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'

import styled from 'styled-components'

const PickerContainer = styled.div`
  position: absolute;
  display: inline-flex;
  cursor: pointer;
  height: 0;
`

const PickerBox = styled.div`
  display: flex;
  background-color: black;
  border: solid 1px #555;
  border-radius: .5rem;
  padding: 0.5rem;
  margin-top: -1rem;
  z-index: 1;
  height: 32px;

  div, img {
    margin-right: 0.5rem;

    &:last-child {
      margin-right: 0
    }
  }
`

const ImagePicker = ({letter, variableName, imageMap, availableImages, onSetImage, onSetLetterImage})=> {
  const imageFilename = getImageFilename(variableName, imageMap, availableImages)
  
  const [open, setOpen] = useState(false)

  return (
    <PickerContainer
      onMouseOver={()=> setOpen(true)}
      onMouseLeave={()=> setOpen(false)}
    >
      {!open
        ?
          <div className='code-sprite'>
            {imageFilename
              ? <img alt='' src={require(`../Game/images/${imageFilename}.png`)} />
              : <LetterImage letter={letter} />
            }
          </div>
        : 
          <PickerBox>
            <LetterImage
              letter={letter}
              onClick={()=> onSetLetterImage(variableName, letter)}
            />
            {availableImages.map((imageName)=> (
              <img
                key={imageName}
                alt=''
                src={require(`../Game/images/${imageName}.png`)}
                onClick={()=> onSetImage(variableName, imageName)}
              />
            ))}
          </PickerBox>
      }
    </PickerContainer>
  )
};

const mapStateToProps = ({game})=> ({
  imageMap: game.imageMap,
  availableImages: game.availableImages
})

const mapDispatchToProps = (dispatch)=> ({
  onSetImage: (variableName, imageName)=> {
    dispatch({
      type: 'SET_IMAGE',
      variableName,
      imageName
    });
  },
  onSetLetterImage: (variableName, letter)=> {
    dispatch({
      type: 'SET_LETTER_IMAGE',
      variableName,
      letter
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagePicker);
