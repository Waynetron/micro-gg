import React, {useEffect} from 'react';
import {updateElapsed} from './actions.js';
import {connect} from 'react-redux'

const Loop = ({elapsed, frame, onTimeChange})=> {
  useEffect(() => {
    const newTime = Date.now()
    requestAnimationFrame(()=> onTimeChange(newTime))
  });

  return <p>
    frame:<strong>{frame} </strong> 
     —
    elapsed:<strong>{elapsed}</strong></p>;
};

const mapStateToProps = ({game})=> ({
  elapsed: game.elapsed,
  frame: game.frame
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
