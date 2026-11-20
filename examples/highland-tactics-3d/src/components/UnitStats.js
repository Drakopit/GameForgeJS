import { Component } from 'gameforgejs/core';
/** Tactical values belong to a unit component, independent of mesh representation. */
export class UnitStats extends Component {
    constructor(definition) { super(); this.definition = { ...definition }; this.Reset(); }
    Reset() { Object.assign(this, this.definition); this.maxHp = this.definition.hp; this.ct = 0; this.energy = 2; this.exposed = 0; this.flash = 0; }
    OnUpdate(dt) { this.flash = Math.max(0, this.flash - dt); }
}
