# GameForgeJS

## Overview

Welcome to **GameForgeJS**, a powerful and lightweight JavaScript framework for creating browser-based games! This guide will walk you through the essentials of using our framework to develop your own games.

Originally built for 2D Canvas rendering, GameForgeJS has evolved into a **Hybrid 2D/3D Engine**, fully supporting WebGL for 3D environments, custom GLSL Shaders, Skyboxes, and an overlaid 2D HUD system. The framework is built strictly with pure JavaScript (ES6 Modules), ensuring high performance without heavy third-party dependencies.

## Table of Contents

1. [Getting Started](https://www.google.com/search?q=%23getting-started)
2. [Project Structure](https://www.google.com/search?q=%23project-structure)
3. [Setup and Installation](https://www.google.com/search?q=%23setup-and-installation)
4. [Usage & Architecture](https://www.google.com/search?q=%23usage--architecture)
5. [Key Features](https://www.google.com/search?q=%23key-features)
6. [Examples](https://www.google.com/search?q=%23examples)
7. [Contributing](https://www.google.com/search?q=%23contributing)
8. [License](https://www.google.com/search?q=%23license)
9. [Contact](https://www.google.com/search?q=%23contact)

## Getting Started

To get started with GameForgeJS, you will need a basic understanding of JavaScript (ES6 Classes, Modules, and Promises), HTML, and CSS. This guide will walk you through the setup process, the new lifecycle hooks, and key features of the framework.

## Project Structure

Here's an overview of the engine's modular directory structure:

```text
GameForgeJS/
├── Audio/
│   ├── processor.js
│   └── Song.js
├── Demo/
│   ├── Coin.js
│   ├── Player.js
│   └── TechDemoLevel.js
├── Demo3D/
│   ├── CubeEntity.js
│   └── TechDemo3DLevel.js
├── DemoAdvanced/
│   ├── Assets/
│   │   ├── background.jpg
│   │   ├── hero.png
│   │   ├── Idle.png
│   │   ├── Laser.png
│   │   └── Run.png
│   ├── AdvancedDemoLevel.js
│   ├── Bullet.js
│   ├── Enemy.js
│   └── Player.js
├── DemoMiniGame3D/
│   ├── Assets/
│   │   └── Textures/
│   │       ├── coin.jpg
│   │       ├── Daylight Box UV.png
│   │       ├── floor.jpg
│   │       ├── overview.jpg
│   │       └── player.jpg
│   ├── Coin3D.js
│   ├── CubeGameLevel.js
│   ├── Floor3D.js
│   ├── MiniGame3DMenu.js
│   └── Player3D.js
├── Graphic/
│   ├── Animator.js
│   ├── Draw.js             # 2D Canvas Drawing API
│   ├── Rectangle.js
│   ├── Shape3D.js          # WebGL 3D Geometry and Shader Compilation
│   ├── Skybox3D.js         # 360° Seamless Environment rendering
│   └── Sprite.js
├── Input/
│   ├── Input.js            # Global Keyboard/Mouse state handling
│   ├── KeyCode.js
│   ├── Mouse.js
│   └── Touch.js
├── Math/
│   ├── Collide2D.js
│   ├── MathExt.js
│   ├── Physic2D.js
│   ├── Vector2D.js
│   └── Vector3D.js
├── Particle/
│   ├── Particle.js
│   └── ParticleSystem.js
├── Pathfinding/
│   ├── AStar.js
│   ├── BFS.js
│   ├── DFS.js
│   ├── Dijkstra.js
│   └── Structure.js
├── Root/
│   ├── AssetManager.js     # Async Preloader for Images, Audio, and Shaders
│   ├── Base.js             # Base class with Next/Back state flags
│   ├── Camera.js
│   ├── Camera3D.js         # View and Projection Matrices for WebGL
│   ├── Engine.js           # Core GameLoop and LevelHandler
│   ├── GameObject.js
│   ├── GameObject3D.js     # Base entity for 3D objects
│   ├── Logger.js           # Centralized debugging
│   ├── ObjectPool.js       # Memory management for repetitive entities
│   ├── Scene.js
│   ├── Store.js
│   ├── UI.js
│   └── Utils.js
├── Shaders/                # Raw GLSL files
│   ├── FragmentShader.glsl
│   ├── SkyboxFragmentShader.glsl
│   ├── SkyBoxVertexShader.glsl
│   └── VertexShader.glsl
├── Template/
│   ├── DebugMap.js
│   ├── Level.js            # Base State/Scene for 2D 
│   ├── Level3D.js          # Base State/Scene for WebGL 3D
│   └── Menu.js
├── UI/
│   ├── Button.js
│   ├── Label.js
│   └── TextBox.js
├── Window/
│   ├── Screen.js           # 2D Canvas DOM Element manager
│   ├── Screen3D.js         # WebGL Canvas DOM Element manager
│   └── ScreenUI.js         # Hybrid Absolute-Positioned 2D Canvas over 3D
├── .gitignore
├── _config.yml
├── engrenagem.png
├── list.txt
├── lista.txt
├── main.css
├── Main.html
├── mainAdvanced.js         # Entry point for Advanced Demo
├── mainDemo3D.js           # Entry point for 3D Demo
├── mainImmature.js
├── mainMiniGame3D.js       # Application Entry Point for MiniGame 3D
├── README.md
├── reset.css
└── Tarefas.todo
```

## Setup and Installation

1. **Clone the repository:**
```sh
git clone https://github.com/Drakopit/GameForgeJS.git

```


2. **Run a Local Web Server:**
*Due to WebGL and `fetch` API security policies (CORS) for loading external shaders and textures, you MUST run a local server.*
* If using VSCode: Install the **Live Server** extension and click "Go Live".
* If using NodeJS: Run `npx http-server`.
* If using Python: Run `python -m http.server`.


3. **Open the project in your browser:**
Navigate to `http://localhost:8080/main.html` (or your corresponding local port).

## Usage & Architecture

### Main Components

1. **Engine & LevelHandler**: The core state machine. Handles the `requestAnimationFrame` loop, fixed physics updates, and scene transitions using `Next` and `Back` flags.
2. **AssetManager**: An asynchronous singleton that queues and downloads all Textures, Sounds, and GLSL Shaders before the game starts.
3. **Level / Level3D**: Template classes representing game scenes. They manage their own DOM elements (Canvases) during `OnStart` and clean them up during `OnExit`.
4. **ScreenUI & Screen3D**: Handles the physical `<canvas>` tags. `ScreenUI` automatically overlaps `Screen3D` perfectly for HUD rendering (Health bars, Scores, etc) on top of WebGL scenes.

### Creating a New Level (The Modern Way)

GameForgeJS strictly separates memory allocation from DOM injection. **Never create `Screen` canvases in the constructor.** Always create them in `OnStart()` and destroy them in `OnExit()` to prevent "Zombie Canvases".

```javascript
import { Level3D } from "../Template/Level3D.js";
import { ScreenUI } from "../Window/ScreenUI.js";

export class MyCustomLevel extends Level3D {
    constructor() {
        super();
        this.caption = "My Awesome 3D Level";
        this.Next = false;
        this.Back = false;
    }

    OnStart() {
        // 1. Create Canvases ONLY when the level actually starts
        this.screen3D = new Screen3D("gameCanvas3D", 800, 600);
        this.ui = new ScreenUI("gameCanvasUI", 800, 600);
        this.TelaId = "MyCustomLevel";

        // 2. Setup rendering order
        this.screen3D.Canvas.style.position = "absolute";
        this.screen3D.Canvas.style.zIndex = "1";

        super.OnStart(); // Initializes all 3D entities
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        // Example of transitioning back to the main menu
        if (Input.GetKeyDown("Escape")) {
            this.Back = true; 
        }
    }

    OnExit() {
        // MUST clean up DOM elements before the engine transitions to the next level
        if (this.screen3D && this.screen3D.Canvas) this.screen3D.Canvas.remove();
        if (this.ui && this.ui.Screen.Canvas) this.ui.Screen.Canvas.remove();
    }
}

```

### Initializing the Engine (Async Loading)

Use the `AssetManager` to ensure all your resources are loaded before adding levels to the `LevelHandler`.

```javascript
import { Engine, LevelHandler } from "./Root/Engine.js";
import { AssetManager } from "./Root/AssetManager.js";
import { Input } from "./Input/Input.js";
import { MyCustomLevel } from "./Levels/MyCustomLevel.js";
import { MainMenu } from "./Levels/MainMenu.js";

try {
    new Input(); 

    const assets = new AssetManager();
    assets.QueueImage("player_tex", "Assets/Textures/player.png");
    assets.QueueShader("basicVert", "Shaders/Basic.vert");
    assets.QueueShader("basicFrag", "Shaders/Basic.frag");

    // Wait for all assets to download
    assets.LoadAll().then(() => {
        // Add levels as raw objects (no parameters to avoid premature DOM creation)
        LevelHandler.addLevel(new MainMenu());
        LevelHandler.addLevel(new MyCustomLevel());
        
        // Start the GameLoop
        Engine.OnStart();
    });

} catch(exception) {
    console.error(`Fatal Exception: ${exception}`);
}

```

## Key Features

* **Hybrid Rendering Pipeline**: Seamlessly overlay 2D Canvas APIs (`Draw.js`) on top of 3D WebGL contexts (`Screen3D.js`) for perfect UI/HUD integration.
* **Asynchronous Asset Management**: Pre-fetch images, GLSL shaders, and audio to avoid stuttering and missing textures during gameplay.
* **Advanced State Machine**: Built-in memory leak protection. The `LevelHandler` automatically triggers `OnExit()` allowing levels to garbage-collect themselves before transitioning.
* **Custom Shaders & Skyboxes**: Full support for native `.glsl` file importing, `samplerCube` textures, and dynamic View/Projection matrices via `Camera3D`.
* **Object Pooling**: Avoid garbage collection spikes by reusing instantiated objects (like bullets or particles) via `ObjectPool.js`.

## Examples

Explore the `[https://github.com/Drakopit/TechDemo]` URL to see examples of different game levels.

* The `GravityLevel.js` demonstrates 2D physics.
* The `CubeGameLevel.js` demonstrates WebGL matrices, 3D Euclidean collision, and Keyboard/Camera movement.

## Contributing

We welcome contributions! If you have suggestions, bug fixes, or improvements, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

Remember to follow the existing architecture rules (SOLID and Clean Code) when creating PRs.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## Contact

For any questions or feedback, feel free to contact the author, Patrick Faustino Camello, at [patrickcamelo@yahoo.com.br](mailto:patrickcamelo@yahoo.com.br).

---

Thank you for using GameForgeJS! We hope it empowers you to forge amazing web experiences. Happy coding!
