import React, {useState} from 'react';
import Game from '../Game';
import Code from '../Code';
import {parseRules, parseSprites} from '../Parse/util.js';
import './index.css';

const initialCode = `Player player
[ > Player ] [ Spike ] -> [ _ ] [ Spike ]
[ > Player ] [ Brick ] -> [ Player ] [ Brick ]`

const run = ()=> {
  console.log('this does nothing')
}

const App = ()=> {
  const [code, setCode] = useState(initialCode);
  const sprites = parseSprites(code);
  const rules = parseRules(code);

  const handleCodeChange = ({target})=> {
    setCode(target.value);
  };

  return (
    <div>
      <header>
        <button onClick={run}>run</button>
      </header>
      <main>
        <Code code={code} handleCodeChange={handleCodeChange} />
        <Game sprites={sprites} rules={rules} />
      </main>
    </div>
  );
};

export default App;
