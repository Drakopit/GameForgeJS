/**
 * @doc Class Song
 * @namespace Audio
 * @class Song
 * @author ...
 * @summary Manages audio playback and analysis using the Web Audio API.
 * @description Provides methods to initialize, play, stop, and pause audio, as well as analyze audio data.
 * @Date ...
 */
export class Song {
    constructor() {
        // Polyfill for AudioContext for compatibility
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.analyserNode = null;
        this.audioData = null;
        this.audioPlaying = false;
        this.sampleSize = 1024; // Number of samples to collect before analyzing data
        this.amplitudeArray = null; // Array to hold time domain data
        this.audioUrl = null;

        this.initializeAudioContext();
    }

    initializeAudioContext() {
        try {
            this.audioContext = new AudioContext();

            // Verifica se o contexto está suspenso (restringido pelo navegador)
            if (this.audioContext.state === 'suspended') {
                const checkAndResume = () => {
                    this.audioContext.resume().then(() => {
                        console.log('AudioContext resumed automatically.');
                        document.removeEventListener('keydown', checkAndResume);
                        document.removeEventListener('click', checkAndResume);
                    }).catch(() => {
                        console.warn('Failed to resume AudioContext. Waiting for a user gesture.');
                    });
                };

                // Adiciona um fallback para tentar retomar no futuro
                document.addEventListener('keydown', checkAndResume);
                document.addEventListener('click', checkAndResume);
            }

            this.SetupAudioNodes();
        } catch (ex) {
            console.error('Error initializing audio context:', ex);
        }
    }

    Play(audioUrl, isBGM = false) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed on play.');
                this.internalPlay(audioUrl, isBGM);
            });
        } else {
            this.internalPlay(audioUrl, isBGM);
        }
    }

    internalPlay(audioUrl, isBGM) {
        if (this.audioData === null) {
            this.LoadSound(audioUrl);
        } else {
            this.PlaySound(this.audioData, isBGM);
        }
    }

    Stop() {
        if (this.audioPlaying && this.sourceNode) {
            this.sourceNode.stop(0);
            this.audioPlaying = false;
        }
    }

    Pause() {
        if (this.audioPlaying && this.sourceNode) {
            this.sourceNode.disconnect();
            this.audioPlaying = false;
        }
    }

    async SetupAudioNodes() {
        try {
            await this.audioContext.audioWorklet.addModule('./processor.js');
            this.analyserNode = this.audioContext.createAnalyser();
            this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);

            const audioWorkletNode = new AudioWorkletNode(this.audioContext, 'my-processor');
            this.analyserNode.connect(audioWorkletNode);
            audioWorkletNode.connect(this.audioContext.destination);

            audioWorkletNode.port.onmessage = (event) => {
                console.log('Audio processed:', event.data);
            };
        } catch (error) {
            console.error('Error setting up audio nodes:', error);
        }
    }

    LoadSound(songUrl) {
        const request = new XMLHttpRequest();
        request.open('GET', songUrl, true);
        request.responseType = 'arraybuffer';

        request.onload = () => {
            this.audioContext.decodeAudioData(request.response)
                .then(buffer => {
                    this.audioData = buffer;
                    this.PlaySound(this.audioData);
                })
                .catch(error => {
                    console.error('Error decoding audio data:', error);
                });
        };

        request.onerror = () => {
            console.error('Error loading audio file.');
        };

        request.send();
    }

    PlaySound(buffer, isBGM = false) {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.loop = isBGM; // Loop for BGM, not for sound effects
        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.start(0);
        this.audioPlaying = true;
    }
}
