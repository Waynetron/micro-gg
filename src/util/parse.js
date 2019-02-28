import {createNewSprite} from './state.js';
import {flatten} from 'lodash-es';
import {TILE_SIZE} from '../Game/constants.js';
import uniqid from 'uniqid';

const isCollisionRule = (line)=> line.includes('|');
const isRule = (line)=> line.includes('->') && !isCollisionRule(line);
const isLevel = (line)=> line.match(/#.+#/g)
export const isLegend = (line)=> line.includes('=');

export const parseLegend = (code)=> {
  let legend = {};

  code.split('\n')
    .filter(isLegend)
    .forEach((line)=> {
      const [symbol, right] = line.split('=').map((str)=> str.trim());
      const names = right.split(' or ');
      // this is a function to allow returning a random name in the case of:
      // G = Goomba or Tree or Brick
      legend[symbol] = ()=> {
        const randIndex = Math.floor(Math.random() * names.length);
        return names[randIndex];
      }
    });

  return legend
};

const removeEdges = (lines)=> (
  lines.slice(1, -1).map((line)=> line.slice(1, -1))
);

export const parseLevel = (code)=> (
  code.split('\n').filter(isLevel) |> removeEdges
);

export const parseNames = (code)=> {
  const lines = code.split('\n').filter(isLegend);
  const names = lines.map((line)=> {
    const [, right] = line.split(' = ');
    const words = right.split(' or ');
    
    return words;
  });

  return flatten(names);
};

export const getLevelDimensions = (level)=> {
  const width_in_tiles = level[0].length;
  const height_in_tiles = level.length;
  
  return [width_in_tiles, height_in_tiles];
}

export const parseSprites = (level, legend)=> {
  const sprites = [];
  level.map((line, row)=> line.split('').forEach((char, col)=> {
    const getName = legend[char];
    if (getName && getName() !== 'Empty') {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      sprites.push(
        {
          id: uniqid(),
          ...createNewSprite(getName(), x, y)
        }
      );
    }
  }));

  return sprites;
};

const collisionExpandMappings = {
  ALL: ['LEFT', 'RIGHT', 'UP', 'DOWN'],
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN']
}

const regularExpandMappings = {
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN']
}

// Takes a single rule and returns an array with (potentially) multiple rules
// Eg: Rules starting with HORIZONTAL become both LEFT and RIGHT rules
const expandRegularRule = (line)=> {
  let expandedLines = [];

  for (const [key, words] of Object.entries(regularExpandMappings)) {
    if (line.includes(`<${key}> `) || line.includes(`${key} `)) {
      for (const word of words) {
        const expanded = line
          // replaces either <LEFT> or LEFT
          // this would be better swapped for some equivalant that replaces
          // all occurances of a word
          .replace(`<${key}> `, `<${word}> `)
          .replace(`${key} `, `${word} `)
  
        expandedLines.push(expanded);
      }
    }
  }

  return expandedLines.length > 0 ? expandedLines : [line]
}

// Takes a single collision rule and returns an array with (potentially) multiple rules
// Eg: [ Player | Goomba ] -> [ DEAD Player | Goomba ]
// becomes
// UP [ Player | Goomba ] -> [ DEAD Player | Goomba ]
// DOWN [ Player | Goomba ] -> [ DEAD Player | Goomba ]
// Etc...
const expandCollisionRule = (line)=> {
  let expandedLines = [];

  // If no direction given, then use 'ALL'. Otherwise use the given direction ('UP', 'DOWN', etc)
  const [firstWord] = line.split('[');
  
  let appendedLine = line;
  if (firstWord === '') {
    appendedLine = line.replace('[', 'ALL [');
  }
  
  for (const [key, directions] of Object.entries(collisionExpandMappings)) {
    if (appendedLine.includes(`${key} `)) {
      for (const direction of directions) {
        const expanded = appendedLine
          .replace(`${key} `, `${direction} `)

        expandedLines.push(expanded);
      }
    }
  }

  return expandedLines.length > 0 ? expandedLines : [line]
}

export const parseRules = (code)=> {
  const regularRules = code.split('\n').filter(isRule);  
  const expandedRegularRules = flatten(
    regularRules.map((line)=> expandRegularRule(line))
  );
  
  const collisionRules = code.split('\n').filter(isCollisionRule);
  const expandedCollisionRules = flatten(
    collisionRules.map((line)=> expandCollisionRule(line))
  );
  // const uniqueCollisionRules = removeDuplicateRules(expandedCollisionRules);

  return [
    expandedRegularRules,
    expandedCollisionRules
  ]
};