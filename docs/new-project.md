# Novo formato de projeto GameForgeJS

Este formato mantem a engine sem dependencias externas. O projeto declara apenas configuracao, manifest de assets e fases iniciais.

## Estrutura sugerida

```text
MyGame/
  Main.html
  gameforge.config.json
  resources.json
  main.js
  Assets/
    Player/
    Audio/
    Shaders/
  Source/
    Entities/
      Player.js
      Enemy.js
    Levels/
      FirstLevel.js
```

## main.js

```javascript
import { BootstrapGame } from "../GameForgeJS/Root/Bootstrap.js";
import { FirstLevel } from "./Source/Levels/FirstLevel.js";

BootstrapGame({
    configPath: "gameforge.config.json",
    manifestPath: "resources.json",
    levels: [
        new FirstLevel(),
    ],
});
```

## resources.json

```json
{
    "images": [
        { "name": "player_idle", "path": "Assets/Player/IDLE.png" }
    ],
    "audios": [
        { "name": "jump", "path": "Assets/Audio/Jump.wav" }
    ],
    "shaders": [
        { "name": "vertexShader", "path": "Assets/Shaders/VertexShader.glsl" }
    ],
    "models": [
        { "name": "hero", "path": "Assets/Models/hero.glb" }
    ]
}
```

## Desenvolvimento local opcional

```sh
npm run start
```

O comando acima usa apenas o `server.js` local para evitar problemas de CORS durante o desenvolvimento. Ele nao e necessario para a engine funcionar em producao.

## Demos no repositorio

As demos do repositorio seguem o mesmo principio: cada uma tem sua entrada dentro da propria pasta.

```text
DemoAdvanced/mainAdvanced.js
Demo3D/mainDemo3D.js
DemoMiniGame3D/mainMiniGame3D.js
DemoTacticalRPG/mainTacticalRPG.js
Demo/mainImmature.js
```

Durante o desenvolvimento, `Main.html` usa `Root/DemoLauncher.js` para escolher a demo por query string:

```text
Main.html?demo=advanced
Main.html?demo=tactical
Main.html?demo=demo3d
Main.html?demo=mini3d
Main.html?demo=immature
```
