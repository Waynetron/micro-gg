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

export const parseSprites = (level, legend)=> {
  const sprites = [];
  level.map((line, row)=> line.split('').forEach((char, col)=> {
    const name = legend[char];
    if (name) {
      sprites.push({
        name: name,
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
    const [left, right] = line.split('->');
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

export const parseRules = (code)=> {
  const regularRules = code.split('\n').filter(isRule);  
  const collisionRules = code.split('\n').filter(isCollisionRule);

  return [
    regularRules,
    flatten(collisionRules.map((line)=> expand(line)))
  ]
};