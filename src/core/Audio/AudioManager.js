// Arquivo: Root/AudioManager.js

/**
 * Web Audio service. New games own an instance; the lazy static accessor supports older games.
 */
export class AudioManager {
    // Padrão Singleton: Só existe uma instância no jogo inteiro
    static _instance = null;
    static get instance() { return this._instance ??= new AudioManager(); }
    static set instance(value) { this._instance = value; }

    constructor() {
        this.context = null;

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
     * Plays a one-shot sound effect.
     * Creates a source and releases its audio nodes when playback ends.
     */
    PlaySFX(audioBuffer, localVolume = 1.0) {
        if (!this.context || !audioBuffer) return;

        // Cria o reprodutor para ESTE som específico
        const source = this.context.createBufferSource();
        source.buffer = audioBuffer;

        // Cria um controle de volume individual para este tiro/pulo
        const sfxGain = this.context.createGain();
        sfxGain.gain.value = localVolume;

        // Rota: Som -> Volume Local -> Volume Global
        source.connect(sfxGain);
        sfxGain.connect(this.masterGain);
        this.activeSources.add(source);
        source.onended = () => { source.disconnect(); sfxGain.disconnect(); this.activeSources.delete(source); };

        source.start(0); // Toca imediatamente
    }

    /**
     * Replaces the current background track and starts looping playback.
     */
    PlayBGM(audioBuffer, localVolume = 0.5) {
        if (!this.context || !audioBuffer) return;

        this.StopBGM(); // Para a música atual antes de tocar a nova

        this.currentBGM = this.context.createBufferSource();
        this.currentBGM.buffer = audioBuffer;
        this.currentBGM.loop = true;

        const bgmGain = this.context.createGain();
        this.currentBGMGain = bgmGain;
        bgmGain.gain.value = localVolume;

        this.currentBGM.connect(bgmGain);
        bgmGain.connect(this.masterGain);

        this.currentBGM.start(0);
    }

    StopBGM() {
        if (this.currentBGM) {
            try {
                // Tenta parar a música. Se ela estiver "suspended" pelo navegador,
                // isso pode dar erro, então o catch ignora o erro e continua a limpeza.
                this.currentBGM.stop();
            } catch (e) {
                console.warn("GameForgeJS: BGM parada antes de ser iniciada pelo usuário.");
            }

            // Garante que o nó seja desconectado e apagado da memória
            this.currentBGM.disconnect();
            this.currentBGM = null;
        }
        this.currentBGMGain?.disconnect();
        this.currentBGMGain = null;
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
