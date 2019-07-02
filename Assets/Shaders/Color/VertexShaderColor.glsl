attribute vec3 VertexPosition;
uniform mat4 ProjectionMatrix;
uniform mat4 VertexMatrix;
uniform mat4 ModelMatrix;
// A cor do ponto
attribute vec3 color;
varying vec3 VertexColor;

// função pre-built
void main(void) {
    gl_Position = ProjectionMatrix * VertexMatrix * ModelMatrix * vec4(VertexPosition, 1.);
    VertexColor = color;
}