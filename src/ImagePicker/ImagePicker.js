import React from 'react'
import {connect} from 'react-redux'
import Tooltip from '@material-ui/core/Tooltip'
import LetterImage from '../Image/LetterImage'
import {getImageFilename} from '../Image/helper'


const ImagePicker = ({letter, variableName, imageMap, availableImages, onSetImage, onSetNoImage})=> {
  const imageFilename = getImageFilename(variableName, imageMap, availableImages)

  return (
    <Tooltip
      interactive
      className='tooltip'
      title={
        <div className='tooltip-content'>
          <LetterImage
            letter={letter}
            onClick={()=> onSetNoImage(variableName)}
          />
          {availableImages.map((imageName)=> (
            <img
              key={imageName}
              alt=''
              src={require(`../Game/images/${imageName}.png`)}
              onClick={()=> onSetImage(variableName, imageName)}
            />
          ))}
        </div>
      }
    >
      {imageFilename
        ? 
          <img
            className='code-sprite'
            alt=''
            src={require(`../Game/images/${imageFilename}.png`)}
          />
        : <LetterImage
            className='code-sprite'
            letter={letter}
          />
      }
    </Tooltip>
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
  onSetNoImage: (variableName)=> {
    dispatch({
      type: 'SET_NO_IMAGE',
      variableName,
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagePicker);
