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
                    this.context.resume().then(() => {
                        console.log('GameForgeJS: AudioContext retomado com sucesso.');
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('keydown', resumeAudio);
                        this.resumeAudio = null;
                    });
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            }

            // --- SETUP DA ROTA DE ÁUDIO (Gain -> Analyser -> Caixas de Som) ---
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 1.0; // Volume Global (1.0 = 100%, 0.5 = 50%)

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
        if (this.masterGain) {
            // value = Math.max(0, Math.min(1, volume)) para travar entre 0 e 1
            this.masterGain.gain.value = Math.max(0, Math.min(1, Number(volume) || 0));
        }
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
