<p align="center">
  <img src="docs/assets/gameforgejs-banner.png" alt="GameForgeJS Banner" width="100%" />
</p>

# GameForgeJS

GameForgeJS e uma engine/framework experimental em JavaScript puro para jogos de navegador. O objetivo e permitir criar demos, jogos 2D/3D e ferramentas sem prender o runtime a dependencias externas.

O Node.js e opcional: ele entra apenas como servidor local de desenvolvimento para evitar CORS ao carregar JSON, imagens, audio, shaders e modelos.

## Principios

- Runtime independente, baseado em JavaScript nativo e APIs do navegador.
- Cada jogo/demo tem sua propria configuracao de janela, tela e comandos.
- Assets e fases devem caminhar para manifests data-driven.
- A engine deve aceitar heranca classica e evoluir gradualmente para componentizacao.
- Ferramentas como o WorldEditor devem ficar fora das demos, para servir qualquer projeto.

## Como Rodar

```sh
npm run start
```

Depois abra:

```txt
http://localhost:8080/Main.html
```

Sem query string, `Main.html` abre o Admin Mode, uma tela para escolher qual demo ou ferramenta rodar.

Links diretos continuam funcionando:

```txt
http://localhost:8080/Main.html?demo=advanced
http://localhost:8080/Main.html?demo=tactical
http://localhost:8080/Main.html?demo=fighting2d
http://localhost:8080/Main.html?demo=demo3d
http://localhost:8080/Main.html?demo=mini3d
http://localhost:8080/Main.html?demo=immature
http://localhost:8080/WorldEditor_v4.html
```

## Demos

| Demo | Entrada | Config | Descricao |
| --- | --- | --- | --- |
| Advanced | `DemoAdvanced/mainAdvanced.js` | `DemoAdvanced/advanced.config.json` | Plataforma/RPG 2D com manifests, fases, inventario, skill tree, hitboxes e HUD. |
| Tactical RPG | `DemoTacticalRPG/mainTacticalRPG.js` | `DemoTacticalRPG/tactical.config.json` | Grid tatico com AStar, area de movimento, acao e batalha. |
| Fighting 2D | `DemoFightingGame2D/mainFightingGame2D.js` | `DemoFightingGame2D/fighting.config.json` | Menu, arcade, versus, selecao de personagem, teclado e gamepad configuravel. |
| Demo 3D | `Demo3D/mainDemo3D.js` | `Demo3D/demo3d.config.json` | Validacao WebGL/3D. |
| MiniGame 3D | `DemoMiniGame3D/mainMiniGame3D.js` | `DemoMiniGame3D/mini3d.config.json` | Mini jogo 3D com coleta, camera e iluminacao. |
| Immature | `Demo/mainImmature.js` | `Demo/immature.config.json` | Exemplo simples de movimentacao e colisao. |

## Estrutura

```txt
GameForgeJS/
  Root/                  Core, bootstrap, config, loop, assets, scene, component
  Input/                 Teclado, mouse, touch, gamepad e ActionManager
  Graphic/               Canvas/WebGL, sprites, animacao, modelos e luz
  Math/                  Vetores, colisao e utilitarios matematicos
  Collision/             Hitbox/hurtbox/collisionbox 2D
  Combat/                ComboController e suporte a combate
  Effects/               Efeitos reutilizaveis como texto flutuante
  Template/              Bases de Level/Menu/Level3D
  UI/                    Controles de interface
  WorldEditorV4/         Editor visual modular na raiz do projeto
  docs/                  Guias tecnicos
  DemoAdvanced/          Demo plataforma/RPG data-driven
  DemoFightingGame2D/    Demo de luta 2D
  DemoTacticalRPG/       Demo tatico
  Demo3D/                Demo WebGL
  DemoMiniGame3D/        Mini game 3D
```

## Criando Um Projeto

Um projeto novo deve ter entrada propria, config proprio e, quando houver assets, um `resources.json`.

```txt
MyGame/
  mygame.config.json
  resources.json
  mainMyGame.js
  Levels/
    FirstLevel.js
  Entities/
    Player.js
  Assets/
```

Entrada minima:

```js
import { BootstrapGame } from "../Root/Bootstrap.js";
import { FirstLevel } from "./Levels/FirstLevel.js";

BootstrapGame({
    configPath: ["gameforge.config.json", "MyGame/mygame.config.json"],
    manifestPath: "MyGame/resources.json",
    levels: [
        new FirstLevel(),
    ],
});
```

`gameforge.config.json` guarda apenas defaults da engine. O arquivo `MyGame/mygame.config.json` substitui os detalhes do jogo: titulo, tamanho de tela, audio, comandos e configuracoes especificas.

Exemplo de comando por jogo:

```json
{
  "input": {
    "gamepadProfile": "xbox",
    "actionMappings": {
      "ATTACK": [
        { "device": "keyboard", "input": "KeyZ" },
        { "device": "gamepad", "input": "X" }
      ],
      "RIGHT": [
        { "device": "keyboard", "input": "ArrowRight" },
        { "device": "gamepad", "input": "LEFT_STICK_RIGHT" },
        { "device": "gamepad", "input": "DPAD_RIGHT" }
      ]
    }
  }
}
```

## Assets E Manifests

Assets sao carregados por `ResourceManifestLoader`:

```json
{
  "images": [
    { "name": "player_idle", "path": "MyGame/Assets/Player/IDLE.png" }
  ],
  "audios": [
    { "name": "jump", "path": "MyGame/Assets/Audio/Jump.wav" }
  ],
  "jsons": [
    { "name": "first_level", "path": "MyGame/Assets/Manifests/first.level.json" }
  ]
}
```

No AdvancedDemo, fases sao compostas por manifests menores. Configuracoes comuns ficam em:

```txt
DemoAdvanced/Assets/Manifests/advanced/stage-default.json
```

E a fase compoe defaults + partes especificas:

```json
{
  "id": "advanced_snow_demo",
  "compose": [
    "advanced_stage_default",
    "advanced_core",
    "advanced_stage",
    "advanced_player",
    "advanced_enemies",
    "advanced_effects",
    "advanced_ui"
  ]
}
```

## Componentizacao

`GameObject` ainda aceita o fluxo classico com `OnStart`, `OnUpdate`, `OnFixedUpdate`, `OnDrawn` e `OnGUI`, mas agora tambem pode receber componentes reutilizaveis.

```js
import { GameObject } from "./Root/GameObject.js";
import { BoundsComponent, HealthComponent, TransformComponent } from "./Root/Component.js";

const entity = new GameObject();
entity.AddComponent(new TransformComponent({ x: 80, y: 120 }));
entity.AddComponent(new BoundsComponent({ width: 32, height: 32 }));
entity.AddComponent(new HealthComponent({ hp: 100 }));
```

Veja o guia completo em [Componentizacao](docs/components.md). Esse e o caminho para evoluir para um modelo ECS-lite sem quebrar as demos atuais.

## WorldEditor

O WorldEditor v4 agora fica na raiz:

```txt
WorldEditor_v4.html
WorldEditorV4/
```

Ele carrega manifests por `fetch`, possui fallback embutido e permite escolher perfil ou informar caminhos manualmente. O perfil atual `Advanced Snow` aponta para:

```txt
DemoAdvanced/Assets/Manifests/advanced/
DemoAdvanced/Assets/Manifests/snow/
```

## Documentacao

- [Criando um projeto](docs/new-project.md)
- [Configuracao de input por jogo](docs/input-config.md)
- [Cola de gamepad](GAMEPAD_COLA.md)
- [Componentizacao](docs/components.md)
- [Advanced Stage Manifest](docs/advanced-stage-manifest.md)
- [Hitbox Manifest 2D](docs/hitbox-manifest.md)
- [WorldEditor v4](docs/world-editor-v4.md)

## Direcao Do Projeto

O caminho mais forte agora e:

- consolidar `GameObject + Component`
- criar sistemas reutilizaveis para render, fisica, input e animacao
- transformar entidades em dados serializaveis
- evoluir o WorldEditor para criar e editar projetos inteiros
- finalizar um jogo pequeno usando a engine como validacao real
