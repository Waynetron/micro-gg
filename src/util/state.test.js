import {applyStateTransitions} from './state'

describe('applying state transitions', ()=> {
  it('applies state transition', ()=> {
    const transitions = {spriteA: [{name: 'Woo'}]}
    const sprites = [{id: 'spriteA', name: 'Jeff'}]

    expect(applyStateTransitions(transitions, sprites)).toEqual(
      [{id: 'spriteA', name: 'Woo'}]
    );
  });
});
