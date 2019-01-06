import React, {useEffect} from 'react';
import {updateCode, compile} from './actions.js';
import {connect} from 'react-redux'

const Code = ({code, onChange})=> {
  // manually trigger code change on first load
  useEffect(() => {
    onChange(code);
  }, []);

  return <div id="code">
    <textarea
      value={code}
      onChange={({target})=> onChange(target.value)}
      onLoad={()=> console.log('i loaded')}
    />
  </div>
};

const mapStateToProps = ({code})=> {
  return code
}

const mapDispatchToProps = (dispatch)=> ({
  onChange: (code)=> {
    dispatch(updateCode(code));
    dispatch(compile(code));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);
