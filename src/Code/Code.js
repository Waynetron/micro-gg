import React, {useEffect} from 'react';
import {updateCode, compile} from './actions.js';
import {connect} from 'react-redux'

const Code = ({code, onChange, onCompile})=> {
  // manually trigger code change on first load
  useEffect(() => {
    onChange(code);
    onCompile(code);
  }, []);

  return <div id="code">
    <textarea
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      value={code}
      onChange={({target})=> onChange(target.value)}
    />
  </div>
};

const mapStateToProps = ({code})=> {
  return code
}

const mapDispatchToProps = (dispatch)=> ({
  onChange: (code)=> {
    dispatch(updateCode(code));
  },
  onCompile: (code)=> {
    dispatch(compile(code));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);
