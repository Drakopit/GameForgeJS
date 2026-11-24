// Linear distance fog, shared by every lit and unlit program.
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
vec3 applyFog(vec3 color, float distanceToCamera) {
    float amount = uFogFar > uFogNear ? clamp((distanceToCamera - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0) : 0.0;
    return mix(color, uFogColor, amount);
}
