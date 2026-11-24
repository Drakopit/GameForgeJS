// Fragment side of gf_vertex: the varyings, the output and the planar-reflection clip.
in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUv;
in mat3 vTbn;
in vec4 vShadowCoord;

out vec4 outColor;
uniform bool uReflectionClip;
uniform float uReflectionClipHeight;

uniform vec3 uCameraPosition;
uniform float uTime;

// Drops fragments below the water plane while the planar-reflection pass renders.
void gfClipReflection() {
    if (uReflectionClip && vWorldPosition.y < uReflectionClipHeight) discard;
}

// World-space direction from the surface towards the camera.
vec3 gfViewDirection() {
    return normalize(uCameraPosition - vWorldPosition);
}
