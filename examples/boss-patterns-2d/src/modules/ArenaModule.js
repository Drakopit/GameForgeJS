import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { BossDirector } from '../components/BossDirector.js';
import { ChargeAttack } from '../components/ChargeAttack.js';
import { CombatMotion } from '../components/CombatMotion.js';
import { CombatVisual } from '../components/CombatVisual.js';
import { FanAttack } from '../components/FanAttack.js';
import { HazardField } from '../components/HazardField.js';
import { ProjectileContact } from '../components/ProjectileContact.js';
import { RingAttack } from '../components/RingAttack.js';
import { ArenaBoss } from '../entities/ArenaBoss.js';
import { ArenaPlayer } from '../entities/ArenaPlayer.js';
import { ArenaProjectile } from '../entities/ArenaProjectile.js';
import { ArenaView } from '../entities/ArenaView.js';
import { ArenaLevel } from '../levels/ArenaLevel.js';
import { ArenaHUD } from '../ui/ArenaHUD.js';

export class ArenaModule extends Module {
    constructor() {
        super('boss-patterns-2d', { imports: [module2D({ telemetry: true })],
            declarations: [BossDirector, ChargeAttack, CombatMotion, CombatVisual, FanAttack, HazardField, ProjectileContact, RingAttack, ArenaBoss, ArenaPlayer, ArenaProjectile, ArenaView, ArenaLevel, ArenaHUD], exports: [ArenaLevel] });
    }
}
