# GameForgeJS README

## Overview

Welcome to the GameForgeJS JavaScript framework for creating browser-based games! This will guide you through the essentials of using our framework to develop your own games, showcasing various features and functionalities. The framework is built with pure JavaScript (97.3%), along with a small amount of HTML (1.3%) and CSS (1.4%).

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Setup and Installation](#setup-and-installation)
4. [Usage](#usage)
5. [Key Features](#key-features)
6. [Examples](#examples)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)

## Getting Started

To get started with our framework, you will need a basic understanding of JavaScript, HTML, and CSS. This guide will walk you through the setup process, project structure, and key features of the framework.

## Project Structure

Here's an overview of the project's directory structure:

```
GameForgeJS/
├── Audio/
|   ├── Song.js/
├── Graphic/
│   ├── Draw.js
│   ├── Rectangle.js
│   ├── Shape3D.js
│   ├── Sprite.js
├── Input/
│   ├── Input.js
│   ├── KeyCode.js
│   ├── Mouse.js
│   ├── Touch.js
├── Math/
│   ├── Collide2D.js
│   ├── MathExt.js
│   ├── Physic2D.js
│   ├── Vector2D.js
│   ├── Vector3D.js
├── Root/
│   ├── Base.js
│   ├── Camera.js
│   ├── Engine.js
│   ├── GameObject.js
│   ├── Scene.js
│   ├── Store.js
│   ├── UI.js
│   ├── Utils.js
├── Template/
│   ├── DebugMap.js
│   ├── Level.js
│   ├── Menu.js
├── UI/
│   ├── Button.js
│   ├── Label.js
│   ├── TextBox.js
├── Window/
│   ├── Screen.js
│   ├── Screen3D.js
├── _config.yml
├── .gitignore
├── engrenagem.png
├── main.html
├── main.css
├── main.js
├── reset.css
└── README.md
```

## Setup and Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Drakopit/GameForgeJS.git
   ```

2. **Create and Navigate to the project directory:**

   ```sh
   mkdir MyGame
   cd MyGame
   ```

3. **Open `main.html` in your preferred web browser:**

   Simply open the `main.html` file in your browser to run the demo.

## Usage

### Main Components

1. **Engine**: The core of the framework, responsible for initializing and running the game loop.
2. **Level**: A template class for creating game levels.
3. **Player**: An example game object representing the player, showcasing basic physics and input handling.
4. **Input**: Handles keyboard input.
5. **Draw**: Provides drawing functionalities for rendering graphics on the screen.
6. **Screen**: Manages the game screen dimensions and rendering context.

### Creating a New Level

To create a new level, extend the `Level` class and override the necessary methods such as `OnStart`, `OnUpdate`, `OnFixedUpdate`, `OnDrawn`, and `OnGUI`.

Example:

```javascript
import { Level } from "./GameForgeJS/Template/Level.js";
import { Player } from "./Objects/Player.js";

export class CustomLevel extends Level {
    constructor() {
        super();
        this.caption = "Custom Level";
    }

    OnStart() {
        super.OnStart();
        const player = new Player(this.screen, 100, 100);
        this.AddEntity(player);
    }

    OnUpdate() {
        super.OnUpdate();
    }

    OnFixedUpdate(deltaTime) {
        super.OnFixedUpdate(deltaTime);
    }

    OnDrawn() {
        super.OnDrawn();
    }

    OnGUI() {
        super.OnGUI();
    }
}
```

### Running the Game

To run the game, initialize the `Engine` in your `main.js`:

```javascript
import { Engine, LevelHandler } from "./GameForgeJS/Root/Engine.js";
import { CustomLevel } from "./Levels/CustomLevel.js";

try {
    // Add levels before starting the engine
    LevelHandler.addLevel(new CustomLevel("CustomLevel"));
    // Add more levels as needed

    Engine.OnStart();
    console.dir(Engine);
} catch(exception) {
    console.error(`Exception: ${exception}`);
}
```

## Key Features

- **Modular Architecture**: Easily extendable classes and components.
- **Input Handling**: Simple and effective keyboard input management.
- **Physics**: Basic physics simulation including gravity.
- **Rendering**: Efficient rendering of game objects.
- **Levels**: Flexible level management and transitions.

## Examples

Explore the `[https://github.com/Drakopit/TechDemo]` url to see examples of different game levels and how to create them. The `GravityLevel.js` demonstrates a level with gravity effects applied to game entities.

## Contributing

We welcome contributions! If you have suggestions, bug fixes, or improvements, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, feel free to contact the author, Patrick Faustino Camello, at [patrickcamelo@yahoo.com.br](mailto:patrickcamelo@yahoo.com.br).

---

Thank you for using our framework! We hope it helps you create amazing games for the web. Happy coding!
