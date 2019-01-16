import uniqid from 'uniqid';
import {TILE_SIZE, MAX_VELOCITY} from '../Game/constants.js'

const isCollisionRule = (line)=> line.includes('|');
const isRule = (line)=> line.includes('->') && !isCollisionRule(line);
const isLevel = (line)=> line.match(/#.+#/g)
const isLegend = (line)=> line.includes('=');
const isSpriteImageMapping = (line)=>
  !isRule(line) && !isCollisionRule(line) && !isLevel(line) && !isLegend(line);

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

export const parseRules = (code)=> ([
  code.split('\n').filter(isRule),
  code.split('\n').filter(isCollisionRule)
]);