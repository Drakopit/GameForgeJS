# GameForgeJS

Zero-dependency JavaScript ECS framework for browser games.

- `gameforgejs/core` provides the lifecycle, scenes, input, audio, and math.
- `gameforgejs/2d` and `gameforgejs/3d` provide rendering and physics.
- TypeScript declarations are included in `types/`.

Built-in shaders are authored in `src/3d/Render3D/Shader/glsl/`. Use the sibling GameForgeJS.Tools repository for development commands, declaration and shader generation, and scaffolding. GameForgeJS.Demos, GameForgeJsEditor, and GameForgeJS.OnlineServer are independent consumers.
