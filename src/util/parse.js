import {createNewSprite, trimBrackets} from './state.js'
import {flatten} from 'lodash'
import {TILE_SIZE} from '../Game/constants.js'
import uniqid from 'uniqid'
import {ruleStringToState, collisionRuleStringToState, isCreateNewState} from '../util/state.js'

const isCollisionRule = (line)=>
  line.includes('|') || line.includes(' >') || line.includes(' <')
const isRule = (line)=> line.includes('->') && !isCollisionRule(line)
const isLevel = (line)=> line.match(/#.+#/g)
export const isLegend = (line)=> line.includes('=')
const isVariable = (line)=> line.match(/=[ ]{0,1}\{/g)

export const parseLegend = (code)=> {
  let legend = {}

  code.split('\n')
    .filter(isLegend)
    .forEach((line)=> {
      const [symbol, right] = line.split('=').map((str)=> str.trim());
      const names = right.split(' or ')
      // this is a function to allow returning a random name in the case of:
      // G = Goomba or Tree or Brick
      legend[symbol] = ()=> {
        const randIndex = Math.floor(Math.random() * names.length)
        return names[randIndex]
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

export const parseVariables = (code)=> {
  const lines = code.split('\n').filter(isVariable)

  let results = {}
  for (const line of lines) {
    const [name, expansion] = line.split(' = ')
    
    // {CUSTOM_TEST: ['velocity: { y: 6 }']}
    // expansion sits inside array because that is how it is done with the 
    // standardExpansions. Doesn't make a whole lot of sense here,
    // but with the standardExpansions (DOWN, UP etc) they can have multiple expansions
    // per name, so I just wanted to keep the implementation simple
    results[name] = [trimBrackets(expansion)]
  }

  return results
}

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
          ...createNewSprite(getName(), x, y, char)
        }
      );
    }
  }));

  return sprites;
};

export const standardExpansions = {
  ALL: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
  MOVE: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
  SLOW_MOVE: ['SLOW_UP', 'SLOW_DOWN', 'SLOW_LEFT', 'SLOW_RIGHT'],
  HORIZONTAL: ['LEFT', 'RIGHT'],
  VERTICAL: ['UP', 'DOWN']
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
const expandRule = (line, expansions)=> {
  const lines = []
  
  for (const [key, words] of Object.entries(expansions)) {
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

const isExpandable = (line, expansions)=> {
  for (const key of Object.keys(expansions)) {
    if (line.includes(key)) {
      return true
    }
  }

  return false
}

export const expandRules = (lines, expansions)=> {
  const notExpandable = lines.filter((line)=> !isExpandable(line, expansions))
  const expanded = flatten(
    lines.filter((line)=> isExpandable(line, expansions))
      .map((line)=> expandRule(line, expansions))
  )

  if (expanded.length === 0) {
    // fully expanded, stop recursing
    return lines
  }
  
  return [
    ...notExpandable,
    ...expandRules(expanded, expansions)
  ]
}

// If no direction given, then append 'ALL'. Otherwise use the given direction ('UP', 'DOWN', etc)
export const addImplicitKeywords = (line) => {
  const [firstWord] = line.split('{');
  
  let appendedLine = line;
  if (firstWord === '') {
    appendedLine = line.replace('{', 'ALL {');
  }

  return appendedLine;
}

export const parseRules = (code, names, variables)=> {
  const customExpansions = variables
  const expansions = {...customExpansions, ...standardExpansions}
  
  const regularRules = code
    .split('\n')
    .filter(isRule)
    |> ((ruleStrings)=> expandRules(ruleStrings, expansions))
    |> ((ruleStrings)=> ruleStrings.map((string)=> ruleStringToState(string, names)))

  const collisionRules = code
    .split('\n')
    .filter(isCollisionRule)
    .map(addImplicitKeywords)
    |> ((ruleStrings)=> expandRules(ruleStrings, expansions))
    |> ((ruleStrings)=> ruleStrings.map((string)=> collisionRuleStringToState(string, names)))
    |> flatten
  
  // separate the collisionRules into 2 groups: 
  // those that will spawn new state
  // and those that will modify existing state
  const collisionCreate = collisionRules.filter(isCreateNewState);
  const collisionModify = collisionRules.filter((rule)=> !isCreateNewState(rule));

  return {
    modify: [...regularRules, ...collisionModify],
    create: collisionCreate
  }
}