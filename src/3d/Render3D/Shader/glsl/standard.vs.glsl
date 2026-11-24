#version 300 es
precision highp float;

#include <gf_vertex>

void main() {
    gfEmitVertex(aPosition, aNormal, aTangent, aUv);
}
