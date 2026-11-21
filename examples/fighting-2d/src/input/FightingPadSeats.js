/** Stable player seats survive sparse browser slots and another pad disconnecting. */
export class FightingPadSeats {
    constructor() { this.seats = [null, null]; }
    Update(connected) {
        this.seats = this.seats.map(index => connected.includes(index) ? index : null);
        for (const index of connected) {
            if (this.seats.includes(index))
                continue;
            const seat = this.seats.indexOf(null);
            if (seat !== -1)
                this.seats[seat] = index;
        }
    }
    Resolve(seat) { return this.seats[seat] ?? -1; }
}
