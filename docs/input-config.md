# Configuracao De Input Por Jogo

Os comandos nao devem morar no `gameforge.config.json`. Esse arquivo e global da engine. Cada demo/jogo deve declarar seus proprios comandos no config local.

## ActionManager

Demos que usam `ActionManager` devem declarar `input.actionMappings`:

```json
{
  "input": {
    "actionMappings": {
      "ATTACK": [
        { "device": "keyboard", "input": "KeyZ" },
        { "device": "gamepad", "input": "button_0" }
      ],
      "LEFT": [
        { "device": "keyboard", "input": "ArrowLeft" },
        { "device": "gamepad", "input": "axis_0_negative" },
        { "device": "gamepad", "input": "button_14" }
      ]
    }
  }
}
```

O `BootstrapGame` pode carregar uma lista de configs. Os ultimos arquivos sobrescrevem ou complementam os anteriores:

```js
BootstrapGame({
    configPath: ["gameforge.config.json", "MyGame/mygame.config.json"],
    levels: [
        new FirstLevel(),
    ],
});
```

## Gamepad

A cola completa de equivalencia entre `button_N`, Xbox e PlayStation fica em [`../GAMEPAD_COLA.md`](../GAMEPAD_COLA.md).

Convencao recomendada nas demos:

```txt
button_0 = confirmar / pular
button_1 = cancelar
button_2 = ataque leve
button_3 = ataque forte
button_5 = especial
button_8 = back/select
button_9 = start
button_12 = d-pad up
button_13 = d-pad down
button_14 = d-pad left
button_15 = d-pad right
```

Eixos:

```txt
axis_0_negative = analogico esquerdo para esquerda
axis_0_positive = analogico esquerdo para direita
axis_1_negative = analogico esquerdo para cima
axis_1_positive = analogico esquerdo para baixo
```

## Demo De Luta

A demo de luta usa uma configuracao propria em `fighting.controls`, porque possui dois jogadores, menu, arcade e versus:

```json
{
  "fighting": {
    "controls": {
      "playerOne": {
        "left": ["KeyA"],
        "right": ["KeyD"],
        "light": ["KeyJ"],
        "gamepad": {
          "index": 0,
          "left": { "buttons": [14], "axes": [{ "index": 0, "direction": "negative" }] },
          "right": { "buttons": [15], "axes": [{ "index": 0, "direction": "positive" }] },
          "light": [2]
        }
      }
    }
  }
}
```

Assim o controle de cada jogo fica no proprio jogo, sem vazar para outras demos.
