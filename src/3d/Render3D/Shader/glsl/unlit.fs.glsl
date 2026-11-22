#version 300 es
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

uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
vec3 applyFog(vec3 color, float distanceToCamera) {
    float amount = uFogFar > uFogNear ? clamp((distanceToCamera - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0) : 0.0;
    return mix(color, uFogColor, amount);
}

void main() {
    if (uReflectionClip && vWorldPosition.y < uReflectionClipHeight) discard;
    vec4 albedo = uHasAlbedoMap ? texture(uAlbedoMap, vUv) : vec4(1.0);
    vec4 color = uAlbedoColor * albedo;
    outColor = vec4(applyFog(color.rgb, length(uCameraPosition - vWorldPosition)), color.a);
}
