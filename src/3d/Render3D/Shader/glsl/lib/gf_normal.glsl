// Tangent-space normal mapping, parallax occlusion and triplanar sampling.

// A normal-map texel (0..1) to a world-space normal through the TBN basis; scale bends x/y.
vec3 gfPerturbNormal(mat3 tbn, vec3 mapTexel, float scale) {
    vec3 mapNormal = mapTexel * 2.0 - 1.0;
    mapNormal.xy *= scale;
    return normalize(tbn * mapNormal);
}

// Blends two tangent-space normals (both -1..1), detail on top of base (Reoriented Normal Mapping).
vec3 gfBlendNormals(vec3 base, vec3 detail) {
    vec3 t = base + vec3(0.0, 0.0, 1.0);
    vec3 u = detail * vec3(-1.0, -1.0, 1.0);
    return normalize(t * dot(t, u) / t.z - u);
}

// Steep parallax: walks a height map (red channel, 1 = surface) along the tangent-space view ray.
vec2 gfParallaxUv(sampler2D heightMap, vec2 uv, vec3 tangentViewDirection, float heightScale) {
    if (heightScale <= 0.0) {
        return uv;
    }

    const int layers = 10;
    float layerDepth = 1.0 / float(layers);
    float viewDepth = max(abs(tangentViewDirection.z), 0.22);
    vec2 deltaUv = tangentViewDirection.xy / viewDepth * heightScale / float(layers);
    vec2 mappedUv = uv;
    float currentDepth = 0.0;
    float mappedHeight = texture(heightMap, mappedUv).r;

    for (int layer = 0; layer < layers; layer++) {
        if (currentDepth >= mappedHeight) {
            break;
        }

        mappedUv -= deltaUv;
        currentDepth += layerDepth;
        mappedHeight = texture(heightMap, mappedUv).r;
    }

    return mappedUv;
}

// Blend weights of the three world axes for a normal; higher sharpness = harder seams.
vec3 gfTriplanarWeights(vec3 normal, float sharpness) {
    vec3 weights = pow(abs(normal), vec3(max(sharpness, 1.0)));
    return weights / max(weights.x + weights.y + weights.z, 0.0001);
}

// Samples a texture projected along X, Y and Z in world space, blended by the normal.
vec4 gfTriplanar(sampler2D map, vec3 worldPosition, vec3 normal, float scale, float sharpness) {
    vec3 weights = gfTriplanarWeights(normal, sharpness);
    vec3 p = worldPosition * scale;
    return texture(map, p.zy) * weights.x + texture(map, p.xz) * weights.y + texture(map, p.xy) * weights.z;
}

// Triplanar normal map in world space (Whiteout blend per axis).
vec3 gfTriplanarNormal(sampler2D map, vec3 worldPosition, vec3 normal, float scale, float sharpness, float strength) {
    vec3 weights = gfTriplanarWeights(normal, sharpness);
    vec3 p = worldPosition * scale;
    vec3 nx = texture(map, p.zy).xyz * 2.0 - 1.0;
    vec3 ny = texture(map, p.xz).xyz * 2.0 - 1.0;
    vec3 nz = texture(map, p.xy).xyz * 2.0 - 1.0;
    nx.xy *= strength; ny.xy *= strength; nz.xy *= strength;
    nx = vec3(nx.xy + normal.zy, abs(nx.z) * normal.x);
    ny = vec3(ny.xy + normal.xz, abs(ny.z) * normal.y);
    nz = vec3(nz.xy + normal.xy, abs(nz.z) * normal.z);
    return normalize(nx.zyx * weights.x + ny.xzy * weights.y + nz.xyz * weights.z);
}
