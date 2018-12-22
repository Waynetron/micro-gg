import React, {Fragment} from 'react';
import Game from '../Game/Game.js';
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
      </header>
      <main>
        <Code />
        <Game />
      </main>
    </Fragment>
  );
};

export default App;
