const assert = require('node:assert/strict');
async function inspectPlatformAdventureAI(page) {
    const result = await page.evaluate(async () => {
        const { Engine, LevelHandler } = await import('gameforgejs/core');
        Engine.Stop(); const level = LevelHandler.current;
        const enemy = level.enemies[0]; const player = level.player;
        const saved = { enemy: enemy.position.Clone(), spawn: enemy.spawn.Clone(), player: player.position.Clone(), hp: player.hp };
        // Exercise the actual registered enemy and state machine on a deterministic floor.
        const blocks = level.blocks;
        const floorY = 480;
        level.blocks = [{ position: { x: 0, y: floorY }, size: { x: 1000, y: 30 } }];
        try {
            enemy.position.Set(200, floorY - enemy.size.y); enemy.spawn.Set(200, enemy.position.y);
            enemy.isGrounded = true; player.position.Set(300, floorY - player.size.y); player.hp = player.maxHP;
            enemy.brain.Reset(); enemy.ReturnToIdle(); enemy.OnUpdate(1 / 60);
            const chase = enemy.brain.mode === 'chase';
            level.blocks.push({ position: { x: 275, y: 300 }, size: { x: 15, y: 180 } });
            enemy.OnUpdate(1 / 60);
            const occluded = !enemy.brain.seesPlayer && enemy.brain.mode === 'search' && !enemy.CanAttackPlayer();
            enemy.brain.Update(5);
            const patrol = enemy.brain.mode === 'patrol';
            enemy.Reset();
            const reset = enemy.brain.memoryRemaining === 0 && enemy.brain.mode === 'patrol';
            return { chase, occluded, patrol, reset };
        } finally {
            level.blocks = blocks; enemy.Reset(saved.spawn); enemy.position.Copy(saved.enemy); player.position.Copy(saved.player); player.hp = saved.hp;
        }
    });
    for (const [key, value] of Object.entries(result)) assert.equal(value, true, key);
}
module.exports = { inspectPlatformAdventureAI };
