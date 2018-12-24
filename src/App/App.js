import React, {Fragment} from 'react';
import Game from '../Game/Game.js';
import Loop from '../Game/Loop.js';
import Physics from '../Game/Physics.js';
import Code from '../Code/Code.js';
import './App.css';

const run = ()=> {
  console.log('this does nothing')
}

const App = ()=> {
  return (
    <Fragment>
      <header>
        <button onClick={run}>run</button>
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

export default App;
