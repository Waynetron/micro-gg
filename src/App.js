import React, { useState } from 'react';
import './Game.js';
import './App.css';

const initialCode = `[ > Player ] [ Spike ] -> [ _ ] [ Spike ]
[ > Player ] [ Brick ] -> [ Player ] [ Brick ]`
const tokenise = (line)=> line.match(/\[.*?\]/g);
const ruleFromTokens = (tokens)=> {
  return tokens;
}
const ruleFromLine = (line)=> {
  const [left, right] = line.split('->');
  const leftTokens = tokenise(left);
  const rightTokens = tokenise(right);
  const rule = [leftTokens, rightTokens];
  return rule;
}
const parse = (code)=> {
  const rules = [];
  const lines = code.split('\n');
  for (const line of lines) {
    const rule = ruleFromLine(line);
    rules.push(rule);
  }
  return rules;
};

const App = ()=> {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = ({target})=> {
    setCode(target.value);
  };

  return (
    <div>
      <header>
        <button>run</button>
      </header>
      <main>
        <div className="code">
          <textarea
            value={code}
            onChange={handleCodeChange}
          />
        </div>
        <div id="game">
          {parse(code).map((rule)=> <p>{rule}</p>)}
        </div>
      </main>
    </div>
  );
};

export default App;
