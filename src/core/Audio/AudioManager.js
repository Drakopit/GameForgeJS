// Arquivo: Root/AudioManager.js

/**
 * Web Audio service. New games own an instance; the lazy static accessor supports older games.
 */
function setPannerPosition(panner, [x, y, z = 0]) {
    if (panner.positionX) { panner.positionX.value = x; panner.positionY.value = y; panner.positionZ.value = z; }
    else panner.setPosition?.(x, y, z);
}

export class AudioManager {
    // Padrão Singleton: Só existe uma instância no jogo inteiro
    static _instance = null;
    static get instance() { return this._instance ??= new AudioManager(); }
    static set instance(value) { this._instance = value; }

    constructor() {
        this.context = null;
        /** @type {any} The game's AssetManager: clips can be played by resources.json name. */
        this.assets = null;

        // Nodos Globais
        this.masterGain = null;
        this.analyserNode = null;

        // Controle de BGM (Música de Fundo)
        this.currentBGM = null;
        this.currentBGMGain = null;
        this.isInitialized = false;
        this.resumeAudio = null;
        this.activeSources = new Set();
        this.volume = 1;
        this.muted = false;
        this.maxVoices = 24;
        /** @type {{buffer: AudioBuffer, source: AudioBufferSourceNode, gain: GainNode, volume: number}|null} */
        this.music = null;
    }

    // A inicialização deve ser chamada no primeiro clique/interação do usuário
    Initialize() {
        if (this.isInitialized) return;

        try {
            const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext
                ?? globalThis.window?.AudioContext ?? globalThis.window?.webkitAudioContext;
            if (!AudioContextClass) throw new Error("Web Audio is unavailable in this environment.");
            this.context = new AudioContextClass();

            // Lida com as políticas chatas de Autoplay do Chrome/Firefox
            if (this.context.state === 'suspended') {
                const resumeAudio = this.resumeAudio = () => {
                    this.context?.resume().then(() => {
                        console.log('GameForgeJS: AudioContext retomado com sucesso.');
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('keydown', resumeAudio);
                        document.removeEventListener('pointerdown', resumeAudio, true);
                        this.resumeAudio = null;
                    }).catch(() => { /* A disposed or policy-blocked context stays silent. */ });
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
                document.addEventListener('pointerdown', resumeAudio, true);
            }

            // --- SETUP DA ROTA DE ÁUDIO (Gain -> Analyser -> Caixas de Som) ---
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.muted ? 0 : this.volume;

            this.analyserNode = this.context.createAnalyser();
            this.analyserNode.fftSize = 256; // Tamanho do buffer para análise de espectro

            // Conecta o Volume no Analisador, e o Analisador no Destino Final
            this.masterGain.connect(this.analyserNode);
            this.analyserNode.connect(this.context.destination);

            this.isInitialized = true;
            console.log('GameForgeJS: AudioManager inicializado.');
        } catch (ex) {
            console.error('Erro ao inicializar AudioManager:', ex);
        }
    }

    SetGlobalVolume(volume) {
        this.volume = Math.max(0, Math.min(1, Number(volume) || 0));
        if (this.masterGain) {
            // value = Math.max(0, Math.min(1, volume)) para travar entre 0 e 1
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
    }

    /** Mute preserves the chosen master volume. */
    SetMuted(muted) { this.muted = Boolean(muted); this.SetGlobalVolume(this.volume); }

    /**
     * Native, bounded synthesised feedback. Suspended audio is dropped, never
     * queued for a burst after unlock. Returns whether a voice actually started.
     */
    PlayTone({frequency = 440, endFrequency = frequency, duration = 0.1, volume = 0.08, wave = 'sine'} = {}) {
        if (![frequency,endFrequency,duration,volume].every(Number.isFinite) || frequency < 20 || endFrequency < 20
            || frequency > 20000 || endFrequency > 20000 || duration <= 0 || duration > 2 || volume < 0 || volume > 1
            || !['sine','triangle','square','sawtooth'].includes(wave)) throw new RangeError('Invalid sound cue.');
        const ctx = this.context;
        if (!ctx || ctx.state !== 'running' || this.muted || this.volume === 0 || this.activeSources.size >= this.maxVoices) return false;
        const oscillator = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
        oscillator.type = wave; oscillator.frequency.setValueAtTime(frequency,now);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency,now+duration);
        gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+Math.min(0.008,duration/3));
        gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
        oscillator.connect(gain);gain.connect(this.masterGain);this.activeSources.add(oscillator);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();this.activeSources.delete(oscillator);};
        oscillator.start(now);oscillator.stop(now+duration+0.01);return true;
    }

    /**
     * Plays a one-shot sound effect (kept for older games; see PlaySound).
     */
    /**
     * A clip: an AudioBuffer as it is, or a name from resources.json audios (`assets.audios[name]`,
     * with the game's AssetManager as `assets`). @param {AudioBuffer|string|null} clip
     * @returns {AudioBuffer|null}
     */
    Clip(clip) {
        if (typeof clip === "string") return this.assets?.audios?.[clip] ?? null;
        return clip ?? null;
    }

    PlaySFX(audioBuffer, localVolume = 1.0) {
        return this.PlaySound(audioBuffer, { volume: localVolume, force: true });
    }

    /**
     * Plays a sound: 2D, or positional when `position` is given (an [x, y, z] point heard from
     * the listener, see SetListener). A suspended context drops one-shots instead of queueing a
     * burst for later; looping sounds start and are heard once audio unlocks.
     * @param {AudioBuffer|string} buffer - Decoded clip, or its resources.json name.
     * @param {{volume?: number, pitch?: number, loop?: boolean, position?: number[]|null, minDistance?: number, maxDistance?: number, force?: boolean}} [options]
     * @returns {{source: AudioBufferSourceNode, gain: GainNode, panner: PannerNode|null, SetPosition: (position: number[]) => void, SetVolume: (volume: number) => void, Stop: () => void}|null}
     */
    PlaySound(buffer, { volume = 1, pitch = 1, loop = false, position = null, minDistance = 1, maxDistance = 30, force = false } = {}) {
        buffer = /** @type {AudioBuffer} */ (this.Clip(buffer));
        const ctx = this.context;
        if (!ctx || !buffer || !this.masterGain) return null;
        if (!loop && !force && ctx.state !== "running") return null;
        if (this.activeSources.size >= this.maxVoices) return null;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = Boolean(loop);
        source.playbackRate.value = Math.max(0.05, Number(pitch) || 1);
        const gain = ctx.createGain();
        gain.gain.value = Math.max(0, Number(volume) || 0);
        let panner = null;
        if (Array.isArray(position)) {
            panner = ctx.createPanner();
            panner.panningModel = "HRTF";
            panner.distanceModel = "linear";
            panner.refDistance = Math.max(0.01, minDistance);
            panner.maxDistance = Math.max(panner.refDistance + 0.01, maxDistance);
            setPannerPosition(panner, position);
            source.connect(gain).connect(panner).connect(this.masterGain);
        } else {
            source.connect(gain).connect(this.masterGain);
        }
        this.activeSources.add(source);
        const handle = {
            source, gain, panner,
            SetPosition: point => { if (panner && Array.isArray(point)) setPannerPosition(panner, point); },
            SetVolume: value => { gain.gain.value = Math.max(0, Number(value) || 0); },
            Stop: () => { try { source.stop(); } catch { /* not started or already ended */ } release(); },
        };
        const release = () => {
            if (!this.activeSources.delete(source)) return;
            source.disconnect(); gain.disconnect(); panner?.disconnect();
        };
        source.onended = release;
        source.start(0);
        return handle;
    }

    /**
     * Where the listener stands (usually the camera): positional sounds pan and fade from here.
     * @param {number[]} position @param {number[]} [forward] @param {number[]} [up]
     */
    SetListener(position, forward = [0, 0, -1], up = [0, 1, 0]) {
        const listener = this.context?.listener;
        if (!listener) return;
        if (listener.positionX) {
            listener.positionX.value = position[0]; listener.positionY.value = position[1]; listener.positionZ.value = position[2] ?? 0;
            listener.forwardX.value = forward[0]; listener.forwardY.value = forward[1]; listener.forwardZ.value = forward[2];
            listener.upX.value = up[0]; listener.upY.value = up[1]; listener.upZ.value = up[2];
        } else {
            listener.setPosition?.(position[0], position[1], position[2] ?? 0);
            listener.setOrientation?.(forward[0], forward[1], forward[2], up[0], up[1], up[2]);
        }
    }

    /**
     * Starts a music track, crossfading from the current one over `fade` seconds (0 cuts).
     * Playing the track that is already on only changes its volume.
     * @param {AudioBuffer|string} buffer - Decoded clip, or its resources.json name.
     * @param {{volume?: number, fade?: number, loop?: boolean}} [options]
     * @example
     * audio.PlayMusic("theme", { fade: 1.5 });
     */
    PlayMusic(buffer, { volume = 0.5, fade = 1, loop = true } = {}) {
        buffer = /** @type {AudioBuffer} */ (this.Clip(buffer));
        const ctx = this.context;
        if (!ctx || !buffer || !this.masterGain) return null;
        if (this.music?.buffer === buffer) {
            this.SetMusicVolume(volume, fade);
            return this.music;
        }
        this.StopMusic({ fade });
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = Boolean(loop);
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(fade > 0 ? 0 : volume, now);
        if (fade > 0) gain.gain.linearRampToValueAtTime(volume, now + fade);
        source.connect(gain).connect(this.masterGain);
        source.start(0);
        this.music = { buffer, source, gain, volume };
        this.currentBGM = source;
        this.currentBGMGain = gain;
        source.onended = () => { if (this.music?.source === source) this.StopMusic(); };
        return this.music;
    }

    /** @param {number} volume @param {number} [fade] - Seconds. */
    SetMusicVolume(volume, fade = 0) {
        if (!this.music || !this.context) return;
        const gain = this.music.gain.gain, now = this.context.currentTime;
        this.music.volume = volume;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(gain.value, now);
        if (fade > 0) gain.linearRampToValueAtTime(volume, now + fade);
        else gain.setValueAtTime(volume, now);
    }

    /** Stops the music, fading out over `fade` seconds (0 stops at once). */
    StopMusic({ fade = 0 } = {}) {
        const music = this.music;
        if (!music) return;
        this.music = null;
        this.currentBGM = this.currentBGMGain = null;
        const stop = () => {
            try { music.source.stop(); } catch { /* not started yet (suspended context) */ }
            music.source.disconnect(); music.gain.disconnect();
        };
        if (fade > 0 && this.context) {
            const gain = music.gain.gain, now = this.context.currentTime;
            gain.cancelScheduledValues(now);
            gain.setValueAtTime(gain.value, now);
            gain.linearRampToValueAtTime(0, now + fade);
            music.source.onended = null;
            try { music.source.stop(now + fade); } catch { stop(); return; }
            setTimeout(stop, fade * 1000 + 50);
        } else {
            stop();
        }
    }

    /**
     * Replaces the current background track and starts looping playback (older games; see PlayMusic).
     */
    PlayBGM(audioBuffer, localVolume = 0.5) {
        return this.PlayMusic(audioBuffer, { volume: localVolume, fade: 0 });
    }

    StopBGM() {
        this.StopMusic();
    }

    async Dispose() {
        this.StopBGM();
        for (const source of this.activeSources) {
            try { source.stop(); } catch { /* It may have finished between frames. */ }
            source.disconnect();
        }
        this.activeSources.clear();
        if (this.resumeAudio) {
            globalThis.document?.removeEventListener("click", this.resumeAudio);
            globalThis.document?.removeEventListener("keydown", this.resumeAudio);
            globalThis.document?.removeEventListener('pointerdown', this.resumeAudio, true);
        }
        this.resumeAudio = null;
        this.masterGain?.disconnect();
        this.analyserNode?.disconnect();
        await this.context?.close?.();
        this.context = this.masterGain = this.analyserNode = null;
        this.isInitialized = false;
        if (AudioManager._instance === this) AudioManager._instance = null;
    }
}
