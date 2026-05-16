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
- `WorldEditorV4/atlas-mapper.js`: gerador simples de catalogo a partir de uma imagem e grade.
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

## Perfil Tactical Tiny Swords

O perfil tatico carrega os manifests e assets do pacote Tiny Swords:

```txt
DemoTacticalRPG/Assets/Manifests/tactical/
DemoTacticalRPG/Assets/Tiny Swords (Free Pack)/
```

Ele edita:

- `stage.json`
- `enemies.json`
- `player.json`
- `catalog.json` como catalogo visual para objetos e terrain sets

Esse perfil usa `world`, `tilemap` e `blockedTiles` para desenhar uma grade taticamente editavel no canvas.

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

## Novos Perfis

Para adicionar outra demo ao editor, registre um perfil em `WorldEditorV4/config.js` com:

- `phases`: nomes dos arquivos de stage/enemies por fase.
- `basePath`: pasta dos manifests editaveis.
- `catalogBasePath` e `catalogFiles`: manifests de catalogo usados pelo seletor de sprites.
- `imageMap`: imagens que o preview pode carregar.
- `playerPreview` e `enemyPreview`: sprite sheet usada para previsualizar entidades.

## Mapeamento Rapido

A secao `Mapear imagem` permite informar uma imagem, tamanho de tile, colunas, linhas e prefixo. O editor carrega a imagem no preview e gera um `catalog.json` temporario, reduzindo a necessidade de escrever cada recorte a mao.

Use `Tileset` quando a imagem representa terreno e `Sprites` quando cada celula deve virar um item selecionavel no catalogo.

## Exportacao

O editor nao grava direto no disco por seguranca do navegador. Ele exporta ou copia o JSON ativo para que o arquivo original seja substituido no projeto.
