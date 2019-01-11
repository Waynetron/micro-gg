import React, {useEffect} from 'react';
import {updateElapsed} from './actions.js';
import {connect} from 'react-redux'

const Loop = ({onTimeChange, active})=> {
  // recursively calls itself once per frame
  const advanceFrame = ()=> {
    onTimeChange(Date.now());
    requestAnimationFrame(()=> advanceFrame());
  }

  useEffect(() => {
    if (active) {
      requestAnimationFrame(()=> advanceFrame());
    }
  });

  return <p></p>;
};

const mapStateToProps = ({game})=> ({
  active: game.active
});

const mapDispatchToProps = (dispatch)=> ({
  onTimeChange: (elapsed)=> {
    dispatch(updateElapsed(elapsed));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loop);
