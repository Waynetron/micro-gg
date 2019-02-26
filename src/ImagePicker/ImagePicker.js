import React from 'react';
import {connect} from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';

const ImagePicker = ({imageMap, onSelect})=> {
  const imageNames = Object.values(imageMap);

  return (
    <Tooltip
      interactive
      title={
        <div className='tooltip-content'>
          {imageNames.map((name)=> (
            <img
              key={name}
              alt=''
              src={require(`../Game/images/${name}.png`)}
              onClick={()=> onSelect(name)}
            />
          ))}
        </div>
      }
    >
      <img className='code-sprite'
        alt=''
        src={require(`../Game/images/${'player'}.png`)}
      />
    </Tooltip>
  )
};

const mapStateToProps = ({game})=> ({
  imageMap: game.imageMap
})

const mapDispatchToProps = (dispatch)=> ({
  onSelect: ({value})=> {
    // dispatch(updateSlateValue(value));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagePicker);
