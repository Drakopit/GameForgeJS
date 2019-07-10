export class Shader {
    constructor(screen) {
        this.screen = screen;
        this.vertexShader = null;
        this.FragmentShader = null;
    }

    Init() {
        this.vertexShader = document.createElement("script");
        this.vertexShader.type = `x-shader/x-vertex`;
        document.head.appendChild(this.vertexShader);
        this.FragmentShader = document.createElement("script");
        this.FragmentShader.type = `x-shader/x-fragment`;
        document.head.appendChild(this.FragmentShader);

    }

    Load(vertex, fragment) {
        if (this.vertexShader && this.FragmentShader) {
            this.vertexShader.src = vertex;
            this.FragmentShader.src = fragment;
        }
        else
            throw 'O shader precisa ser inicializado!';
    }

    Attach(vertex, fragment) {
        if (this.vertexShader && this.FragmentShader) {
            this.vertexShader.innerText = vertex;
            this.FragmentShader.innerText = fragment;
        }
        else
            throw 'O shader precisa ser inicializado!';
    }

    Create(vertex, fragment) {
        let shader = this.screen.Canvas.createProgram();
        this.screen.Canvas.attachShader(shader, vertex);
        this.screen.Canvas.attachShader(shader, fragment);
        this.screen.Canvas.linkProgram(shader);

        if (!this.screen.Canvas.getProgramParameter(shader, this.screen.Canvas.LINK_STATUS)) {
            let error = this.screen.Canvas.getProgramInfoLog(shader);
            this.screen.Canvas.deleteProgram(shader);
            this.screen.Canvas.deleteShader(fragment);
            this.screen.Canvas.deleteShader(vertex);
            throw `Erro ao criar shader: ${error}`;            
        }
        
        this.screen.Canvas.validateProgram(shader);
        if (!this.screen.Canvas.getProgramParameter(shader, this.screen.Canvas.VALIDATE_STATUS)) {
            let error = this.screen.Canvas.getProgramInfoLog(shader);
            this.screen.Canvas.deleteProgram(shader);
            this.screen.Canvas.deleteShader(fragmentShader);
            this.screen.Canvas.deleteShader(vertexShader);
            throw `Erro ao criar shader: ${error}`;            
        }
    }

    Vertex() {
        // Vertex Shader
        var vertex = this.screen.Canvas.createShader(this.screen.Canvas.VERTEX_SHADER);
        this.screen.Canvas.shaderSource(vertex, this.vertexShader);
        this.screen.Canvas.compileShader(vertex);
        
        if (!this.screen.Canvas.getShaderParameter(vertex, this.screen.Canvas.COMPILE_STATUS)) {
          console.log("Um erro ocorreu na compilação dos shaders:" + this.screen.Canvas.getShaderInfoLog(vertex));
          this.screen.Canvas.deleteShader(vertex);
          return null;
        }
        return vertex;
    }

    Fragment() {
        // Vertex Shader
        var fragment = this.screen.Canvas.createShader(this.screen.Canvas.FRAGMENT_SHADER);
        this.screen.Canvas.shaderSource(fragment, this.FragmentShader);
        this.screen.Canvas.compileShader(fragment);
        
        if (!this.screen.Canvas.getShaderParameter(fragment, this.screen.Canvas.COMPILE_STATUS)) {
          console.log("Um erro ocorreu na compilação dos shaders:" + this.screen.Canvas.getShaderInfoLog(fragment));
          this.screen.Canvas.deleteShader(fragment);
          return null;
        }
        return fragment;
    }

    Use(shader) {
        this.screen.Canvas.useProgram(shader);
    }
}

// var VSHADER_SOURCE =
// 'void main() {\n' +
// '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the vertex coordinates of the point
// '  gl_PointSize = 30.0;\n' +                    // Set the point size
// '}\n';

// var FSHADER_SOURCE =
// 'void main() {\n' +
// '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
// '}\n';

// var teste = new Shader(new Screen3D());
// teste.Init();
// teste.Attach(VSHADER_SOURCE, FSHADER_SOURCE);
// var VertexShader = teste.Vertex();
// var FragmentShader = teste.Fragment();
// var shader = teste.Create(VertexShader, FragmentShader);
// teste.Use(shader);