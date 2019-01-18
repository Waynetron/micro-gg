import React, {useEffect} from 'react';
import {updateElapsed} from './actions.js';
import {connect} from 'react-redux'

const Loop = ({onTimeChange})=> {
  // recursively calls itself once per frame
  let request;
  const advanceFrame = ()=> {
    onTimeChange(Date.now());
    request = requestAnimationFrame(()=> advanceFrame());
  }

  useEffect(() => {
    request = requestAnimationFrame(()=> advanceFrame());
    return function cleanup() {
      cancelAnimationFrame(request);
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
