precision mediump float;
varying vec3 VertexColor;

void main(void) {
    gl_FragColor = vec4(VertexColor, 1.);
}