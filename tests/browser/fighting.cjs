const assert = require('node:assert/strict');
const { expect } = require('@playwright/test');

async function enterFight(page, { versus = false } = {}) {
    const current = () => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current?.constructor.name);
    await expect.poll(current, { timeout: 30000, intervals: [50, 100] }).toBe('FightingGameMenuLevel');
    if (versus) await page.keyboard.press('ArrowDown');
    for (const target of ['FightingCharacterSelectLevel', 'FightingGame2DLevel']) {
        if (versus && target === 'FightingGame2DLevel') {
            await page.keyboard.down('Enter'); await page.waitForTimeout(120); await page.keyboard.up('Enter');
            await page.waitForTimeout(80);
        }
        await page.keyboard.down('Enter'); await page.waitForTimeout(120); await page.keyboard.up('Enter');
        await expect.poll(current, { timeout: 30000, intervals: [50, 100] }).toBe(target);
    }
    if (versus) await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.playerTwo.controlledByPlayer)).toBe(true);
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.roundState), { timeout: 15000, intervals: [50] }).toBe('fight');
}
async function inspectFighting(page, screenshotPath) {
    await enterFight(page);
    await page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        level.StartRound(true);
        level.roundState = 'fight';
        level.playerTwo.controlledByPlayer = true;
        level.playerOne.meter = 0;
        level.playerOne.position.x = 250;
        level.playerTwo.position.x = 650;
    });
    await page.keyboard.down('KeyL'); await page.waitForTimeout(90); await page.keyboard.up('KeyL');
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.playerOne.shotsFired)).toBe(1);
    await expect.poll(() => page.evaluate(async () => {
        const level = (await import('gameforgejs/core')).LevelHandler.current;
        return level.playerTwo.hp < level.playerTwo.maxHp;
    }), { timeout: 15000 }).toBe(true);
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.hud.help.visible)).toBe(true);
    await page.keyboard.press('KeyH');
    await expect.poll(() => page.evaluate(async () => (await import('gameforgejs/core')).LevelHandler.current.hud.help.visible)).toBe(false);
    const result = await page.evaluate(async () => {
        const { Engine, Input } = await import('gameforgejs/core');
        const { LevelHandler } = await import('gameforgejs/core');
        Engine.Stop(); const level = LevelHandler.current;
        const one = level.playerOne, two = level.playerTwo;
        const reader = level.input.Player.bind(level.input);
        const commands = new Map(); level.input.Player = fighter => commands.get(fighter) ?? {};
        const step = count => { for (let i = 0; i < count; i++) { Input.Update(); level.OnUpdate(1 / 60); Input.LateUpdate(); } };
        const reset = (x = 250, y = 650) => {
            level.StartRound(true); level.roundState = 'fight'; commands.clear();
            one.position.x = x; two.position.x = y; two.controlledByPlayer = true;
            one.FaceOpponent(); two.FaceOpponent();
        };
        reset(); one.meter = 0;
        const freePower = one.StartAttack('special'); step(70);
        const normalDamage = two.maxHp - two.hp;
        const singleRelease = one.shotsFired === 1;
        reset(); two.position.y = 300; two.hp = 0; level.CheckRoundEnd(); step(40);
        const knockoutLands = two.position.y === two.groundY;

        reset(); commands.set(two, { down: true }); one.StartAttack('special'); step(70);
        const chip = two.maxHp - two.hp;
        reset(250, 400); one.StartAttack('special');
        commands.set(two, { up: true }); step(1); commands.set(two, {}); step(45);
        const jumpedPower = two.hp === two.maxHp;
        reset(); one.meter = 49;
        const rejectedSuper = !one.StartAttack('super') && one.meter === 49;
        one.meter = 50; const superStarted = one.StartAttack('super') && one.meter === 0;
        step(20);
        const superShot = level.combat.projectiles.pool.some(shot => shot.active && shot.attack.rank === 2);
        reset(400, 560);
        level.combat.Fire(one, (await import(new URL('./src/data/FighterAttacks.js', location.href))).FighterAttacks.special);
        level.combat.Fire(two, (await import(new URL('./src/data/FighterAttacks.js', location.href))).FighterAttacks.special);
        step(8);
        const clashed = level.combat.projectiles.pool.every(shot => !shot.active) && one.hp === one.maxHp && two.hp === two.maxHp;
        reset(400, 475); commands.set(one, { light: true }); step(1); commands.set(one, {}); step(6);
        const lightHit = one.hitOnce;
        commands.set(one, { heavy: true }); step(1); commands.set(one, {}); step(15);
        const heavyHit = one.comboCount >= 2;
        commands.set(one, { special: true }); step(1); commands.set(one, {}); step(28);
        const chained = one.comboCount >= 3;
        const comboCount = one.comboCount;
        reset(); const count = level.entities.length;
        one.StartAttack('super'); step(20); level.StartRound();
        const cleanRound = level.combat.projectiles.pool.every(shot => !shot.active) && !one.bufferedAttack && one.comboCount === 0;
        for (let i = 0; i < 3; i++) { level.CreateFighters(); level.StartRound(true); }
        const stableEntities = level.entities.length === count;
        const ko = level.playerOne; ko.PlayDefeat();for(let frame=0;frame<20;frame++)ko.UpdateAnimation(1/60);
        const koFrame = ko.sprite.index === ko.sprite.frameCount-1 && ko.state === 'ko' && ko.sprite.finished;
        const { GetSheetAnimations } = await import(new URL('./src/data/FighterAnimations.js', location.href));
        const { FIGHTING_GAME_CHARACTERS } = await import(new URL('./src/state/FightingGameState.js', location.href));
        const { AssetManager } = await import('gameforgejs/core');
        const canvas = new OffscreenCanvas(64, 64); const context = canvas.getContext('2d');
        const occupiedFrames = FIGHTING_GAME_CHARACTERS.every(character => Object.values(GetSheetAnimations(character.asset)).every(clip => {
            const image = AssetManager.instance.GetImage(character.asset);
            for (let index = 0; index < clip.count; index++) {
                context.clearRect(0, 0, 64, 64);
                const cell=clip.cells[index];
                context.drawImage(image, cell.column * 64, cell.row * 64, 64, 64, 0, 0, 64, 64);
                const pixels = context.getImageData(0, 0, 64, 64).data;
                if (!pixels.some((value, pixel) => pixel % 4 === 3 && value > 0)) return false;
            }
            return true;
        }));
        // Use the real CPU/level loop with a stable random sample, not synthetic attacks.
        level.StartRound(true); level.roundState = 'fight'; commands.clear();
        level.playerTwo.controlledByPlayer = false; level.cpu.random = () => 0.4;
        level.playerOne.hp = level.playerOne.maxHp = 1000;
        const states = new Set();
        for (let i = 0; i < 600; i++) { step(1); states.add(level.playerTwo.state); }
        const activeCPU = level.playerTwo.shotsFired > 0 && level.playerOne.hp < 1000 && states.has('light') && states.has('heavy');
        level.input.Player = reader;
        const { FightingGameSession } = await import(new URL('./src/state/FightingGameState.js', location.href));
        const previousStage = FightingGameSession.arcadeStage;
        level.playerOne.roundWins = 1; level.playerTwo.hp = 0; level.CheckRoundEnd();
        const confirm = level.input.ConfirmPressed.bind(level.input);
        level.input.ConfirmPressed = () => true; step(1);
        level.input.ConfirmPressed = () => false; step(210);
        level.input.ConfirmPressed = confirm;
        const matchAdvance = FightingGameSession.arcadeStage === previousStage + 1 && level.entities.length === count;
        level.StartRound(true); level.roundState = 'fight';
        level.playerTwo.controlledByPlayer = true;
        level.playerOne.StartAttack('super'); step(22);
        level.OnDrawn(); level.OnGUI();
        return { freePower, normalDamage, singleRelease, knockoutLands, chip, jumpedPower, rejectedSuper, superStarted, superShot,
            clashed, lightHit, heavyHit, chained, comboCount, cleanRound, stableEntities, koFrame, occupiedFrames, matchAdvance, activeCPU, cpuStates: [...states] };
    });
    for (const key of ['freePower','singleRelease','knockoutLands','jumpedPower','rejectedSuper','superStarted','superShot','clashed',
        'lightHit','heavyHit','chained','cleanRound','stableEntities','koFrame','occupiedFrames','matchAdvance','activeCPU']) assert.equal(result[key], true, `${key}: ${JSON.stringify(result)}`);
    assert.ok(result.normalDamage > result.chip && result.chip > 0, JSON.stringify(result));
    await page.screenshot({ path: screenshotPath });
}
module.exports = { inspectFighting, enterFight };
