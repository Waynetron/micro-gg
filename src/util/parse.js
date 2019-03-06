import {createNewSprite} from './state.js';
import {flatten} from 'lodash';
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

const expansionMappings = {
  ALL: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN']
}

const isExpandable = (line)=> {
  for (const key of Object.keys(expansionMappings)) {
    if (line.includes(key)) {
      return true
    }
  }

  return false
}

// replaces all occurrances of a word in a string with the given word
const replaceWord = (line, word, newWord)=> {
  const newLine = line.replace(word, newWord)

  // if more occurances of the word, then run replaceWord again
  if (newLine.includes(word)) {
    return replaceWord(newLine, word, newWord)
  }

  return newLine
}

/*
takes a single rule and expands it into several
Eg:
  ALL [Player] -> [Player]
Becomes:
  UP [Player] -> [Player]
  DOWN [Player] -> [Player]
  LEFT [Player] -> [Player]
  RIGHT [Player] -> [Player]
 */
const expandRule = (line)=> {
  const lines = []
  for (const [key, words] of Object.entries(expansionMappings)) {
    if (line.includes(key)) {
      for (const word of words) {
        lines.push(
          replaceWord(line, key, word)
        );
      }

      // Return early once one keyword is dealt with
      return lines;
      /*
      It's important to return early here once a keyword is found to prevent
      this function from dealing with more than one keyword per execution
      For example if a line contains both ALL and HORIZONTAL
      Only one keyword can be dealt with per pass, else we end up with an output like:
      UP [ _ ] -> [ HORIZONTAL ]
      DOWN [ _ ] -> [ HORIZONTAL ]
      LEFT [ _ ] -> [ HORIZONTAL ]
      RIGHT [ _ ] -> [ HORIZONTAL ]
      ALL [ _ ] -> [ LEFT ]
      ALL [ _ ] -> [ RIGHT ]
      Once the above expanded again, we would end up with a bunch of duplicate rules
      */
    }
  }

  return lines;
}

export const expandRules = (lines)=> {
  const alreadyExpanded = lines.filter((line)=> !isExpandable(line))
  const freshlyExpanded = flatten(
    lines.filter(isExpandable).map(expandRule)
  )

  if (freshlyExpanded.length === 0) {
    // fully expanded, stop recursing
    return lines
  }
  
  return [
    ...alreadyExpanded,
    ...expandRules(freshlyExpanded)
  ]
}

// If no direction given, then append 'ALL'. Otherwise use the given direction ('UP', 'DOWN', etc)
const addImplicitKeywords = (line) => {
  const [firstWord] = line.split('[');
  
  let appendedLine = line;
  if (firstWord === '') {
    appendedLine = line.replace('[', 'ALL [');
  }

  return appendedLine;
}

export const parseRules = (code)=> {
  const regularRules = code
    .split('\n')
    .filter(isRule)
  
  const collisionRules = code
    .split('\n')
    .filter(isCollisionRule)
    .map(addImplicitKeywords)

  return [
    expandRules(regularRules),
    expandRules(collisionRules)
  ]
}