import {expandRegularRule, expandCollisionRule} from './parse'

describe('expanding regular rules', ()=> {
  it('expands rule with no implicit direction', ()=> {
    const rule = '[ Player ] -> [ DOWN Player ]'

    expect(expandRegularRule(rule)).toEqual([
      'UP [ Player ] -> [ DOWN Player ]',
      'DOWN [ Player ] -> [ DOWN Player ]',
      'LEFT [ Player ] -> [ DOWN Player ]',
      'RIGHT [ Player ] -> [ DOWN Player ]'
    ]);
  });

  it('expands HORIZONTAL in any placement', ()=> {
    const horizontalA = 'DOWN [ HORIZONTAL Player ] -> [ Player ]'
    const horizontalB = 'DOWN [ Player ] -> [ HORIZONTAL Player ]'

    const horizontalCombo = 'DOWN [ HORIZONTAL Player ] -> [ HORIZONTAL Player ]'

    expect(expandRegularRule(horizontalA)).toEqual([
      'DOWN [ LEFT Player ] -> [ Player ]',
      'DOWN [ RIGHT Player ] -> [ Player ]'
    ]);

    expect(expandCollisionRule(horizontalB)).toEqual([
      'DOWN [ Player ] -> [ LEFT Player ]',
      'DOWN [ Player ] -> [ RIGHT Player ]'
    ]);

    expect(expandCollisionRule(horizontalCombo)).toEqual([
      'DOWN [ LEFT Player ] -> [ LEFT Player ]',
      'DOWN [ LEFT Player ] -> [ RIGHT Player ]',
      'DOWN [ RIGHT Player ] -> [ LEFT Player ]',
      'DOWN [ RIGHT Player ] -> [ RIGHT Player ]'
    ]);
  });

  it('expands rule with both HORIZONTAL and no implicit direction', ()=> {
    const horizontalNoDirection = '[ HORIZONTAL Player ] -> [ DEAD Player ]'

    expect(expandCollisionRule(horizontalNoDirection)).toEqual([
      'UP [ LEFT Player ] -> [ DEAD Player ]',
      'UP [ RIGHT Player ] -> [ DEAD Player ]',
      'DOWN [ LEFT Player ] -> [ DEAD Player ]',
      'DOWN [ RIGHT Player ] -> [ DEAD Player ]',
      'LEFT [ LEFT Player ] -> [ DEAD Player ]',
      'LEFT [ RIGHT Player ] -> [ DEAD Player ]',
      'RIGHT [ LEFT Player ] -> [ DEAD Player ]',
      'RIGHT [ RIGHT Player ] -> [ DEAD Player ]'
    ]);
  });
});


describe('expanding collision rules', ()=> {
  it('expands rule with no implicit direction', ()=> {
    const rule = '[ Player | Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandCollisionRule(rule)).toEqual([
      'UP [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'LEFT [ Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'RIGHT [ Player | Goomba ] -> [ DEAD Player | Goomba ]'
    ]);
  });

  it('expands HORIZONTAL in any placement', ()=> {
    const horizontalA = 'DOWN [ HORIZONTAL Player | Goomba ] -> [ DEAD Player | Goomba ]'
    const horizontalB = 'DOWN [ Player | HORIZONTAL Goomba ] -> [ DEAD Player | Goomba ]'
    const horizontalC = 'DOWN [ Player | Goomba ] -> [ HORIZONTAL DEAD Player | Goomba ]'
    const horizontalD = 'DOWN [ Player | Goomba ] -> [ DEAD Player | HORIZONTAL Goomba ]'

    const horizontalComboA = 'DOWN [ HORIZONTAL Player | HORIZONTAL Goomba ] -> [ DEAD Player | Goomba ]'
    const horizontalComboB = 'DOWN [ Player | Goomba ] -> [ HORIZONTAL DEAD Player | HORIZONTAL Goomba ]'

    expect(expandCollisionRule(horizontalA)).toEqual([
      'DOWN [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
    ]);

    expect(expandCollisionRule(horizontalB)).toEqual([
      'DOWN [ Player | LEFT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ Player | RIGHT Goomba ] -> [ DEAD Player | Goomba ]',
    ]);

    expect(expandCollisionRule(horizontalC)).toEqual([
      'DOWN [ Player | Goomba ] -> [ LEFT DEAD Player | Goomba ]',
      'DOWN [ Player | Goomba ] -> [ RIGHT DEAD Player | Goomba ]',
    ]);

    expect(expandCollisionRule(horizontalD)).toEqual([
      'DOWN [ Player | Goomba ] -> [ DEAD Player | LEFT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ DEAD Player | RIGHT Goomba ]',
    ]);

    expect(expandCollisionRule(horizontalComboA)).toEqual([
      'DOWN [ LEFT Player | LEFT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ LEFT Player | RIGHT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | LEFT Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | RIGHT Goomba ] -> [ DEAD Player | Goomba ]',
    ]);

    expect(expandCollisionRule(horizontalComboB)).toEqual([
      'DOWN [ Player | Goomba ] -> [ LEFT DEAD Player | LEFT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ LEFT DEAD Player | RIGHT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ RIGHT DEAD Player | LEFT Goomba ]',
      'DOWN [ Player | Goomba ] -> [ RIGHT DEAD Player | RIGHT Goomba ]',
    ]);
  });

  it('expands rule with both HORIZONTAL and no implicit direction', ()=> {
    const horizontalNoDirection = '[ HORIZONTAL Player | Goomba ] -> [ DEAD Player | Goomba ]'

    expect(expandCollisionRule(horizontalNoDirection)).toEqual([
      'UP [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'UP [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'DOWN [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'LEFT [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'LEFT [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'RIGHT [ LEFT Player | Goomba ] -> [ DEAD Player | Goomba ]',
      'RIGHT [ RIGHT Player | Goomba ] -> [ DEAD Player | Goomba ]',
    ]);
  });
});
