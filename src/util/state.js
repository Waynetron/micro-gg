import {matches, mergeWith, merge, isNumber} from 'lodash-es';

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
  SLOW_UP: {acceleration: {y: -0.5}},
  SLOW_DOWN: {acceleration: {y: 0.5}},
  SLOW_LEFT: {acceleration: {x: -0.5}},
  SLOW_RIGHT: {acceleration: {x: 0.5}},
  JUMP: {velocity: {y: -250}},
  DEAD: {dead: true},
  STATIC: {static: true}
};

const inputs = {
  '<UP>': 'up',
  '<DOWN>': 'down',
  '<LEFT>': 'left',
  '<RIGHT>': 'right',
  '<ACTION>': 'action1',
  '<ACTION1>': 'action1',
  '<ACTION2>': 'action2'
};

const getOpposite = (direction)=> {
  const oppositeMappings = {
    'left': 'right',
    'right': 'left',
    'top': 'bottom',
    'bottom': 'top'
  }

  return oppositeMappings[direction];
}

const directionToSide = (direction)=> {
  const oppositeMappings = {
    'left': 'left',
    'right': 'right',
    'down': 'bottom',
    'up': 'top'
  }

  return oppositeMappings[direction];
}

/*
Starts with 
  [ UP Player | Spike ] -> [ DEAD Player | Spike ]
Breaks up into 2 rules
  [ UP Player] -> [ DEAD Player]
  [ Spike ] -> [ Spike ]
Evaluate both rules into a pair of state transitions
[
  {name: "Player", acceleration: {x: 1, y: 0}},
  {name: "Player", dead: true}
]
[
  {name: "Spike"},
  {name: "Spike"}
]
// Finally adds a colliding property to the left side each state transition
[
  {
    name: "Player", acceleration: {x: 1, y: 0},
    colliding: {
      top: {name:'Spike'}, bottom: {name:'Spike'},
      left: {name:'Spike'}, right: {name:'Spike'}
    }
  },
  {name: "Player", dead: true}
]
[
  {
    name: "Spike",
    colliding: {
      top: {name:'Player'}, bottom: {name:'Player'},
      left: {name:'Player'}, right: {name:'Player'}
    }
  }
  {name: "Spike"}
]
*/
export const collisionRuleToStateTransitions = (ruleString, names)=> {
  // const [firstWord, ...rest] = ruleString.split('[');

  // Get collision direction (first word at the start of the line)
  const [firstWord] = ruleString.match(/^([A-Z]+)\b/);
  const direction = firstWord.toLowerCase();

  // Get the left and right matches
  const [left, right] = ruleString.split('->');
  const [leftGroup] = left.match(/\[.+?\]/);
  const [rightGroup] = right.match(/\[.+?\]/);
  
  const [leftWordsA, leftWordsB] = leftGroup.split('|') |> separateWords;
  const [rightWordsA, rightWordsB] = rightGroup.split('|') |> separateWords;

  const leftStateA = wordsToState(leftWordsA, names);
  const leftStateB = wordsToState(leftWordsB, names);
  const rightStateA = wordsToState(rightWordsA, names);

  // User may omit the r  ightWordsB. In which case populate it with leftWords B
  // Eg: [ <ACTION> Player | Ground ] -> [ JUMP Player ]
  // Becomes: [ <ACTION> Player | Ground ] -> [ JUMP Player ]
  const rightStateB = wordsToState(rightWordsB ? rightWordsB : leftWordsB, names);

  // Pay close attention to the flipping of A and B for certain variables.
  // collidingA is used as the colliding state for spriteB and vice-a-versa
  let collidingA = {};
  collidingA[getOpposite(directionToSide(direction))] = [{...leftStateA}]

  let collidingB = {};
  collidingB[directionToSide(direction)] = [{...leftStateB}]

  const pairA = [
    {...leftStateA, colliding: collidingB},
    rightStateA
  ];
  const pairB = [
    {...leftStateB, colliding: {...collidingA}},
    rightStateB
  ];

  return [pairA, pairB];
}

const wordsToState = (words, names)=> {
  /* Turn those words into arrays of key value objects
    [
      [{name: "Goomba"}],
      [{name: "Goomba"}, {acceleration: {x: 1}}]},
      [{name: "Goomba"}, {acceleration: {y: 1}}]}
    ]
  */
  const statesArr = words.map((word)=> {
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
  });

  /* Flatten and merge all the states together into a single state object:
    {name: "Goomba", acceleration: {x: 1, y: 1}}
  */
  let resultState = {};
  for (const stateObj of statesArr) {
    merge(resultState, stateObj);
  }

  return resultState;
};

export const ruleToStateTransition = (ruleString, names)=> {
  // First, turn the rule string into an array of words
  // eg: the ruleString "[ Goomba ] -> [ RIGHT Goomba ]"
  // becomes: [["Goomba"], ["RIGHT", "Goomba"]]
  const [leftWords, rightWords] = ruleString.split('->')
    |> separateWords;
    
  const leftState = wordsToState(leftWords, names);
  const rightState = wordsToState(rightWords, names);

  return [leftState, rightState];
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