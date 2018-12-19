
const tokenise = (line)=> line.match(/\[.*?\]/g);
const isRule = (line)=> line.includes('->');
const isLevel = (line)=> line.match(/#.+#/g)
const isLegend = (line)=> line.includes('=');
const isSpriteImageMapping = (line)=> !line.includes('->');

const parseRule = (line)=> {
  const [left, right] = line.split('->');
  return [tokenise(left), tokenise(right)];
}

const parseSpriteImageMappings = (code)=> {
  const spriteImageMappings = {};
  code.split('\n')
    .filter(isSpriteImageMapping)
    .map((line)=> {
      const [name, src] = line.split(' ');
      spriteImageMappings[name] = src;
    });

    return spriteImageMappings;
}

const parseLegend = (code)=> {
  let legend = {};

  code.split('\n')
    .filter(isLegend)
    .map((line)=> {
      const [symbol, name] = line.split('=').map((str)=> str.trim());
      legend[symbol] = name;
    });

  return legend
};

const removeEdges = (lines)=> (
  lines.slice(1, -1).map((line)=> line.slice(1, -1))
);

const parseLevel = (code)=> {
  const withEdges = code.split('\n')
    .filter(isLevel)

  return removeEdges(withEdges);
};

export const parseSprites = (code)=> {
  const legend = parseLegend(code);
  const spriteImageMappings = parseSpriteImageMappings(code);
  const level = parseLevel(code);
  
  const sprites = [];
  level.map((line, row)=> line.split('').map((char, col)=> {
    const name = legend[char];
    if (name) {
      sprites.push({
        name: name,
        tilePosition: {row, col},
        src: spriteImageMappings[name]
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