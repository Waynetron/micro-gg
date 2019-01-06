import React, {Fragment} from 'react';
import {connect} from 'react-redux'
import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Physics from '../Game/Physics.js';
import Code from '../Code/Code.js';
import {runCode} from '../Code/actions';
import './App.css';

const App = ({code, onRun})=> {
  return (
    <Fragment>
      <header>
        <button onClick={()=> onRun(code)}>run</button>
        <Loop />
        <Physics />
      </header>
      <main>
        <Code />
        <Game />
      </main>
    </Fragment>
  );
};

const mapStateToProps = ({code})=> ({
  code: code.code
})

const mapDispatchToProps = (dispatch)=> ({
  onRun: (code)=> {
    dispatch(runCode(code));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
