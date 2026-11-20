/** Shared opt-in surface functions, compiled into the native Standard pipeline. */
export const SURFACE_SHADER = `
uniform float uSurface;
uniform float uSurfaceTime;
uniform float uSurfaceScale;
uniform float uWetness;
uniform float uReflection;
uniform int uRippleCount;
uniform vec4 uRipples[8];

float surfaceNoise(vec2 p) {
    return sin(p.x*3.1+sin(p.y*2.7))*sin(p.y*4.3+sin(p.x*1.7));
}
void applySurface(inout vec3 color, inout vec3 normal, inout float roughness) {
    if(uSurface<0.5)return;
    vec2 p=vWorldPosition.xz*uSurfaceScale;
    float detail=surfaceNoise(p);
    if(uSurface<1.5) {
        float t=uSurfaceTime;
        vec2 slope=vec2(cos(p.x*2.1+t)*0.09, sin(p.y*2.7-t*0.7)*0.09);
        for(int i=0;i<8;i++) {
            if(i>=uRippleCount)break;
            vec2 delta=vWorldPosition.xz-uRipples[i].xy;
            float radius=length(delta),age=uRipples[i].z;
            float ring=exp(-pow((radius-age*2.4)*3.0,2.0))*(1.0-age/3.0)*uRipples[i].w;
            slope+=delta/max(radius,0.01)*ring*cos(radius*18.0-age*15.0);
        }
        normal=normalize(normal+vec3(slope.x,0.0,slope.y));
        color*=0.92+0.08*sin(p.x*1.4+p.y*1.8+t);
    } else if(uSurface>3.5) {
        float grain=sin(p.x*17.0+sin(p.y*0.6)*3.0+detail*0.7);
        color*=0.82+grain*0.13;
        normal=normalize(normal+vec3(grain*0.025,0.0,detail*0.025));
    } else if(uSurface>2.5) {
        color*=0.88+detail*0.1;
        normal=normalize(normal+vec3(detail*0.09,0.0,surfaceNoise(p+0.2)*0.09));
    }
    color*=1.0-uWetness*0.22;
    roughness=mix(roughness,0.1,uWetness*0.75);
}
vec3 surfaceReflection(vec3 normal,vec3 viewDirection,vec3 color,float roughness,float metallic) {
    if(uReflection<=0.0)return vec3(0.0);
    vec3 reflected=reflect(-viewDirection,normal);
    vec3 environment=mix(vec3(0.08,0.11,0.12),vec3(0.53,0.69,0.8),smoothstep(-0.25,0.8,reflected.y));
    float horizon=pow(1.0-abs(reflected.y),8.0);
    environment+=vec3(0.22,0.18,0.12)*horizon;
    vec3 f0=mix(vec3(0.04),color,metallic);
    vec3 fresnel=f0+(1.0-f0)*pow(1.0-max(dot(normal,viewDirection),0.0),5.0);
    return environment*fresnel*uReflection*(1.0-roughness*0.75);
}
`;
