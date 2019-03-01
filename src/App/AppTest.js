import React from 'react';
import {connect} from 'react-redux'

const App = ()=> {
  return (
    <p>Test</p>
  );
};

const mapStateToProps = ({game})=> ({
  sprites: game.sprites
})

const mapDispatchToProps = (dispatch)=> ({
  compile: (code)=> {
    dispatch({
      type: 'COMPILE',
      code
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
