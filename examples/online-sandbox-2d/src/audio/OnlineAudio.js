/** Short generated cues use the framework's audio service and master routing. */
export class OnlineAudio {
    constructor(audio) {
        this.audio = audio; this.buffers = {};
        if (!audio?.context) return;
        for (const [name, frequency] of Object.entries({ mine: 180, place: 300, pickup: 780, interact: 1040 })) {
            const duration = 0.12, rate = audio.context.sampleRate;
            const buffer = audio.context.createBuffer(1, Math.ceil(duration * rate), rate);
            const samples = buffer.getChannelData(0);
            for (let index = 0; index < samples.length; index++) {
                const time = index / rate;
                samples[index] = Math.sin(2 * Math.PI * frequency * time) * (1 - time / duration) ** 2 * 0.3;
            }
            this.buffers[name] = buffer;
        }
    }
    Play(name, volume) { this.audio?.PlaySFX(this.buffers[name], volume); }
}
