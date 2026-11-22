/** Engine-clocked cue throttling over a borrowed AudioManager; no independent context. */
export class SoundEffects extends Component {
    constructor(audio: any, cues?: {});
    audio: any;
    cues: {
        select: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        step: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        jump: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        land: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        shot: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
            wave: string;
        };
        hit: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
            wave: string;
        };
        collect: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        transition: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        success: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
        warning: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
            wave: string;
        };
        splash: {
            frequency: number;
            endFrequency: number;
            duration: number;
            volume: number;
        };
    };
    cooldowns: Map<any, any>;
    played: number;
    Play(name: any): boolean;
}
import { Component } from '../Component.js';
