import React from 'react';
import {connect} from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';

const ImagePicker = ({variableName, imageMap, images, onSelect})=> {  
  // imageMap will be an empty object before <Code /> has been loaded
  // this protects against that case
  if (Object.keys(imageMap).length === 0) {
    return null;
  }

  const image = imageMap[variableName] ? imageMap[variableName] : 'player';

  return (
    <Tooltip
      interactive
      title={
        <div className='tooltip-content'>
          {images.map((name)=> (
            <img
              key={name}
              alt=''
              src={require(`../Game/images/${name}.png`)}
              onClick={()=> onSelect(variableName, name)}
            />
          ))}
        </div>
      }
    >
      <img className='code-sprite'
        alt=''
        src={require(`../Game/images/${image}.png`)}
      />
    </Tooltip>
  )
};

const mapStateToProps = ({game})=> ({
  imageMap: game.imageMap,
  images: game.images
})

const mapDispatchToProps = (dispatch)=> ({
  onSelect: (variableName, imageName)=> {
    dispatch({
      type: 'SELECT_IMAGE',
      variableName,
      imageName
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagePicker);
