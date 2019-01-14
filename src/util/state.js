import {matches, mergeWith, isNumber} from 'lodash-es';

const trimBrackets = (string)=> string.replace('[', '').replace(']', '')
const separateWords = (leftAndRightString)=> (
  leftAndRightString.map((string)=>
    trimBrackets(string).trim().split(' ')
  )
);
const states = {
  UP: {acceleration: {y: -1}},
  DOWN: {acceleration: {y: 1}},
  LEFT: {acceleration: {x: -1}},
  RIGHT: {acceleration: {x: 1}},
  FAST_UP: {acceleration: {y: -6}},
  FAST_DOWN: {acceleration: {y: 6}},
  FAST_LEFT: {acceleration: {x: -6}},
  FAST_RIGHT: {acceleration: {x: 6}},
  JUMP: {
    velocity: {y: -250},
    inputs: {up: false}
  },
  DEAD: {dead: true},
  STATIC: {static: true}
};

const inputs = {
  '<UP>': 'up',
  '<DOWN>': 'down',
  '<LEFT>': 'left',
  '<RIGHT>': 'right',
  '<ACTION1>': 'action1',
  '<ACTION2>': 'action2'
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
      if (inputs[word]) {
        return ({
          inputs: {[inputs[word]]: true}
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

// custom merge rules
const mergeCustomizer = (objValue, srcValue)=> {
  if (isNumber(objValue)) {
    return objValue + srcValue;
  }
}

export const applyStateTransition = (sprite, transitions)=> {
  let resultState = {...sprite};

  for (const transition of transitions) {
    const [left, right] = transition;

    if (matches(left)(sprite)) {
      resultState = mergeWith(resultState, right, mergeCustomizer)
    }
  }

  return resultState;
};

export const isAlive = (sprite)=> !sprite.dead;