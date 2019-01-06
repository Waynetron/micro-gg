import React, {useEffect} from 'react';
import {updateElapsed} from './actions.js';
import {connect} from 'react-redux'

const Loop = ({elapsed, onTimeChange, active})=> {
  useEffect(() => {
    if (active) {
      const newTime = Date.now()
      requestAnimationFrame(()=> onTimeChange(newTime))
    }
  });

  return <p>
    frame:<strong>{elapsed.totalFrames} </strong> 
     —
    elapsed:<strong>{elapsed.sinceLastFrame}</strong></p>;
};

const mapStateToProps = ({game})=> ({
  elapsed: game.elapsed,
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
