// Lit surface model for graph and hand-written ShaderMaterials: fill a GFSurface, then gfWriteSurface().
// Base lighting is gfLighting() (the same as StandardMaterial); clearcoat, subsurface and rim are added on top.
#include <gf_fragment>
#include <gf_fog>
#include <gf_lights>
#include <gf_normal>

struct GFSurface {
    vec3 albedo;
    float alpha;
    vec3 normal;              // world space, normalized
    float metallic;
    float roughness;
    float ao;
    vec3 emissive;
    float clearcoat;          // 0..1 strength of a second, glossy specular layer
    float clearcoatRoughness;
    float subsurface;         // 0..1 approximate light bleeding through thin or soft material
    vec3 subsurfaceColor;
    float rim;                // 0..1 view-dependent edge light
    vec3 rimColor;
    float rimPower;
};

// White, opaque, dielectric, the interpolated geometric normal, nothing extra.
GFSurface gfDefaultSurface() {
    GFSurface s;
    s.albedo = vec3(1.0);
    s.alpha = 1.0;
    s.normal = normalize(vNormal);
    s.metallic = 0.0;
    s.roughness = 0.72;
    s.ao = 1.0;
    s.emissive = vec3(0.0);
    s.clearcoat = 0.0;
    s.clearcoatRoughness = 0.08;
    s.subsurface = 0.0;
    s.subsurfaceColor = vec3(1.0, 0.35, 0.25);
    s.rim = 0.0;
    s.rimColor = vec3(1.0);
    s.rimPower = 3.0;
    return s;
}

// Lit color of a surface (before fog).
vec3 gfShade(GFSurface s) {
    vec3 normal = normalize(s.normal);
    vec3 viewDirection = gfViewDirection();
    float roughness = clamp(s.roughness, 0.02, 1.0);
    vec3 color = gfLighting(vWorldPosition, vShadowCoord, normal, viewDirection, s.albedo, roughness, s.metallic, s.ao);

    if (s.subsurface > 0.0 || s.clearcoat > 0.0) {
        vec3 keyDirection = gfKeyLightDirection(vWorldPosition, normal);
        vec3 keyColor = gfKeyLightColor(vWorldPosition, vShadowCoord);
        float nDotL = dot(normal, keyDirection);
        if (s.subsurface > 0.0) {
            // Wrapped diffuse beyond the terminator plus light scattered through towards the viewer.
            float wrap = max((nDotL + 0.5) / 1.5, 0.0) - max(nDotL, 0.0);
            float through = pow(clamp(dot(viewDirection, -keyDirection + normal * 0.3), 0.0, 1.0), 4.0) * 0.5;
            color += s.subsurfaceColor * s.albedo * keyColor * (wrap + through) * s.subsurface;
        }
        if (s.clearcoat > 0.0) {
            vec3 halfVector = normalize(keyDirection + viewDirection);
            float coatPower = mix(256.0, 16.0, clamp(s.clearcoatRoughness, 0.0, 1.0));
            float fresnel = 0.04 + 0.96 * pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), 5.0);
            float coat = pow(max(dot(normal, halfVector), 0.0), coatPower) * max(nDotL, 0.0);
            color = color * (1.0 - fresnel * s.clearcoat) + keyColor * coat * fresnel * s.clearcoat * 4.0;
        }
    }
    if (s.rim > 0.0) {
        color += s.rimColor * pow(1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), max(s.rimPower, 0.5)) * s.rim;
    }
    return color + s.emissive;
}

// Shades, fogs and writes the fragment.
void gfWriteSurface(GFSurface s) {
    outColor = vec4(applyFog(gfShade(s), length(uCameraPosition - vWorldPosition)), s.alpha);
}
