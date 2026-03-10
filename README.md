# GameForgeJS

## Overview

Welcome to **GameForgeJS**, a powerful and lightweight JavaScript framework for creating browser-based games! This guide will walk you through the essentials of using our framework to develop your own games.

Originally built for 2D Canvas rendering, GameForgeJS has evolved into a robust **Data-Driven Engine** with **Hybrid 2D/3D Support**. It fully supports WebGL for 3D environments, custom GLSL Shaders, and an overlaid 2D HUD system. The framework is built strictly with pure JavaScript (ES6 Modules) utilizing professional Design Patterns (State, Builder, Observer, Facade), ensuring high performance, clean architecture, and zero heavy third-party dependencies.

## Table of Contents

1. [Getting Started](https://www.google.com/search?q=%23getting-started)
2. [Project Structure](https://www.google.com/search?q=%23project-structure)
3. [Setup and Installation](https://www.google.com/search?q=%23setup-and-installation)
4. [Usage & Architecture](https://www.google.com/search?q=%23usage--architecture)
5. [Input & Action Mapping](https://www.google.com/search?q=%23input--action-mapping)
6. [Key Features](https://www.google.com/search?q=%23key-features)
7. [Examples](https://www.google.com/search?q=%23examples)
8. [Contributing](https://www.google.com/search?q=%23contributing)
9. [License](https://www.google.com/search?q=%23license)
10. [Contact](https://www.google.com/search?q=%23contact)

## Getting Started

To get started with GameForgeJS, you will need a basic understanding of JavaScript (ES6 Classes, Modules, and Promises/Async Await), HTML, and CSS. This guide will walk you through the setup process, the new lifecycle hooks, and key features of the framework.

## Project Structure

Here's an overview of the engine's highly modular directory structure:

```text
GameForgeJS/
├── gameforge.config.json   # Core Engine settings (Screen, Physics, Mappings)
├── DemoAdvanced/
│   ├── Assets/             # Textures, BGM, and SFX
│   │   ├── BGM/
│   │   ├── Player/
│   │   └── SFX/
│   ├── Attacks/
│   │   └── HitBox.js       # Melee combat collision logic
│   ├── Levels/
│   │   └── LevelBuilder.js # Fluent interface for level creation
│   ├── States/
│   │   └── PlayerState.js  # State Machine logic for entities
│   ├── AdvancedDemoLevel.js
│   ├── Bullet.js
│   ├── Enemy.js
│   ├── Player.js
│   └── resources.json      # Asset Manifest for this specific demo
├── Graphic/
│   ├── Animator.js
│   ├── Draw.js             # 2D Canvas Drawing API
│   ├── Shape3D.js          # WebGL 3D Geometry
│   ├── Skybox3D.js         # 360° Seamless Environment rendering
│   └── Sprite.js
├── Input/
│   ├── ActionManager.js    # Multi-device action virtualizer
│   ├── GamePad.js          # Polling-based gamepad handler
│   ├── Input.js            # Hardware-agnostic Event listener
│   ├── KeyCode.js
│   ├── Mouse.js
│   └── Touch.js            # Mobile touch support
├── Math/
│   ├── Collide2D.js
│   ├── Physic2D.js
│   ├── Vector2D.js
│   └── Vector3D.js
├── Root/
│   ├── AssetManager.js     # Async Preloader for assets
│   ├── AudioManager.js     # Global sound and BGM manager
│   ├── Config.js           # Global configuration singleton
│   ├── Engine.js           # Core GameLoop and LevelHandler
│   ├── EventEmitter.js     # Event Bus (Observer Pattern)
│   ├── GameObject.js
│   ├── ObjectPool.js       # Memory management for repetitive entities
│   └── Scene.js
├── Shaders/                # Raw GLSL files
│   ├── FragmentShader.glsl
│   └── VertexShader.glsl
├── Template/
│   ├── Level.js            # Base State/Scene for 2D 
│   ├── Level3D.js          # Base State/Scene for WebGL 3D
│   └── Menu.js
├── UI/
│   ├── Button.js
│   ├── NineSlice.js        # Scalable UI panels
│   ├── TextBox.js
│   └── UIWindow.js         # Overlay dialogs and HUD
├── Window/
│   ├── Screen.js           # 2D Canvas DOM Element manager
│   ├── Screen3D.js         # WebGL Canvas DOM Element manager
│   └── ScreenUI.js         # Hybrid Absolute-Positioned 2D Canvas over 3D
├── mainAdvanced.js         # Async Bootstrapper Entry Point (2D Demo)
├── mainDemo3D.js           # Async Bootstrapper Entry Point (3D Demo)
└── server.js               # Local development server for testing

```

## Setup and Installation

1. **Clone the repository:**

```sh
git clone https://github.com/Drakopit/GameForgeJS.git

```

2. **Run a Local Web Server:**
*Due to WebGL and `fetch` API security policies (CORS) for loading external configs, shaders, and textures, you MUST run a local server.*

* If using VSCode: Install the **Live Server** extension and click "Go Live".
* If using NodeJS: Run `npx http-server`.
* If using Python: Run `python -m http.server`.

3. **Open the project in your browser:**
Navigate to `http://localhost:8080/main.html` (or your corresponding local port).

## Usage & Architecture

### Main Components

1. **Engine & Event Bus**: The core state machine now utilizes an `EventEmitter`. Instead of hardcoded updates, systems subscribe to `PreUpdate` and `PostUpdate` lifecycle hooks.
2. **Config & Asset Manifest**: The engine is entirely **Data-Driven**. Settings like gravity, screen size, and controls are loaded from `config.json`, while assets are dynamically fetched via `resources.json`.
3. **LevelBuilder**: Game levels are now constructed using the **Builder Pattern**, allowing fluent and clean level design without bloating the initialization code.

### Initializing the Engine (Async Bootstrapper)

GameForgeJS uses an asynchronous bootstrapper to ensure all configurations and assets are loaded before the first frame is ever drawn.

```javascript
import { Engine, LevelHandler } from "./Root/Engine.js";
import { Config } from "./Root/Config.js";
import { Input } from "./Input/Input.js";
import { ActionManager } from "./Input/ActionManager.js";
import { AssetManager } from "./Root/AssetManager.js";
import { AdvancedDemoLevel } from "./DemoAdvanced/AdvancedDemoLevel.js";

async function Bootstrap() {
    try {
        // 1. Load Data-Driven Configurations
        const config = await Config.Load("config.json");

        // 2. Initialize Hardware & Virtual Mappings
        new Input(); 
        ActionManager.LoadMappings(config.actionMappings);

        // 3. Asset Manifest Dynamic Loading
        const assets = new AssetManager();
        const manifest = await (await fetch("resources.json")).json();
        
        manifest.images?.forEach(img => assets.QueueImage(img.name, img.path));
        manifest.audios?.forEach(snd => assets.QueueAudio(snd.name, snd.path));

        // 4. Wait for all downloads
        await assets.LoadAll();

        // 5. Start the Engine
        LevelHandler.addLevel(new AdvancedDemoLevel());
        Engine.OnStart();

    } catch (exception) {
        console.error(`Fatal Exception during Bootstrap: ${exception}`);
    }
}

Bootstrap();

```

## Input & Action Mapping

GameForgeJS features a professional **Multi-Device Virtualization System**. Your gameplay code never needs to ask if the user pressed the "Spacebar" or a "Gamepad Button". Instead, it asks the `ActionManager` if a logical action occurred.

**1. Define in `config.json`:**

```json
"actionMappings": {
    "JUMP": [
        { "device": "keyboard", "input": "Space" },
        { "device": "keyboard", "input": "ArrowUp" },
        { "device": "gamepad", "input": "button_0" }
    ],
    "RIGHT": [
        { "device": "keyboard", "input": "KeyD" },
        { "device": "gamepad", "input": "axis_0_positive" }
    ]
}

```

**2. Query in your Game Logic (e.g., `Player.js` or `PlayerState.js`):**

```javascript
import { ActionManager } from "../Input/ActionManager.js";

export class Player {
    OnUpdate(dt) {
        // Automatically supports Keyboard, Touch, and Gamepads seamlessly!
        if (ActionManager.IsAction("RIGHT")) {
            this.position.x += this.speed * dt;
        }

        if (ActionManager.IsActionDown("JUMP") && this.isGrounded) {
            this.DoJump();
        }
    }
}

```

## Key Features

* **Data-Driven Core**: Configure resolution, physics gravity, inputs, and asset manifests via JSON. No more hardcoded paths or magic numbers.
* **Universal Action Mapper**: Seamlessly plug-and-play Keyboards, Mice, Gamepads, and Mobile Touch controls without altering entity logic.
* **Design Patterns Embedded**: Built with State Machines (for complex animations and logic), Builder Patterns (for level design), and Observer Patterns (Event Bus decoupled architecture).
* **Hybrid Rendering Pipeline**: Overlay 2D Canvas APIs (`Draw.js`) on top of 3D WebGL contexts (`Screen3D.js`) for perfect UI/HUD integration.
* **Object Pooling**: Avoid garbage collection spikes and maintain 60 FPS by reusing instantiated objects (like bullets or particles) via `ObjectPool.js`.

## Examples

Explore the `DemoAdvanced` directory to see examples of a complete game cycle:

* `AdvancedDemoLevel.js` demonstrates the **LevelBuilder** and Engine Lifecycle.
* `Player.js` and `PlayerState.js` demonstrate the **State Machine** pattern for animations and attacks.
* `resources.json` demonstrates how to use the **Asset Manifest**.

## Contributing

We welcome contributions! If you have suggestions, bug fixes, or improvements, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

Remember to follow the existing architecture rules (**SOLID** principles and Clean Code) when creating PRs.

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

## Contact

For any questions or feedback, feel free to contact the author, Patrick Faustino Camello, at [patrickcamelo@yahoo.com.br](mailto:patrickcamelo@yahoo.com.br).

---

Thank you for using **GameForgeJS**! We hope it empowers you to forge amazing web experiences. Happy coding!