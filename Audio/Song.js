// In progress

export class Song {
    constructor() {
        window.AudioContext = (function(){
            return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
        })();
        this.audioContext;
        this.audioBuffer;
        this.sourceNode;
        this.analyserNode;
        this.javascriptNode;
        this.audioData = null;
        this.audioPlaying = false;
        this.sampleSize = 1024;  // number of samples to collect before analyzing data
        this.amplitudeArray;     // array to hold time domain data
        // This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
        this.audioUrl;
    }

    Init() {
        try {
            this.audioContext = new AudioContext();
            this.SetupAudioNodes();
        } catch(ex) {
            console.log('Erro ao inicializar contexto de áudio!');
        }
    }

    Play(audioUrl) {
        this.javascriptNode.onaudioprocess = function () { this.analyserNode.getByteTimeDomainData(this.amplitudeArray); }
        if(this.audioData == null) this.LoadSound(audioUrl);
        else this.PlaySound(this.audioData);
    }

    Stop() {
        this.sourceNode.stop(0);
        this.audioPlaying = false;
    }

    Pause() {
        
    }

    SetupAudioNodes() {
        this.sourceNode     = this.audioContext.createBufferSource();
        this.analyserNode   = this.audioContext.createAnalyser();
        this.javascriptNode = this.audioContext.createScriptProcessor(this.sampleSize, 1, 1);
        // Create the array for the data values
        this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        // Now connect the nodes together
        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.connect(this.analyserNode);
        this.analyserNode.connect(this.javascriptNode);
        this.javascriptNode.connect(this.audioContext.destination);
    }

    LoadSound(song) {
        var request = new XMLHttpRequest();
        request.open('GET', song, true);
        request.responseType = 'arraybuffer';
        // When loaded, decode the data and play the sound
        request.onload = function () {
            this.audioContext.decodeAudioData(request.response, function (buffer) {
                this.audioData = buffer;
                this.PlaySound(this.audioData);
            }, this.Erro);
        }
        request.send();
    }

    PlaySound(buffer) {
        this.sourceNode.buffer = buffer;
        this.sourceNode.start(0);    // Play the sound now
        this.sourceNode.loop = true;
        this.audioPlaying = true;
    }

    Erro(erro) {
        console.log(`Erro ao carregar o áudio: ${erro}`);
    }
}