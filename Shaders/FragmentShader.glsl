// ADICIONE ESTA LINHA NO TOPO: Define a precisão dos cálculos decimais na GPU
precision mediump float;

varying highp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
}