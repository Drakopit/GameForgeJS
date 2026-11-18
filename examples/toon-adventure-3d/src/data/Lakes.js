import { Pond } from './Pond.js';

export const Lakes = [
    { ...Pond, name: 'Courtyard shallows' },
    { ...Pond, name: 'Azure Lake', position: [-15, 0.18, -12], width: 14, depth: 18,
        segments: 28, areaMargin: 2.5, waveFrequencyX: 0.8, waveFrequencyZ: 0.65, openBanks: true, color: '#319cbb', amplitude: 0.055 },
    { ...Pond, name: 'Moonwater Lake', position: [15, 0.18, -31], width: 14, depth: 18,
        segments: 28, areaMargin: 2.5, waveFrequencyX: 0.8, waveFrequencyZ: 0.65, openBanks: true, color: '#548fd0', amplitude: 0.045 },
];
