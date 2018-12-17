import React, { useState } from 'react';
import './App.css';

const initialCode = `Player player.png
[ > Player ] [ Spike ] -> [ _ ] [ Spike ]
[ > Player ] [ Brick ] -> [ Player ] [ Brick ]`

const tokenise = (line)=> line.match(/\[.*?\]/g);

const isRule = (line)=> line.includes('->');

const isSprite = (line)=> !line.includes('->');

const parseRule = (line)=> {
  const [left, right] = line.split('->');
  return [tokenise(left), tokenise(right)];
}
const parseSprite = (line)=> {
  const [name, src] = line.split(' ');
  return {name, src};
};

const parseSprites = (code)=> (
  code.split('\n')
    .filter(isSprite)
    .map(parseSprite)
);

const parseRules = (code)=> (
  code.split('\n')
    .filter(isRule)
    .map(parseRule)
);

const run = ()=> {
  console.log('this does nothing')
}

const App = ()=> {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = ({target})=> {
    setCode(target.value);
  };

  return (
    <div>
      <header>
        <button onClick={run}>run</button>
      </header>
      <main>
        <div className="code">
          <textarea
            value={code}
            onChange={handleCodeChange}
          />
        </div>
        <div id="game">
          <h3>Sprites</h3>
          {parseSprites(code).map((sprite)=> <p>{sprite.name}, {sprite.src}</p>)}
          <h3>Rules</h3>
          {parseRules(code).map((rule)=> <p>{rule}</p>)}
        </div>
      </main>
    </div>
  );
};

export default App;
