const assert = require("node:assert/strict");

global.window ??= { AudioContext: null, webkitAudioContext: null };

const closeTo = (actual, expected, epsilon = 0.00001) => {
    assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} is not close to ${expected}`);
};

const arrayCloseTo = (actual, expected, epsilon = 0.00001) => {
    assert.equal(actual.length, expected.length);
    expected.forEach((value, index) => closeTo(actual[index], value, epsilon));
};

async function main() {
    const { JsonManifestComposer } = await import("../src/CoreCross/Assets/JsonManifestComposer.js");
    const { Mat4 } = await import("../src/CoreCross/Math/Mat4.js");
    const { ModelLoader } = await import("../src/Core3D/Assets/ModelLoader.js");
    const { OBJLoader } = await import("../src/Core3D/Assets/OBJLoader.js");
    const { Geometry3D } = await import("../src/Core3D/Render3D/Mesh/Geometry3D.js");
    const { Transform3D } = await import("../src/Core3D/Render3D/Core/Transform3D.js");
    const { Vector2D } = await import("../src/CoreCross/Math/Vector2D.js");
    const { Vector3D } = await import("../src/CoreCross/Math/Vector3D.js");
    const { Vector4D } = await import("../src/CoreCross/Math/Vector4D.js");

    const vector2 = Vector2D.FromArray([3, 4]);
    assert.equal(vector2.Length(), 5);
    assert.deepEqual(vector2.Add({ x: 2, y: -1 }).ToArray(), [5, 3]);

    const vector3 = new Vector3D(1, 2, 3);
    assert.deepEqual(vector3.Cross({ x: 4, y: 5, z: 6 }).ToArray(), [-3, 6, -3]);
    assert.equal(vector3.Dot({ x: 4, y: 5, z: 6 }), 32);

    const vector4 = Vector4D.FromObject({ 0: 1, 1: 2, 2: 3, 3: 4 });
    assert.deepEqual(vector4.ToArray(), [1, 2, 3, 4]);

    const parent = new Transform3D({ position: [10, 0, 0] });
    const child = new Transform3D({ position: [2, 0, 0], parent });
    const childMatrix = child.GetMatrix();
    arrayCloseTo([childMatrix[12], childMatrix[13], childMatrix[14]], [12, 0, 0]);

    const rotated = Mat4.fromRotationTranslationScale(
        Mat4.create(),
        [0, 0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)],
        [4, 5, 6],
        [2, 3, 4]
    );
    arrayCloseTo([rotated[12], rotated[13], rotated[14]], [4, 5, 6]);

    const interleavedBuffer = new ArrayBuffer(28);
    const interleavedView = new DataView(interleavedBuffer);
    [1, 2, 3, 4, 5, 6].forEach((value, index) => {
        const offset = index < 3 ? index * 4 : 16 + (index - 3) * 4;
        interleavedView.setFloat32(offset, value, true);
    });
    const interleaved = ModelLoader.ReadAccessor({
        accessors: [{ bufferView: 0, componentType: 5126, count: 2, type: "VEC3" }],
        bufferViews: [{ buffer: 0, byteLength: 28, byteStride: 16 }],
    }, [interleavedBuffer], 0);
    arrayCloseTo(interleaved, [1, 2, 3, 4, 5, 6]);

    const normalizedBuffer = Uint8Array.from([0, 255, 128, 64]).buffer;
    const normalized = ModelLoader.ReadAccessor({
        accessors: [{ bufferView: 0, componentType: 5121, count: 1, normalized: true, type: "VEC4" }],
        bufferViews: [{ buffer: 0, byteLength: 4 }],
    }, [normalizedBuffer], 0);
    arrayCloseTo(normalized, [0, 1, 128 / 255, 64 / 255]);

    const sparseBuffer = new ArrayBuffer(8);
    const sparseView = new DataView(sparseBuffer);
    sparseView.setUint8(0, 1);
    sparseView.setFloat32(4, 42, true);
    const sparse = ModelLoader.ReadAccessor({
        accessors: [{
            componentType: 5126,
            count: 3,
            sparse: {
                count: 1,
                indices: { bufferView: 0, componentType: 5121 },
                values: { bufferView: 1 },
            },
            type: "SCALAR",
        }],
        bufferViews: [
            { buffer: 0, byteLength: 1 },
            { buffer: 0, byteOffset: 4, byteLength: 4 },
        ],
    }, [sparseBuffer], 0);
    arrayCloseTo(sparse, [0, 42, 0]);

    const positionBuffer = new Float32Array([0, 0, 0]).buffer;
    const parsedModel = await ModelLoader.Parse({
        accessors: [{ bufferView: 0, componentType: 5126, count: 1, type: "VEC3" }],
        bufferViews: [{ buffer: 0, byteLength: 12 }],
        meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
        nodes: [
            { children: [1], translation: [10, 0, 0] },
            { mesh: 0, translation: [2, 0, 0] },
        ],
        scenes: [{ nodes: [0] }],
        scene: 0,
    }, [positionBuffer]);
    assert.equal(parsedModel.length, 1);
    arrayCloseTo(
        [parsedModel[0].node.worldMatrix[12], parsedModel[0].node.worldMatrix[13], parsedModel[0].node.worldMatrix[14]],
        [12, 0, 0]
    );

    const largeIndices = new Array(100_000).fill(0).map((_, index) => index % 70_000);
    const largeGeometry = new Geometry3D({ positions: [0, 0, 0], indices: largeIndices });
    assert.ok(largeGeometry.indices instanceof Uint32Array);

    const previousFetch = global.fetch;
    global.fetch = async () => ({
        ok: true,
        text: async () => [
            "v 0 0 0",
            "v 1 0 0",
            "v 1 1 0",
            "v 0 1 0",
            "vt 0 0",
            "vt 1 0",
            "vt 1 1",
            "vt 0 1",
            "vn 0 0 1",
            "f -4/-4/-1 -3/-3/-1 -2/-2/-1 -1/-1/-1",
        ].join("\n"),
    });
    try {
        const [objPart] = await OBJLoader.Load("quad.obj");
        assert.equal(objPart.positions.length, 12);
        assert.deepEqual([...objPart.indices], [0, 1, 2, 0, 2, 3]);
        assert.equal(objPart.uvs.length, 8);
        assert.equal(objPart.normals.length, 12);
    } finally {
        global.fetch = previousFetch;
    }

    const manifests = {
        base: { settings: { gravity: 9.8 }, assets: ["base"], nested: { keep: true } },
        child: { compose: ["base"], settings: { spawn: "snow" }, assets: ["child"] },
    };
    const fakeAssets = { GetJson: name => manifests[name] };
    const composed = JsonManifestComposer.Compose("child", fakeAssets);
    assert.deepEqual(composed.settings, { spawn: "snow", gravity: 9.8 });
    assert.deepEqual(composed.assets, ["base"]);
    composed.settings.spawn = "changed";
    assert.equal(manifests.child.settings.spawn, "snow");

    const lazyAssets = {
        GetJson: () => undefined,
        GetJsonAsync: async name => ({
            base: { settings: { gravity: 9.8 } },
            child: { compose: ["base"], settings: { spawn: "snow" } },
        }[name]),
    };
    const asyncComposed = await JsonManifestComposer.ComposeAsync("child", lazyAssets);
    assert.deepEqual(asyncComposed.settings, { spawn: "snow", gravity: 9.8 });

    manifests.loop = { compose: ["child"] };
    manifests.child.compose = ["loop"];
    assert.throws(() => JsonManifestComposer.Compose("child", fakeAssets), /dependency cycle/);

    console.log("Runtime checks passed: vectors, transforms, accessors, model hierarchy, and manifest composition.");
}

main().catch(error => {
    console.error("Runtime check failed:");
    console.error(error);
    process.exitCode = 1;
});
