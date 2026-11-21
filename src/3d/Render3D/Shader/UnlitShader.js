import { FOG_UNIFORMS } from './FogShader.js';

export const UNLIT_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 2) in vec2 aUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec2 vUv;
out vec3 vWorldPosition;

void main() {
    vUv = aUv;
    vWorldPosition = (uModel * vec4(aPosition, 1.0)).xyz;
    gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}`;

export const UNLIT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
in vec3 vWorldPosition;
out vec4 outColor;
uniform bool uReflectionClip;
uniform float uReflectionClipHeight;

uniform vec4 uAlbedoColor;
uniform sampler2D uAlbedoMap;
uniform bool uHasAlbedoMap;
uniform vec3 uCameraPosition;
${FOG_UNIFORMS}

void main() {
    if (uReflectionClip && vWorldPosition.y < uReflectionClipHeight) discard;
    vec4 albedo = uHasAlbedoMap ? texture(uAlbedoMap, vUv) : vec4(1.0);
    vec4 color = uAlbedoColor * albedo;
    outColor = vec4(applyFog(color.rgb, length(uCameraPosition - vWorldPosition)), color.a);
}`;
