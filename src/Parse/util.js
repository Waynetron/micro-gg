import {TILE_SIZE, GRAVITY} from '../Game/constants.js'

const tokenise = (line)=> line.match(/\[.*?\]/g);
const isRule = (line)=> line.includes('->');
const isLevel = (line)=> line.match(/#.+#/g)
const isLegend = (line)=> line.includes('=');
const isSpriteImageMapping = (line)=> !line.includes('->');

const parseRule = (line)=> {
  const [left, right] = line.split('->');
  return [tokenise(left), tokenise(right)];
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

export const parseLevel = (code)=> {
  const withEdges = code.split('\n')
    .filter(isLevel)

  return removeEdges(withEdges);
};

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
        src: assets[name],
        position: {
          x: col * TILE_SIZE,
          y: row * TILE_SIZE
        },
        velocity: {x: 0, y: 0},
        acceleration: {
          x: 0,
          y: name === 'Player' ? GRAVITY : 0
        },
        static: name === 'Player' ? false : true
      });
    }
  }));

  return sprites;
};

export const parseRules = (code)=> (
  code.split('\n')
    .filter(isRule)
    .map(parseRule)
);