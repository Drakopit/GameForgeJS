// Standard vertex interface: attributes, transforms and the varyings every surface reads.
// A program calls gfEmitVertex() from main(), optionally with a displaced position.
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec4 aTangent;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform mat4 uNormalMatrix;
uniform mat4 uLightViewProjection;

out vec3 vWorldPosition;
out vec3 vNormal;
out vec2 vUv;
out mat3 vTbn;
out vec4 vShadowCoord;

// Object-space position, normal and tangent (xyz, w = bitangent sign) in; world-space TBN out.
void gfEmitVertex(vec3 position, vec3 objectNormal, vec4 objectTangent, vec2 uv) {
    vec4 worldPosition = uModel * vec4(position, 1.0);
    vec3 normal = normalize(mat3(uNormalMatrix) * objectNormal);
    vec3 tangent = normalize(mat3(uModel) * objectTangent.xyz);
    tangent = normalize(tangent - normal * dot(normal, tangent));
    vec3 bitangent = cross(normal, tangent) * objectTangent.w;

    vWorldPosition = worldPosition.xyz;
    vNormal = normal;
    vUv = uv;
    vTbn = mat3(tangent, bitangent, normal);
    vShadowCoord = uLightViewProjection * worldPosition;
    gl_Position = uProjection * uView * worldPosition;
}
