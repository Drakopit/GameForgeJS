/** Game-owned graph state. Availability is derived; it is never duplicated per edge. */
export class RouteProgress {
    constructor(data) {
        this.nodes = new Map(data.nodes.map(node => [node.id, node])); this.edges = data.edges;
        this.start = data.nodes[0].id; this.current = this.start; this.cleared = new Set();
        if (this.nodes.size !== data.nodes.length || this.edges.some(edge => edge.length !== 2 || edge.some(id => !this.nodes.has(id)))) throw new Error('Invalid route graph.');
    }
    Available(id) {
        return id === this.start || this.cleared.has(id) || this.edges.some(([from, to]) => to === id && this.cleared.has(from));
    }
    Neighbors(id) {
        return this.edges.filter(edge => edge.includes(id)).map(([from, to]) => from === id ? to : from).filter(candidate => this.Available(candidate));
    }
    Clear(id) { if (this.Available(id)) this.cleared.add(id); }
    Reset() { this.cleared.clear(); this.current = this.start; }
}
