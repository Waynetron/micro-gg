
const tokenise = (line)=> line.match(/\[.*?\]/g);

const isRule = (line)=> line.includes('->');

const isSprite = (line)=> !line.includes('->');

const parseRule = (line)=> {
  const [left, right] = line.split('->');
  return [tokenise(left), tokenise(right)];
}
const parseSprite = (line)=> {
  const [name, src] = line.split(' ');
  return {name, src};
};

export const parseSprites = (code)=> (
  code.split('\n')
    .filter(isSprite)
    .map(parseSprite)
);

export const parseRules = (code)=> (
  code.split('\n')
    .filter(isRule)
    .map(parseRule)
);