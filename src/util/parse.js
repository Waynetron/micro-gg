import uniqid from 'uniqid';
import {flatten} from 'lodash-es';
import {TILE_SIZE, MAX_VELOCITY} from '../Game/constants.js'

const isCollisionRule = (line)=> line.includes('|');
const isRule = (line)=> line.includes('->') && !isCollisionRule(line);
const isLevel = (line)=> line.match(/#.+#/g)
const isLegend = (line)=> line.includes('=');

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
      sprites.push({
        name: getName(),
        id: uniqid(),
        position: {
          x: col * TILE_SIZE,
          y: row * TILE_SIZE
        },
        velocity: {x: 0, y: 0},
        maxVelocity: {x: MAX_VELOCITY, y: MAX_VELOCITY},
        acceleration: {x: 0, y: 0},
        colliding: {
          top: [],
          bottom: [],
          left: [],
          right: []
        },
        static: false,
        inputs: {}
      });
    }
  }));

  return sprites;
};

const getOpposite = (direction)=> {
  const oppositeMappings = {
    'COLLIDE_LEFT': 'COLLIDE_RIGHT',
    'COLLIDE_RIGHT': 'COLLIDE_LEFT',
    'COLLIDE_TOP': 'COLLIDE_BOTTOM',
    'COLLIDE_BOTTOM': 'COLLIDE_TOP'
  }

  return oppositeMappings[direction];
}

const expand = (line)=> {
  if (line.includes('COLLIDE ')) {
    const specificDirections = ['COLLIDE_LEFT', 'COLLIDE_RIGHT', 'COLLIDE_TOP', 'COLLIDE_BOTTOM'];

    let expandedLines = [];
    for (const direction of specificDirections) {
      const expanded = line
        .replace('COLLIDE ', `${direction} `)
        .replace('COLLIDE ', `${getOpposite(direction)} `);

      expandedLines.push(expanded);
    }

    return expandedLines;
  }
  
  return [line]
}

// When rules having a matching left state, then keep only the last rule
const removeDuplicateRules = (lines)=> {
  const unique = {};
  for (const line of lines) {
    const [left, right] = line.split('->');
    unique[left] = line;
  }

  return Object.values(unique);
}

export const parseRules = (code)=> {
  const regularRules = code.split('\n').filter(isRule);  
  
  const collisionRules = code.split('\n').filter(isCollisionRule);
  const expandedCollisionRules = flatten(collisionRules.map((line)=> expand(line)));
  // const uniqueCollisionRules = removeDuplicateRules(expandedCollisionRules);

  return [
    regularRules,
    expandedCollisionRules
  ]
};