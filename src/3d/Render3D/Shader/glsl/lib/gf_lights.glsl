// Scene lights and the directional shadow map, as WebGL3DRenderer binds them for every lit program.
// gfLighting() is the single lighting model of StandardMaterial, ToonMaterial and lit ShaderMaterials.
#define MAX_POINT_LIGHTS 4
#define MAX_SPOT_LIGHTS 2

uniform sampler2D uShadowMap;
uniform bool uUseShadowMap;
uniform float uShadowBias;
uniform float uShadowStrength;
uniform float uToonBands;

uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uHemisphereSkyColor;
uniform vec3 uHemisphereGroundColor;
uniform float uHemisphereIntensity;

uniform bool uHasDirectionalLight;
uniform vec3 uDirectionalDirection;
uniform vec3 uDirectionalColor;
uniform float uDirectionalIntensity;

uniform int uPointLightCount;
uniform vec3 uPointLightPositions[MAX_POINT_LIGHTS];
uniform vec3 uPointLightColors[MAX_POINT_LIGHTS];
uniform float uPointLightIntensities[MAX_POINT_LIGHTS];
uniform float uPointLightRanges[MAX_POINT_LIGHTS];

uniform int uSpotLightCount;
uniform vec3 uSpotLightPositions[MAX_SPOT_LIGHTS];
uniform vec3 uSpotLightDirections[MAX_SPOT_LIGHTS];
uniform vec3 uSpotLightColors[MAX_SPOT_LIGHTS];
uniform float uSpotLightIntensities[MAX_SPOT_LIGHTS];
uniform float uSpotLightRanges[MAX_SPOT_LIGHTS];
uniform float uSpotLightInnerCos[MAX_SPOT_LIGHTS];
uniform float uSpotLightOuterCos[MAX_SPOT_LIGHTS];

// 3x3 PCF visibility of the directional light at a light-space position (1 = lit).
float readShadow(vec4 shadowCoord) {
    if (!uUseShadowMap) {
        return 1.0;
    }

    vec3 projection = shadowCoord.xyz / shadowCoord.w;
    projection = projection * 0.5 + 0.5;

    if (projection.x < 0.0 || projection.x > 1.0 ||
        projection.y < 0.0 || projection.y > 1.0 ||
        projection.z < 0.0 || projection.z > 1.0) {
        return 1.0;
    }

    vec2 texelSize = 1.0 / vec2(textureSize(uShadowMap, 0));
    float visibility = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            float closestDepth = texture(uShadowMap, projection.xy + vec2(x, y) * texelSize).r;
            visibility += projection.z - uShadowBias > closestDepth ? 0.0 : 1.0;
        }
    }

    visibility /= 9.0;
    return mix(1.0 - uShadowStrength, 1.0, visibility);
}

// Diffuse + Blinn-Phong specular from one light (toon bands when uToonBands >= 2).
vec3 applyLight(vec3 lightDirection, vec3 lightColor, float intensity, vec3 normal, vec3 viewDirection, vec3 albedo, float roughness, float metallic) {
    float diffuseAmount = max(dot(normal, lightDirection), 0.0);
    if (uToonBands >= 2.0) {
        diffuseAmount = min(floor(diffuseAmount * uToonBands), uToonBands - 1.0)
            / (uToonBands - 1.0);
        return albedo * lightColor * diffuseAmount * intensity;
    }
    vec3 diffuse = albedo * (1.0 - clamp(metallic, 0.0, 1.0)) * lightColor * diffuseAmount * intensity;

    vec3 halfVector = normalize(lightDirection + viewDirection);
    float specularPower = mix(96.0, 12.0, clamp(roughness, 0.0, 1.0));
    float specularAmount = pow(max(dot(normal, halfVector), 0.0), specularPower) * (1.0 - roughness);
    vec3 specularColor = mix(vec3(0.04), albedo, clamp(metallic, 0.0, 1.0));
    vec3 specular = specularColor * lightColor * specularAmount * intensity;

    return diffuse + specular;
}

// Ambient + hemisphere + directional (shadowed) + point + spot lighting of one surface point.
vec3 gfLighting(vec3 worldPosition, vec4 shadowCoord, vec3 normal, vec3 viewDirection, vec3 albedo, float roughness, float metallic, float ao) {
    vec3 litColor = albedo * uAmbientColor * uAmbientIntensity * ao;

    float hemiMix = normal.y * 0.5 + 0.5;
    vec3 hemisphere = mix(uHemisphereGroundColor, uHemisphereSkyColor, hemiMix);
    litColor += albedo * hemisphere * uHemisphereIntensity * ao;

    if (uHasDirectionalLight) {
        vec3 lightDirection = normalize(-uDirectionalDirection);
        litColor += applyLight(
            lightDirection,
            uDirectionalColor,
            uDirectionalIntensity * readShadow(shadowCoord),
            normal,
            viewDirection,
            albedo,
            roughness,
            metallic
        );
    }

    for (int i = 0; i < MAX_POINT_LIGHTS; i++) {
        if (i >= uPointLightCount) break;
        vec3 toLight = uPointLightPositions[i] - worldPosition;
        float distanceToLight = length(toLight);
        vec3 lightDirection = toLight / max(distanceToLight, 0.0001);
        float attenuation = clamp(1.0 - distanceToLight / uPointLightRanges[i], 0.0, 1.0);
        attenuation *= attenuation;
        litColor += applyLight(
            lightDirection,
            uPointLightColors[i],
            uPointLightIntensities[i] * attenuation,
            normal,
            viewDirection,
            albedo,
            roughness,
            metallic
        );
    }

    for (int i = 0; i < MAX_SPOT_LIGHTS; i++) {
        if (i >= uSpotLightCount) break;
        vec3 toLight = uSpotLightPositions[i] - worldPosition;
        float distanceToLight = length(toLight);
        vec3 lightDirection = toLight / max(distanceToLight, 0.0001);
        float cone = dot(normalize(-uSpotLightDirections[i]), lightDirection);
        float coneFade = smoothstep(uSpotLightOuterCos[i], uSpotLightInnerCos[i], cone);
        float attenuation = clamp(1.0 - distanceToLight / uSpotLightRanges[i], 0.0, 1.0);
        attenuation *= attenuation * coneFade;
        litColor += applyLight(
            lightDirection,
            uSpotLightColors[i],
            uSpotLightIntensities[i] * attenuation,
            normal,
            viewDirection,
            albedo,
            roughness,
            metallic
        );
    }

    return litColor;
}

// The strongest light direction at a point (for rim, clearcoat and subsurface terms).
vec3 gfKeyLightDirection(vec3 worldPosition, vec3 normal) {
    if (uHasDirectionalLight) return normalize(-uDirectionalDirection);
    if (uPointLightCount > 0) return normalize(uPointLightPositions[0] - worldPosition);
    if (uSpotLightCount > 0) return normalize(uSpotLightPositions[0] - worldPosition);
    return normal;
}

// Color and intensity of that light at the point (shadowed, attenuated).
vec3 gfKeyLightColor(vec3 worldPosition, vec4 shadowCoord) {
    if (uHasDirectionalLight) return uDirectionalColor * uDirectionalIntensity * readShadow(shadowCoord);
    if (uPointLightCount > 0) {
        float fade = clamp(1.0 - length(uPointLightPositions[0] - worldPosition) / uPointLightRanges[0], 0.0, 1.0);
        return uPointLightColors[0] * uPointLightIntensities[0] * fade * fade;
    }
    if (uSpotLightCount > 0) {
        float fade = clamp(1.0 - length(uSpotLightPositions[0] - worldPosition) / uSpotLightRanges[0], 0.0, 1.0);
        return uSpotLightColors[0] * uSpotLightIntensities[0] * fade * fade;
    }
    return vec3(0.0);
}
