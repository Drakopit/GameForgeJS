#version 300 es
precision highp float;

#include <gf_fragment>
#include <gf_fog>
#include <gf_lights>
#include <gf_normal>

uniform vec4 uAlbedoColor;
uniform vec3 uEmissiveColor;
uniform vec2 uUvScale;
uniform float uNormalScale;
uniform float uHeightScale;
uniform float uRoughness;
uniform float uMetallic;

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

uniform bool uHasAlbedoMap;
uniform bool uHasNormalMap;
uniform bool uHasRoughnessMap;
uniform bool uHasAoMap;
uniform bool uHasOrmMap;
uniform bool uHasHeightMap;
uniform bool uHasEmissiveMap;

void main() {
    gfClipReflection();
    vec3 viewDirection = gfViewDirection();
    vec3 tangentViewDirection = normalize(transpose(vTbn) * viewDirection);
    vec2 surfaceUv = uHasHeightMap ? gfParallaxUv(uHeightMap, vUv * uUvScale, tangentViewDirection, uHeightScale) : vUv * uUvScale;
    vec4 albedoSample = uHasAlbedoMap ? texture(uAlbedoMap, surfaceUv) : vec4(1.0);
    vec4 baseColor = uAlbedoColor * albedoSample;

    vec3 normal = normalize(vNormal);
    if (uHasNormalMap) {
        normal = gfPerturbNormal(vTbn, texture(uNormalMap, surfaceUv).xyz, uNormalScale);
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
    vec3 litColor = gfLighting(vWorldPosition, vShadowCoord, normal, viewDirection, baseColor.rgb, roughness, metallic, ao);

    litColor += surfaceReflection(normal,viewDirection,baseColor.rgb,roughness,metallic);
    vec3 emissive = uEmissiveColor;
    if (uHasEmissiveMap) {
        emissive += texture(uEmissiveMap, surfaceUv).rgb;
    }

    outColor = vec4(applyFog(litColor + emissive, length(uCameraPosition - vWorldPosition)), baseColor.a);
}
