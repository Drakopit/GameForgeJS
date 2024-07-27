/**
 * @doc Class Song
 * @namespace Audio
 * @class Song
 * @author Patrick Faustino Camello
 * @summary Manages audio playback and analysis using the Web Audio API.
 * @description Provides methods to initialize, play, stop, and pause audio, as well as analyze audio data.
 * @Date 15/05/2019
 * @example
 *  const song = new Song();
 *  song.Init();
 *  song.Play('path/to/audio/file.mp3');
 * @returns {Object}
 */
export class Song {
    constructor() {
        // Polyfill for AudioContext for compatibility
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        this.audioContext = null;
        this.audioBuffer = null;
        this.sourceNode = null;
        this.analyserNode = null;
        this.javascriptNode = null;
        this.audioData = null;
        this.audioPlaying = false;
        this.sampleSize = 1024;  // Number of samples to collect before analyzing data
        this.amplitudeArray = null; // Array to hold time domain data
        this.audioUrl = null;
    }

    Init() {
        try {
            this.audioContext = new AudioContext();
            this.SetupAudioNodes();
        } catch (ex) {
            console.error('Error initializing audio context:', ex);
        }
    }

    Play(audioUrl) {
        if (this.audioData === null) {
            this.LoadSound(audioUrl);
        } else {
            this.PlaySound(this.audioData);
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

    SetupAudioNodes() {
        this.sourceNode = this.audioContext.createBufferSource();
        this.analyserNode = this.audioContext.createAnalyser();
        this.javascriptNode = this.audioContext.createScriptProcessor(this.sampleSize, 1, 1);
        this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);

        // Connect nodes
        this.sourceNode.connect(this.analyserNode);
        this.analyserNode.connect(this.javascriptNode);
        this.javascriptNode.connect(this.audioContext.destination);

        this.javascriptNode.onaudioprocess = () => {
            if (this.analyserNode) {
                this.analyserNode.getByteTimeDomainData(this.amplitudeArray);
            }
        };
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

    PlaySound(buffer) {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.loop = true;
        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.start(0);
        this.audioPlaying = true;
    }
}
