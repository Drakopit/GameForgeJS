#version 300 es
precision highp float;

uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
vec3 applyFog(vec3 color, float distanceToCamera) {
    float amount = uFogFar > uFogNear ? clamp((distanceToCamera - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0) : 0.0;
    return mix(color, uFogColor, amount);
}

#define MAX_POINT_LIGHTS 4
#define MAX_SPOT_LIGHTS 2

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUv;
in mat3 vTbn;
in vec4 vShadowCoord;

out vec4 outColor;
uniform bool uReflectionClip;
uniform float uReflectionClipHeight;

uniform vec3 uCameraPosition;
uniform vec4 uAlbedoColor;
uniform vec3 uEmissiveColor;
uniform vec2 uUvScale;
uniform float uNormalScale;
uniform float uHeightScale;
uniform float uRoughness;
uniform float uMetallic;
uniform float uToonBands;

uniform float uSurface;
uniform float uSurfaceTime;
uniform float uSurfaceScale;
uniform float uWetness;
uniform float uReflection;
uniform float uWaterDepth;
uniform bool uHasPlanarReflection;
uniform mat4 uPlanarMatrix;
uniform sampler2D uPlanarMap;
uniform int uRippleCount;
uniform vec4 uRipples[8];

float surfaceHash(vec2 cell) {
    vec3 value = fract(vec3(cell.xyx) * 0.1031);
    value += dot(value, value.yzx + 33.33);
    return fract((value.x + value.y) * value.z);
}
float surfaceNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(surfaceHash(i), surfaceHash(i + vec2(1, 0)), f.x),
               mix(surfaceHash(i + vec2(0, 1)), surfaceHash(i + vec2(1, 1)), f.x), f.y);
}
void applySurface(inout vec3 color, inout vec3 normal, inout float roughness) {
    if(uSurface<0.5)return;
    vec2 p=vWorldPosition.xz*uSurfaceScale;
    float detail=surfaceNoise(p);
    if(uSurface<1.5) {
        float t=uSurfaceTime;
        vec2 slope = vec2(0.8,0.6) * cos(dot(p,vec2(1.7,1.3))-t*1.5)*0.055;
        slope += vec2(-0.4,0.9) * cos(dot(p,vec2(-1.3,3.2))-t*2.2)*0.04;
        slope += vec2(0.97,-0.24) * cos(dot(p,vec2(8.7,-2.15))-t*3.3)*0.018;
        for(int i=0;i<8;i++) {
            if(i>=uRippleCount)break;
            vec2 delta=vWorldPosition.xz-uRipples[i].xy;
            float radius=length(delta),age=uRipples[i].z;
            float envelope = (radius - age * 1.05) * 7.0;
            float ring = exp(-envelope * envelope - age * 2.1) * uRipples[i].w;
            slope += delta / max(radius, 0.01) * ring * cos(radius * 34.0 - age * 26.0);
        }
        normal=normalize(normal+vec3(slope.x,0.0,slope.y));
        color*=0.96+0.04*sin(p.x*1.4+p.y*1.8+t);
        vec2 bank = min(vUv, 1.0 - vUv);
        float depth = uWaterDepth * smoothstep(0.0, 0.09, min(bank.x, bank.y));
        color *= exp(-depth * vec3(1.9, 0.86, 0.53));
    } else if(uSurface>3.5) {
        vec2 grainPosition = p + vWorldPosition.y * vec2(0.58, 0.17);
        float band = grainPosition.x * 16.0 + surfaceNoise(grainPosition * vec2(2.0, 0.42)) * 7.0;
        float grain = sin(band) * 0.72 + sin(band * 2.1) * 0.28;
        color*=0.82+grain*0.13;
        normal=normalize(normal+vec3(grain*0.025,0.0,detail*0.025));
    } else if(uSurface>2.5) {
        float grit = surfaceNoise(p * 35.0 + vWorldPosition.y * 12.0);
        color *= 0.60 + detail * 0.37 + grit * 0.24;
        normal=normalize(normal+vec3(detail*0.09,0.0,surfaceNoise(p+0.2)*0.09));
    }
    color*=1.0-uWetness*0.22;
    roughness=mix(roughness,0.1,uWetness*0.75);
}
vec3 surfaceReflection(vec3 normal,vec3 viewDirection,vec3 color,float roughness,float metallic) {
    if(uReflection<=0.0)return vec3(0.0);
    vec3 reflected=reflect(-viewDirection,normal);
    vec3 environment=mix(vec3(0.08,0.11,0.12),vec3(0.53,0.69,0.8),smoothstep(-0.25,0.8,reflected.y));
    float horizon=pow(max(0.0, 1.0-abs(reflected.y)),8.0);
    environment+=vec3(0.22,0.18,0.12)*horizon;
    if (uHasPlanarReflection) {
        vec4 projected = uPlanarMatrix * vec4(vWorldPosition, 1.0);
        vec2 uv = projected.xy / projected.w * 0.5 + 0.5 + normal.xz * 0.11;
        vec2 edge = smoothstep(vec2(0.0), vec2(0.06), uv)
                  * smoothstep(vec2(0.0), vec2(0.06), 1.0 - uv);
        environment = mix(environment, texture(uPlanarMap, uv).rgb, edge.x * edge.y);
    }
    vec3 f0=mix(vec3(0.04),color,metallic);
    vec3 fresnel=f0+(1.0-f0)*pow(1.0-clamp(dot(normal,viewDirection),0.0,1.0),5.0);
    return environment*fresnel*uReflection*(1.0-roughness*0.75);
}


uniform sampler2D uAlbedoMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uAoMap;
uniform sampler2D uOrmMap;
uniform sampler2D uHeightMap;
uniform sampler2D uEmissiveMap;
uniform sampler2D uShadowMap;

uniform bool uHasAlbedoMap;
uniform bool uHasNormalMap;
uniform bool uHasRoughnessMap;
uniform bool uHasAoMap;
uniform bool uHasOrmMap;
uniform bool uHasHeightMap;
uniform bool uHasEmissiveMap;
uniform bool uUseShadowMap;

uniform vec3 uAmbientColor;
uniform float uAmbientIntensity;
uniform vec3 uHemisphereSkyColor;
uniform vec3 uHemisphereGroundColor;
uniform float uHemisphereIntensity;

uniform bool uHasDirectionalLight;
uniform vec3 uDirectionalDirection;
uniform vec3 uDirectionalColor;
uniform float uDirectionalIntensity;
uniform float uShadowBias;
uniform float uShadowStrength;

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

float readShadow() {
    if (!uUseShadowMap) {
        return 1.0;
    }

    vec3 projection = vShadowCoord.xyz / vShadowCoord.w;
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

vec2 parallaxUv(vec2 uv, vec3 tangentViewDirection) {
    if (!uHasHeightMap || uHeightScale <= 0.0) {
        return uv;
    }

    const int layers = 10;
    float layerDepth = 1.0 / float(layers);
    float viewDepth = max(abs(tangentViewDirection.z), 0.22);
    vec2 deltaUv = tangentViewDirection.xy / viewDepth * uHeightScale / float(layers);
    vec2 mappedUv = uv;
    float currentDepth = 0.0;
    float mappedHeight = texture(uHeightMap, mappedUv).r;

    for (int layer = 0; layer < layers; layer++) {
        if (currentDepth >= mappedHeight) {
            break;
        }

        mappedUv -= deltaUv;
        currentDepth += layerDepth;
        mappedHeight = texture(uHeightMap, mappedUv).r;
    }

    return mappedUv;
}

void main() {
    if (uReflectionClip && vWorldPosition.y < uReflectionClipHeight) discard;
    vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
    vec3 tangentViewDirection = normalize(transpose(vTbn) * viewDirection);
    vec2 surfaceUv = parallaxUv(vUv * uUvScale, tangentViewDirection);
    vec4 albedoSample = uHasAlbedoMap ? texture(uAlbedoMap, surfaceUv) : vec4(1.0);
    vec4 baseColor = uAlbedoColor * albedoSample;

    vec3 normal = normalize(vNormal);
    if (uHasNormalMap) {
        vec3 mapNormal = texture(uNormalMap, surfaceUv).xyz * 2.0 - 1.0;
        mapNormal.xy *= uNormalScale;
        normal = normalize(vTbn * mapNormal);
    }

    vec3 orm = uHasOrmMap ? texture(uOrmMap, surfaceUv).rgb : vec3(1.0, 1.0, uMetallic);
    float roughness = clamp(uRoughness, 0.02, 1.0);
    if (uHasRoughnessMap) {
        roughness *= texture(uRoughnessMap, surfaceUv).r;
    } else if (uHasOrmMap) {
        roughness *= orm.g;
    }

    float metallic = uHasOrmMap ? orm.b : uMetallic;
    applySurface(baseColor.rgb,normal,roughness);
    float ao = uHasAoMap ? texture(uAoMap, surfaceUv).r : (uHasOrmMap ? orm.r : 1.0);
    vec3 litColor = baseColor.rgb * uAmbientColor * uAmbientIntensity * ao;

    float hemiMix = normal.y * 0.5 + 0.5;
    vec3 hemisphere = mix(uHemisphereGroundColor, uHemisphereSkyColor, hemiMix);
    litColor += baseColor.rgb * hemisphere * uHemisphereIntensity * ao;

    if (uHasDirectionalLight) {
        vec3 lightDirection = normalize(-uDirectionalDirection);
        litColor += applyLight(
            lightDirection,
            uDirectionalColor,
            uDirectionalIntensity * readShadow(),
            normal,
            viewDirection,
            baseColor.rgb,
            roughness,
            metallic
        );
    }

    for (int i = 0; i < MAX_POINT_LIGHTS; i++) {
        if (i >= uPointLightCount) break;
        vec3 toLight = uPointLightPositions[i] - vWorldPosition;
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
            baseColor.rgb,
            roughness,
            metallic
        );
    }

    for (int i = 0; i < MAX_SPOT_LIGHTS; i++) {
        if (i >= uSpotLightCount) break;
        vec3 toLight = uSpotLightPositions[i] - vWorldPosition;
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
            baseColor.rgb,
            roughness,
            metallic
        );
    }

    litColor += surfaceReflection(normal,viewDirection,baseColor.rgb,roughness,metallic);
    vec3 emissive = uEmissiveColor;
    if (uHasEmissiveMap) {
        emissive += texture(uEmissiveMap, surfaceUv).rgb;
    }

    outColor = vec4(applyFog(litColor + emissive, length(uCameraPosition - vWorldPosition)), baseColor.a);
}
