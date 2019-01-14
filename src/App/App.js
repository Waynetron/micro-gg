import React, {Fragment} from 'react';
import {connect} from 'react-redux'
import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Code from '../Code/Code.js';
import {compile, setActive} from '../Code/actions';
import './App.css';

const App = ({code, compile, isGameActive, setGameActive})=> {
  return (
    <Fragment>
      <header>
        <button onClick={()=> compile(code)}>reload</button>
        {isGameActive
          ? <button onClick={()=> setGameActive(false)}>pause</button>
          : <button onClick={()=> setGameActive(true)}>run</button>
        }
        <Loop />
      </header>
      <main>
        <Code />
        <Game />
      </main>
    </Fragment>
  );
};

const mapStateToProps = ({code, game})=> ({
  code: code.code,
  isGameActive: game.active
})

const mapDispatchToProps = (dispatch)=> ({
  compile: (code)=> {
    dispatch(compile(code));
  },
  setGameActive: (active)=> {
    dispatch(setActive(active));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
