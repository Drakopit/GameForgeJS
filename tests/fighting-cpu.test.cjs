const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
async function fixture(roll = 0.4) {
    const { FightingCPU } = await import(pathToFileURL(path.resolve('examples/fighting-2d/src/ai/FightingCPU.js')));
    const opponent = { position: { x: 550 }, state: 'idle', GetCurrentAttack: () => null, CanCancel: () => false };
    const fighter = { position: { x: 100 }, opponent, CanStartAttack: name => name === 'special' };
    return { cpu: new FightingCPU(() => roll), fighter, opponent };
}
test('fighting CPU approaches, uses powers at range and emits attack edges rather than held spam', async () => {
    const { cpu, fighter } = await fixture();
    assert.equal(cpu.Read(fighter, 1 / 60, []).special, true);
    assert.notEqual(cpu.Read(fighter, 1 / 60, []).special, true);
    fighter.CanStartAttack = () => false;
    assert.deepEqual(cpu.Decide(fighter, []), { left: false, right: true });
});
test('fighting CPU reacts to projectiles and confirms melee chains before cancelling', async () => {
    const { cpu, fighter, opponent } = await fixture(0.6);
    const shot = { active: true, owner: opponent, position: { x: 180 }, direction: -1 };
    assert.deepEqual(cpu.Decide(fighter, [shot]), { down: true });
    cpu.random = () => 0.2;
    assert.deepEqual(cpu.Decide(fighter, [shot]), { up: true });
    fighter.hitOnce = true; fighter.currentAttackName = 'light';
    assert.deepEqual(cpu.Decide(fighter, []), { heavy: true });
    fighter.currentAttackName = 'heavy';
    assert.deepEqual(cpu.Decide(fighter, []), { special: true });
    fighter.hitOnce = false; opponent.position.x = 180; opponent.state = 'hurt';
    assert.deepEqual(cpu.Decide(fighter, []), { heavy: true });
});
