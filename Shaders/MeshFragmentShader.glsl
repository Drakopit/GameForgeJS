
precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uSampler;
uniform vec3 uLightDir;    // Direção da luz (normalizada)
uniform vec4 uBaseColor;   // Cor fallback se não houver textura
uniform float uHasTexture; // 1.0 = tem textura, 0.0 = usa cor

void main() {
    vec3  lightDir  = normalize(uLightDir);
    float diffuse   = max(dot(vNormal, lightDir), 0.0);
    float ambient   = 0.3;
    float light     = ambient + diffuse * 0.7;

    vec4 color = (uHasTexture > 0.5)
        ? texture2D(uSampler, vTexCoord)
        : uBaseColor;

    gl_FragColor = vec4(color.rgb * light, color.a);
}