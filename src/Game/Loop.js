import React, {useEffect} from 'react';
import {update} from './actions.js';
import {connect} from 'react-redux'

const Loop = ({onTimeChange})=> {
  // recursively calls itself once per frame
  let request;
  const advanceFrame = ()=> {
    onTimeChange();
    request = requestAnimationFrame(()=> advanceFrame());
  }

  useEffect(() => {
    request = requestAnimationFrame(()=> advanceFrame());
    return function cleanup() {
      cancelAnimationFrame(request);
    }
  }, []);

  return <p></p>;
};

const mapDispatchToProps = (dispatch)=> ({
  onTimeChange: ()=> {
    dispatch({
      type: 'UPDATE'
    });
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Loop);
