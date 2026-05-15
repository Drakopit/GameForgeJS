# Cola De Gamepad

GameForgeJS usa a numeracao do **Standard Gamepad Mapping** do navegador. O nome usado nos configs e `button_N` para botoes e `axis_N_direction` para analogicos.

## Botoes

| Config | Xbox | PlayStation | Uso comum |
| --- | --- | --- | --- |
| `button_0` | A | X | Confirmar, pular |
| `button_1` | B | Circulo | Cancelar, voltar |
| `button_2` | X | Quadrado | Ataque leve, interacao secundaria |
| `button_3` | Y | Triangulo | Ataque forte, acao especial |
| `button_4` | LB | L1 | Ombro esquerdo |
| `button_5` | RB | R1 | Ombro direito, especial |
| `button_6` | LT | L2 | Gatilho esquerdo |
| `button_7` | RT | R2 | Gatilho direito |
| `button_8` | View / Back | Share / Create | Voltar, menu secundario |
| `button_9` | Menu / Start | Options | Start, pausar, confirmar em menu |
| `button_10` | Left Stick | L3 | Clique do analogico esquerdo |
| `button_11` | Right Stick | R3 | Clique do analogico direito |
| `button_12` | D-pad Up | D-pad Up | Cima |
| `button_13` | D-pad Down | D-pad Down | Baixo |
| `button_14` | D-pad Left | D-pad Left | Esquerda |
| `button_15` | D-pad Right | D-pad Right | Direita |
| `button_16` | Guide | PS | Botao do sistema, nem sempre exposto pelo navegador |

## Eixos

| Config | Controle |
| --- | --- |
| `axis_0_negative` | Analogico esquerdo para esquerda |
| `axis_0_positive` | Analogico esquerdo para direita |
| `axis_1_negative` | Analogico esquerdo para cima |
| `axis_1_positive` | Analogico esquerdo para baixo |
| `axis_2_negative` | Analogico direito para esquerda |
| `axis_2_positive` | Analogico direito para direita |
| `axis_3_negative` | Analogico direito para cima |
| `axis_3_positive` | Analogico direito para baixo |

## Convencoes Recomendadas

```txt
Confirmar / pular   -> button_0  (A / X)
Cancelar            -> button_1  (B / Circulo)
Ataque leve         -> button_2  (X / Quadrado)
Ataque forte        -> button_3  (Y / Triangulo)
Especial / skill    -> button_5  (RB / R1)
Menu / pause        -> button_9  (Start / Options)
```

Exemplo:

```json
{
  "input": {
    "actionMappings": {
      "JUMP": [
        { "device": "gamepad", "input": "button_0" }
      ],
      "ATTACK": [
        { "device": "gamepad", "input": "button_2" }
      ],
      "RIGHT": [
        { "device": "gamepad", "input": "axis_0_positive" },
        { "device": "gamepad", "input": "button_15" }
      ]
    }
  }
}
```
