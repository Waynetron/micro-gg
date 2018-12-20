import React, {useState, Fragment} from 'react';
import Game from '../Game/Game.js';
import Code from '../Code/Code.js';
import {parseRules, parseSprites, parseLegend,
  parseLevel, parseAssets, getLevelDimensions} from '../Parse/util.js';
import './App.css';

const initialCode = `
Player player
QuestionBrick question-brick
Brick brick
Spike spike
Goomba goomba

##################
#B              B#
#         P      #
#                #
#               #
#          G     #
#    BBBB?BBB    #
#                #
#B  P         ^^ #
##################

P = Player
? = QuestionBrick
B = Brick
G = Goomba
^ = Spike

[ > Player ] [ Spike ] -> [ _ ] [ Spike ]
[ > Player ] [ Brick ] -> [ Player ] [ Brick ]
`

const run = ()=> {
  console.log('this does nothing')
}

const App = ()=> {
  const [code, setCode] = useState(initialCode);
  const level = parseLevel(code);
  const sprites = parseSprites(
    level,
    parseLegend(code),
    parseAssets(code));
  const rules = parseRules(code);
  
  const [width_in_tiles, height_in_tiles] = getLevelDimensions(level);

  const updateCode = ({target})=> {
    setCode(target.value);
  };

  return (
    <Fragment>
      <header>
        <button onClick={run}>run</button>
      </header>
      <main>
        <Code code={code} onChange={updateCode} />
        <Game
          sprites={sprites} rules={rules}
          width_in_tiles={width_in_tiles} height_in_tiles={height_in_tiles} />
      </main>
    </Fragment>
  );
};

export default App;
