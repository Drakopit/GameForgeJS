import { Config, EventEmitter } from 'gameforgejs/core';
import { NetworkClient } from 'gameforgejs/network';
import { PLAYER_COLORS } from '../data/OnlineWorldData.js';

const BACKPRESSURE_BYTES = 32768;
const INPUT_BATCH_SIZE = 2;
const CONNECTION_TIMEOUT = 90;
const SERVER_WAKE_NOTICE_SECONDS = 10;

/** Dedicated-server protocol; never treats a peer's state as authoritative. */
export class OnlineSession extends EventEmitter {
    constructor() {
        super();
        this.blocks = new Map();
        this.players = [];
        this.collected = new Set();
        this.status = 'idle';
        this.room = '';
        this.outbound = [];
        this.actionId = 0;
        this.charge = 0;
        this.ping = 0;
    }

    static DefaultEndpoint() {
        const configured = new URLSearchParams(location.search).get('server') || Config.data.network?.serverUrl;
        if (configured && configured !== 'local') return configured;
        return ['localhost', '127.0.0.1'].includes(location.hostname) ? 'ws://127.0.0.1:8080/ws' : '';
    }

    Connect({ endpoint, name, room = '', create = false }) {
        const url = new URL(endpoint);
        if (!['ws:', 'wss:'].includes(url.protocol)) throw new Error('Use a ws:// or wss:// server address.');
        if (location.protocol === 'https:' && url.protocol !== 'wss:') throw new Error('HTTPS requires a secure wss:// server.');
        this.Disconnect();
        this.endpoint = url.href;
        const color = Array.from(name).reduce((hash, character) => hash + character.codePointAt(0), 0) % PLAYER_COLORS.length;
        this.profile = { name, color, room: room.trim().toUpperCase(), mode: create ? 'create' : 'join', protocol: 1 };
        this.status = 'connecting'; this.elapsed = 0; this.pingAge = 0;
        this.client = new NetworkClient({ url: this.endpoint, autoReconnect: true });
        this.removeListeners = [
            this.client.on('open', () => {
                this.elapsed = 0;
                this.client.Send('hello', this.room
                    ? { ...this.profile, mode: 'join', room: this.room, resumeToken: this.resumeToken }
                    : this.profile);
            }),
            this.client.on('message', message => this.Receive(message.type, message.payload)),
            this.client.on('close', () => { this.status = this.room ? 'reconnecting' : 'connecting'; this.outbound = []; }),
            this.client.on('error', () => { this.message = 'Cannot reach server. Check the address and start the backend.'; }),
        ];
        this.client.Connect();
    }

    Receive(type, payload) {
        if (type === 'error') {
            this.message = payload.message;
            if (this.status !== 'online') { this.status = 'error'; this.client.autoReconnect = false; }
        }
        if (type === 'joined') {
            Object.assign(this, { room: payload.room, playerId: payload.playerId, resumeToken: payload.resumeToken,
                revision: payload.revision, charge: payload.charge, lastTick: payload.tick, status: 'online', elapsed: 0 });
            this.blocks = new Map(payload.blocks.map(block => [`${block.x},${block.y}`, block]));
            this.collected = new Set(payload.collected);
            this.outbound = [];
            this.players = payload.players;
        }
        if (type === 'state') {
            if (payload.tick <= this.lastTick) return;
            this.lastTick = payload.tick;
            this.players = payload.players; this.charge = payload.charge;
            if (payload.revision > this.revision && !this.resyncPending) {
                this.resyncPending = true; this.client.Send('resync');
            }
        }
        if (type === 'joined') this.resyncPending = false;
        if (type === 'world') {
            if (payload.revision !== this.revision + 1) { this.client.Send('resync'); return; }
            this.revision = payload.revision;
            const key = `${payload.x},${payload.y}`;
            if (payload.type === 'air') this.blocks.delete(key); else this.blocks.set(key, payload);
        }
        if (type === 'pickup') this.collected.add(payload.id);
        if (type === 'pong') this.ping = Math.max(0, performance.now() - payload.echo);
        this.emit(type, payload);
    }

    Update(dt) {
        if (!this.client) return;
        this.elapsed += dt; this.pingAge += dt;
        if (this.status === 'connecting' && this.elapsed > SERVER_WAKE_NOTICE_SECONDS) {
            this.message = 'The free server may be waking up. First connection can take about a minute…';
        }
        if (this.status === 'connecting' && this.elapsed > CONNECTION_TIMEOUT) {
            this.client.Disconnect(); this.status = 'error';
            this.message = 'Server unavailable. Start the backend or enter a deployed WSS address.';
        }
        if (this.status !== 'online') return;
        if (this.outbound.length >= INPUT_BATCH_SIZE) {
            if (this.client.socket?.bufferedAmount > BACKPRESSURE_BYTES) {
                this.client.socket.close(1013, 'network congested'); return;
            }
            this.client.Send('inputs', { commands: this.outbound.splice(0, 4) });
        }
        if (this.pingAge > 2) { this.pingAge = 0; this.client.Send('ping', { echo: Math.trunc(performance.now()) }); }
    }

    Action(kind, tile, material) {
        if (this.status === 'online') this.client.Send('action', { id: ++this.actionId, kind, ...tile, material });
    }
    Chat(text) { if (text.trim()) this.client?.Send('chat', { text }); }
    Invite() {
        const url = new URL(location.href);
        url.search = ''; url.searchParams.set('room', this.room); url.searchParams.set('server', this.endpoint);
        return url.href;
    }
    Disconnect() {
        for (const remove of this.removeListeners ?? []) remove();
        this.removeListeners = [];
        this.client?.Disconnect(); this.client = null;
        this.room = ''; this.resumeToken = ''; this.status = 'idle'; this.outbound = [];
        this.actionId = 0;
    }
}
