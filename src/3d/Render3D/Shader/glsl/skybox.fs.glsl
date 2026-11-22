#version 300 es
precision highp float;

in vec3 vDirection;
out vec4 outColor;

uniform samplerCube uSkybox;

void main() {
    outColor = texture(uSkybox, normalize(vDirection));
}
