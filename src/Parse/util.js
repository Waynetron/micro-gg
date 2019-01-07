import uniqid from 'uniqid';
import {TILE_SIZE} from '../Game/constants.js'

const isRule = (line)=> line.includes('->');
const isLevel = (line)=> line.match(/#.+#/g)
const isLegend = (line)=> line.includes('=');
const isSpriteImageMapping = (line)=> !line.includes('->');

const trimBrackets = (string)=> string.replace('[', '').replace(']', '')
const separateWords = (leftAndRightString)=> (
  leftAndRightString.map((string)=>
    trimBrackets(string).trim().split(' ')
  )
);
const states = {
  UP: {acceleration: {x: 0, y: -1}},
  DOWN: {acceleration: {x: 0, y: 1}},
  LEFT: {acceleration: {x: -1, y: 0}},
  RIGHT: {acceleration: {x: 1, y: 0}},
  STATIC: {static: true}
};
export const ruleToStateTransition = (ruleString, names)=> {
  // First, turn the rule string into an array of words
  // eg: the ruleString "[ Goomba ] -> [ RIGHT Goomba ]"
  // becomes: [["Goomba"], ["RIGHT", "Goomba"]]
  const [leftWords, rightWords] = ruleString.split('->')
    |> separateWords;
    
  /* Turn those words into arrays of key value objects
    [
      [{name: "Goomba"}],
      [{name: "Goomba"}, {acceleration: {x: 1, y: 0}}]}
    ]
  */
  const [leftState, rightState] = [leftWords, rightWords].map(
    (words)=> words.map((word)=> {
      if (names[word]) {
        return ({
          name: word
        });
      }
      if (states[word]) {
        return ({
          ...states[word]
        })
      }

      return {};
   })
  );

  /* Flatten it to a single array of objects
    [
      {name: "Goomba"},
      {name: "Goomba", acceleration: {x: 1, y: 0}}
    ]
  */
  return [
    Object.assign({}, {}, ...leftState),
    Object.assign({}, {}, ...rightState)
  ];
}

export const parseAssets = (code)=> {
  const assets = {};
  code.split('\n')
    .filter(isSpriteImageMapping)
    .forEach((line)=> {
      const [name, src] = line.split(' ');
      assets[name] = src;
    });

    return assets;
}

export const parseLegend = (code)=> {
  let legend = {};

  code.split('\n')
    .filter(isLegend)
    .forEach((line)=> {
      const [symbol, name] = line.split('=').map((str)=> str.trim());
      legend[symbol] = name;
    });

  return legend
};

const removeEdges = (lines)=> (
  lines.slice(1, -1).map((line)=> line.slice(1, -1))
);

export const parseLevel = (code)=> (
  code.split('\n').filter(isLevel) |> removeEdges
);

export const getLevelDimensions = (level)=> {
  const width_in_tiles = level[0].length;
  const height_in_tiles = level.length;
  
  return [width_in_tiles, height_in_tiles];
}

export const parseSprites = (level, legend, assets)=> {
  const sprites = [];
  level.map((line, row)=> line.split('').forEach((char, col)=> {
    const name = legend[char];
    if (name) {
      sprites.push({
        name: name,
        id: uniqid(),
        src: assets[name],
        position: {
          x: col * TILE_SIZE,
          y: row * TILE_SIZE
        },
        velocity: {x: 0, y: 0},
        acceleration: {x: 0, y: 0},
        touching: {
          top: false,
          bottom: false,
          left: false,
          right: false
        },
        static: false
      });
    }
  }));

  return sprites;
};

export const parseRules = (code)=> (
  code.split('\n')
    .filter(isRule)
);