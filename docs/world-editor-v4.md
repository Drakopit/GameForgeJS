# WorldEditor v4

O WorldEditor v4 e uma ferramenta da raiz do GameForgeJS, nao uma classe da `DemoAdvanced`.

```txt
WorldEditor_v4.html
WorldEditorV4/
```

Abra com o servidor local:

```txt
http://localhost:8080/WorldEditor_v4.html
```

## Estrutura

- `WorldEditorV4/main.js`: bootstrap e eventos de alto nivel.
- `WorldEditorV4/data-source.js`: carregamento dos manifests reais com fallback.
- `WorldEditorV4/config.js`: perfis, caminhos e imagens usadas no preview.
- `WorldEditorV4/catalog.js`: catalogo de sprites, animacoes e terrain sets.
- `WorldEditorV4/editor-state.js`: estado editavel da fase.
- `WorldEditorV4/renderer.js`: desenho do canvas.
- `WorldEditorV4/ui.js`: lista, propriedades, manifests e JSON ativo.
- `WorldEditorV4/interactions.js`: mouse, drag, camera, zoom e selecao.

## Perfil Advanced Snow

O perfil padrao carrega:

```txt
DemoAdvanced/Assets/Manifests/advanced/
DemoAdvanced/Assets/Manifests/snow/
```

Ele edita:

- `stage.json`, `second-stage.json`, `boss-stage.json`
- `enemies.json`, `second-enemies.json`, `boss-enemies.json`
- `player.json`

## Perfil Personalizado

Use o perfil `Personalizado` para informar:

- base path dos manifests
- arquivo de stage
- arquivo de enemies
- arquivo de player

Esse modo permite reaproveitar o editor em outras demos desde que os JSONs sigam a estrutura esperada:

- `platforms`
- `objects`
- `parallax.layers`
- `enemies`
- `player.spawn`

## Exportacao

O editor nao grava direto no disco por seguranca do navegador. Ele exporta ou copia o JSON ativo para que o arquivo original seja substituido no projeto.
