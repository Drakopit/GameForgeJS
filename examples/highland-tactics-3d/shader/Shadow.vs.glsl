#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uLightViewProjection;

void main() {
    gl_Position = uLightViewProjection * uModel * vec4(aPosition, 1.0);
}
