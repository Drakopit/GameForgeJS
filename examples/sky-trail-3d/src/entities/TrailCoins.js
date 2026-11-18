import { AssetManager, Vector3D } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, StandardMaterial, Texture } from 'gameforgejs/3d';

export class TrailCoins {
    constructor(scene, platforms, config) {
        this.scene = scene;
        this.platforms = platforms;
        this.config = config;
        this.CreateCoins();
    }

    CreateCoins() {
        const coinConfig = this.config;
        const coinTexture = AssetManager.instance.HasImage("textura_coin")
            ? Texture.FromImage(AssetManager.instance.GetImage("textura_coin"))
            : null;

        this.coins = coinConfig.items.map((definition, index) => {
            const mesh = Mesh.FromGeometry(
                PrimitiveMesh.Sphere(coinConfig.radius, { widthSegments: 24, heightSegments: 12 }),
                new StandardMaterial({
                    name: `CoinMaterial_${index}`,
                    albedoMap: coinTexture,
                    albedoColor: [1.0, 0.78, 0.18, 1],
                    roughness: 0.2,
                    metallic: 0.18,
                    emissiveColor: [0.18, 0.1, 0.01],
                }),
                { name: `Coin_${index}`, castShadow: true, receiveShadow: false },
            );
            mesh.transform.SetPosition(...this.platforms.GetAttachmentPosition(definition).ToArray());
            this.scene.Add(mesh);
            return {
                definition,
                mesh,
                active: true,
                value: definition.value,
                radius: coinConfig.radius,
            };
        });
    }

    Update(dt, time) {
        const config = this.config;
        this.coins.forEach((coin, index) => {
            if (!coin.active) return;

            const platform = this.platforms.platformById.get(coin.definition.platformId);
            const position = this.platforms.GetAttachmentPosition(coin.definition);
            coin.mesh.visible = platform?.active !== false;
            position.y += Math.sin(time * config.bobSpeed + index) * config.bobDistance;
            coin.mesh.transform.SetPosition(position.x, position.y, position.z);
            coin.mesh.transform.rotation.y += dt * config.spinSpeed;
        });
    }

    Collect(playerCenter) {
        const collected = [];
        for (const coin of this.coins) {
            if (!coin.active || !coin.mesh.visible) continue;
            if (Vector3D.FromArray(coin.mesh.transform.position).DistanceTo(playerCenter) > this.config.pickupDistance) continue;
            coin.active = false;
            coin.mesh.visible = false;
            collected.push(coin);
        }
        return collected;
    }

    Reset() {
        for (const coin of this.coins) coin.active = true;
        this.Update(0, 0);
    }

    OnDestroy() {
        for (const coin of this.coins) this.scene.Remove(coin.mesh);
    }
}

