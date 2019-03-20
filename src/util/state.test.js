import {applyStateTransitions, ruleStringToState} from './state'

const names = {
  Player: true,
  Brick: true
}

// describe('trim preceeding keywords', ()=> {
//   it('trims preceeding direction (& ignores others)', ()=> {
//     const rule = 'RIGHT [ Player ] -> [ Player RIGHT ]'

//     expect(trimPreceedingKeyword(rule)).toEqual(
//       '[ Player ] -> [ Player RIGHT ]'
//     );
//   });

//   it('doesnt trim if no keyword', ()=> {
//     const rule = '[ Player ] -> [ Player DOWN ]'

//     expect(trimPreceedingKeyword(rule)).toEqual(
//       '[ Player ] -> [ Player DOWN ]'
//     );
//   });
// });

describe('converts rule string to state', ()=> {
  it('simple rule', ()=> {
    const rule = '[ Player ] -> [ Player DOWN ]'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { name: 'Player' },
        { name: 'Player', acceleration: { y: 1 } }
      ]
    );
  });

  it('keyboard input and movement rule', ()=> {
    const rule = '[ <RIGHT> Player ] -> [ RIGHT Player ]'

    expect(ruleStringToState(rule, names)).toEqual(
      [
        { inputs: { right: true }, name: 'Player' },
        { acceleration: { x: 1 }, name: 'Player' }
      ]
    );
  });
});

describe('applying state transitions', ()=> {
  it('applies state transition', ()=> {
    const transitions = {spriteA: [{name: 'Woo'}]}
    const sprites = [{id: 'spriteA', name: 'Jeff'}]

    expect(applyStateTransitions(transitions, sprites)).toEqual(
      [{id: 'spriteA', name: 'Woo'}]
    );
  });
});
