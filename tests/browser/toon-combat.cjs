const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function inspectToonCombat(page) {
    await page.keyboard.press('KeyR');
    await page.keyboard.down('Space');
    await expect.poll(() => page.evaluate(async () => {
        return (await import('gameforgejs/core')).LevelHandler.current.player.attack.phase;
    })).not.toBe('ready');
    await page.keyboard.up('Space');

    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler } = await import('gameforgejs/core');
        Engine.Stop();
        const level = LevelHandler.current;
        const player = level.player;
        const enemy = level.enemies[0];
        const step = count => {
            for (let i = 0; i < count; i++) level.OnFixedUpdate(1 / 60);
        };
        const place = () => {
            level.RestartEncounter();
            player.transform.SetPosition(0, 0.55, 0);
            enemy.transform.SetPosition(0, 0.55, -1.5);
        };

        place();
        player.attackRequested = true;
        step(4);
        const windupHP = enemy.health.hp;
        step(12);
        const hitHP = enemy.health.hp;
        const knockedBack = enemy.transform.position[2] < -1.5;
        // Remove immunity and reposition: a swing still must not damage twice.
        enemy.health.invulnerabilityTimer = 0;
        enemy.transform.SetPosition(0, 0.55, -1.5);
        player.attack.TryHit();
        const repeatedHP = enemy.health.hp;
        step(30);
        const completedPhase = player.attack.phase;

        place();
        player.facing = [0, 1];
        player.attackRequested = true;
        step(25);
        const behindHP = enemy.health.hp;

        place();
        step(20);
        const telegraphHP = player.health.hp;
        step(25);
        const enemyHitHP = player.health.hp;
        player.health.Damage(1, enemy);
        const immunityHP = player.health.hp;

        place();
        step(2);
        const lockedDirection = [...enemy.attack.direction];
        player.transform.SetPosition(4, 0.55, 3);
        step(45);
        const dodgedHP = player.health.hp;
        const directionUnchanged = enemy.attack.direction.every((value, index) => value === lockedDirection[index]);

        place();
        enemy.health.Damage(3, player);
        step(1);
        const victory = level.result;
        const deadEnemy = !enemy.body.enabled && !enemy.visible;
        place();
        player.health.Damage(5, enemy);
        step(1);
        const defeat = level.result;
        level.RestartEncounter();
        const reset = {
            hp: [player.health.hp, enemy.health.hp],
            phases: [player.attack.phase, enemy.attack.phase],
            immunity: [player.health.invulnerabilityTimer, enemy.health.invulnerabilityTimer],
            enabled: [player.body.enabled, enemy.body.enabled],
            result: level.result,
        };
        level.OnDrawn();
        level.OnGUI();
        return { windupHP, hitHP, repeatedHP, knockedBack, completedPhase, behindHP, telegraphHP, enemyHitHP, immunityHP, dodgedHP, directionUnchanged, victory, defeat, deadEnemy, reset };
    });
    assert.equal(result.windupHP, 3);
    assert.equal(result.hitHP, 2);
    assert.equal(result.repeatedHP, 2);
    assert.equal(result.knockedBack, true);
    assert.equal(result.completedPhase, 'ready');
    assert.equal(result.behindHP, 3, 'Strike hit behind the player');
    assert.equal(result.telegraphHP, 5);
    assert.equal(result.enemyHitHP, 4);
    assert.equal(result.immunityHP, 4);
    assert.equal(result.dodgedHP, 5, 'Telegraphed attack could not be dodged');
    assert.equal(result.directionUnchanged, true, 'Enemy retargeted during windup');
    assert.equal(result.victory, null, 'Defeating one enemy froze exploration');
    assert.equal(result.defeat, 'defeat');
    assert.equal(result.deadEnemy, true);
    assert.deepEqual(result.reset, { hp: [5, 3], phases: ['ready', 'ready'], immunity: [0, 0], enabled: [true, true], result: null });
}

module.exports = { inspectToonCombat };
