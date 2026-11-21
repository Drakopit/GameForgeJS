/** Deprecated APIs retained for migrations. New applications use the core/2d/3d entrypoints. */
export { BootstrapGame } from "../core/Bootstrap.js";
export { Engine, LevelHandler } from "../core/Engine.js";
export { Level3D as LegacyLevel3D } from "../3d/Legacy/Level/LegacyLevel3D.js";
export { Camera3D } from "../3d/Camera/Camera3D.js";
export { GameObject3D, Transform3D as LegacyTransform3D } from "../3d/Objects/GameObject3D.js";
export { DirectionalLight3D } from "../3d/Legacy/Graphics/Light3D.js";
export { Mesh3D } from "../3d/Legacy/Graphics/Mesh3D.js";
export { Shapes3D } from "../3d/Legacy/Graphics/Shape3D.js";
export { Skybox3D } from "../3d/Legacy/Graphics/Skybox3D.js";
