const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test('BeveledCube and Ring triangle winding agrees with their outward normals', async () => {
    const { PrimitiveMesh } = await import(pathToFileURL(path.resolve('src/3d/Render3D/Mesh/PrimitiveMesh.js')));
    for (const geometry of [PrimitiveMesh.BeveledCube(0.075), PrimitiveMesh.Ring(0.6, 0.72)]) {
        for (let i = 0; i < geometry.indices.length; i += 3) {
            const [a,b,c] = Array.from(geometry.indices.slice(i, i+3), value => value * 3);
            const u = [0,1,2].map(axis=>geometry.positions[b+axis]-geometry.positions[a+axis]);
            const v = [0,1,2].map(axis=>geometry.positions[c+axis]-geometry.positions[a+axis]);
            const cross = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
            const alignment = cross.reduce((sum,value,axis)=>sum+value*geometry.normals[a+axis],0);
            assert.ok(alignment > 0, `Triangle ${i/3} is degenerate or back-facing`);
        }
    }
});
