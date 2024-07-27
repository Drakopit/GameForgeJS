/**
 * @doc Class Shapes3D
 * @namespace Graphic
 * @class Shapes3D
 * @author Patrick Faustino Camello
 * @summary Provides methods to render basic 3D shapes using WebGL.
 * @Date 15/05/2019
 * @example
 *  var shapes = new Shapes3D(screen);
 *  shapes.DrawCube();
 *  shapes.DrawSphere();
 * @returns {Object}
 */
export class Shapes3D {
    constructor(screen) {
        this.gl = screen.Context;
        this.screen = screen;

        // Initialize WebGL shaders and buffers
        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        // Vertex Shader
        const vsSource = `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;

        // Fragment Shader
        const fsSource = `
            void main(void) {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
            }
        `;

        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, vsSource);
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, fsSource);
        this.gl.compileShader(fragmentShader);

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program.');
        }

        this.gl.useProgram(this.shaderProgram);

        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

        this.shaderProgram.modelViewMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix');
        this.shaderProgram.projectionMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix');
    }

    initBuffers() {
        // Create a buffer for the cube's vertices
        this.cubeVertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);

        const vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.cubeVertexPositionBuffer.itemSize = 3;
        this.cubeVertexPositionBuffer.numItems = 8;
    }

    DrawCube() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cubeVertexPositionBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.cubeVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, 45, this.screen.Width() / this.screen.Height(), 0.1, 100.0);

        this.gl.uniformMatrix4fv(this.shaderProgram.modelViewMatrixUniform, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(this.shaderProgram.projectionMatrixUniform, false, projectionMatrix);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.cubeVertexPositionBuffer.numItems);
    }

    // Additional methods for spheres and cylinders would be similar
}
