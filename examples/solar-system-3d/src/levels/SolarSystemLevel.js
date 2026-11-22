import { Button, HUDFrame, GameObject, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';
import { Vector3D, SoundEffects, Input, Touch } from 'gameforgejs/core';
import { ActionManager } from "gameforgejs/core";
import { AssetManager } from "gameforgejs/core";
import {
    CelestialBodyMaterial,
    Level3D,
    Mesh,
    PerspectiveCamera,
    PrimitiveMesh,
    SceneManifest3D,
    UnlitMaterial,
} from "gameforgejs/3d";
import { SolarFromScene } from "../data/SolarScene.js";

// NASA NSSDCA Planetary Fact Sheet, equatorial diameter (km), orbital period (days).
const physical = [[4879, 88], [12104, 224.7], [12756, 365.2], [6792, 687],
    [142984, 4331], [120536, 10747], [51118, 30589], [49528, 59800]];

export class SolarSystemLevel extends Level3D {
    constructor() {
        super({
            width: 960,
            height: 540,
            clearColor: [0.005, 0.007, 0.018, 1],
            usePhysics: false,
        });
        this.caption = "GameForgeJS - Sistema Solar 3D";
        this.time = 0;
        this.cameraYaw = 0.0;
        this.cameraDistance = 31.0;
        this.planets = [];
    }

    BuildScene() {
        this.time = 0;
        this.cameraYaw = 0;
        this.cameraDistance = 31;
        this.planets = [];
        const director = this.AddEntity(new GameObject());
        this.sound = director.AddComponent(new SoundEffects(this.context.services.get('audio')));
        this.focus = -1;
        this.lastTarget = null;
        this.look = new Vector3D();
        this.focusFrame = new HUDFrame(this.ui.Draw);
        this.focusButton = new Button(this.ui.Screen, { pointerInput: true });
        this.focusButton.OnClick(() => this.SelectBody((this.focus + 2) % (this.Bodies().length + 1) - 1));
        this.help = new InfoPanel(this.ui.Draw, { title: 'SOLAR SYSTEM / CONTROLS', lines: [] });
        // Camera, lights, sun and planets come from scenes/solar-system.gfscene.json.
        const solar = SolarFromScene(this.context.assets.jsons.solar_scene);
        this.camera = new PerspectiveCamera({ ...solar.camera, aspect: this.width / this.height });
        this.scene.Add(this.camera);
        for (const light of solar.lights) this.scene.Add(SceneManifest3D.CreateLight(light));

        this.CreateSun(solar.sun);
        solar.planets.forEach((planet, index) => this.CreatePlanet(planet, index));
        this.CreateStarfield();
    }

    CreateSun({ scale, material }) {
        this.sun = Mesh.FromGeometry(
            PrimitiveMesh.Sphere(1, { widthSegments: 48, heightSegments: 24 }),
            new CelestialBodyMaterial({ name: "SunShader", ...material }),
            { name: "Sun", castShadow: false, receiveShadow: false },
        );
        this.sun.transform.SetScale(scale);
        this.scene.Add(this.sun);
    }

    CreatePlanet(data, index) {
        const mesh = Mesh.FromGeometry(
            PrimitiveMesh.Sphere(1, { widthSegments: 40, heightSegments: 20 }),
            new CelestialBodyMaterial({
                name: `${data.name}Material`,
                baseColor: data.colors[0],
                secondaryColor: data.colors[1],
                atmosphereColor: data.atmosphere ?? data.colors[0],
                nightColor: [data.colors[0][0] * 0.1, data.colors[0][1] * 0.1, data.colors[0][2] * 0.1],
                cloudStrength: data.cloud ?? 0.0,
                atmosphereStrength: data.atmosphere ? 0.7 : 0.0,
                seed: data.seed,
                albedoMap: data.textureMap ? AssetManager.instance?.GetImage(data.textureMap) : null,
            }),
            { name: data.name, castShadow: true, receiveShadow: true },
        );
        mesh.transform.SetScale(data.radius);
        mesh.transform.rotation.z = data.tilt ?? 0;
        this.scene.Add(mesh);

        const orbitThickness = data.orbit > 50 ? 0.3 : 0.05;
        const orbit = Mesh.FromGeometry(
            PrimitiveMesh.Ring(data.orbit - orbitThickness, data.orbit + orbitThickness, { segments: 240 }),
            new UnlitMaterial({ color: [0.32, 0.42, 0.58, 0.24], transparent: true }),
            { name: `${data.name}Orbit`, castShadow: false, receiveShadow: false },
        );
        orbit.transform.rotation.x = data.inclination ?? 0;
        this.scene.Add(orbit);

        let ring = null;
        if (data.ring) {
            ring = Mesh.FromGeometry(
                PrimitiveMesh.Ring(1.4, 2.2, { segments: 160 }),
                new UnlitMaterial({ color: [0.82, 0.72, 0.52, 0.65], transparent: true }),
                { name: "SaturnRings", castShadow: false, receiveShadow: false },
            );
            ring.transform.SetScale(data.radius);
            ring.transform.rotation.z = data.tilt ?? 0;
            this.scene.Add(ring);
        }

        this.planets.push({ ...data, mesh, ring, angle: index * 0.72 });

        if (data.name === "Terra") {
            const moon = Mesh.FromGeometry(
                PrimitiveMesh.Sphere(0.14, { widthSegments: 24, heightSegments: 12 }),
                new CelestialBodyMaterial({
                    baseColor: [0.62, 0.62, 0.58],
                    secondaryColor: [0.28, 0.28, 0.26],
                    atmosphereStrength: 0.08,
                    cloudStrength: 0,
                    seed: 41,
                }),
                { name: "Lua" },
            );
            this.scene.Add(moon);
            this.moon = { mesh: moon, parent: mesh, angle: 0 };
        }
    }

    CreateStarfield() {
        this.stars = [];
        for (let i = 0; i < 300; i++) {
            const radius = 250 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const size = 0.018 + Math.random() * 0.04;
            const star = Mesh.FromGeometry(
                PrimitiveMesh.Cube(1),
                new UnlitMaterial({ color: [0.72 + Math.random() * 0.28, 0.78 + Math.random() * 0.2, 1, 1] }),
                { name: `Star_${i}`, castShadow: false, receiveShadow: false },
            );
            star.transform.SetPosition(
                Math.sin(phi) * Math.cos(theta) * radius,
                Math.cos(phi) * radius * 0.55,
                Math.sin(phi) * Math.sin(theta) * radius,
            );
            star.transform.SetScale(size);
            this.scene.Add(star);
            this.stars.push(star);
        }
    }

    Bodies() {
        return [
            { name: 'Sun', mesh: this.sun, radius: 5.5, facts: 'G-type star / 99.86% of system mass' },
            ...this.planets.map((body, i) => ({ ...body, facts: physical[i][0].toLocaleString() + ' km diameter / ' + physical[i][1].toLocaleString() + ' day orbit' })),
            ...(this.moon ? [{ name: 'Moon', mesh: this.moon.mesh, radius: 0.1, facts: '3,475 km diameter / 27.3 day Earth orbit' }] : []),
        ];
    }

    SelectBody(index) {
        if (index === this.focus) return;
        this.focus = index;
        this.lastTarget = null;
        this.sound.Play('select');
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        if (ActionManager.IsActionDown('HELP')) {
            this.help.Toggle();
            this.sound.Play('select');
        }
        if (this.help.visible) return;
        const delta = dt || 0.016;
        this.time += delta;

        if (ActionManager.IsAction("LEFT")) this.cameraYaw -= delta * 0.75;
        if (ActionManager.IsAction("RIGHT")) this.cameraYaw += delta * 0.75;
        if (ActionManager.IsAction("UP")) this.cameraDistance = Math.max(8, this.cameraDistance - delta * this.cameraDistance * 0.8);
        if (ActionManager.IsAction("DOWN")) this.cameraDistance = Math.min(320, this.cameraDistance + delta * this.cameraDistance * 0.8);
        if (ActionManager.IsActionDown("CANCEL")) this.SelectBody(-1);
        if (ActionManager.IsActionDown("FOCUS_NEXT")) this.SelectBody((this.focus + 2) % (this.Bodies().length + 1) - 1);

        this.sun.transform.rotation.y += delta * 0.2;

        this.planets.forEach(planet => {
            planet.angle += delta * planet.speed;
            const inc = planet.inclination ?? 0;
            const r = planet.orbit;
            const x = Math.cos(planet.angle) * r;
            const zPlane = Math.sin(planet.angle) * r;

            // Apply inclination to Y axis
            const y = -zPlane * Math.sin(inc);
            const z = zPlane * Math.cos(inc);

            planet.mesh.transform.SetPosition(x, y, z);
            planet.mesh.transform.rotation.y += delta * planet.rotation;

            if (planet.ring) {
                planet.ring.transform.position = [...planet.mesh.transform.position];
                planet.ring.transform.rotation.y += delta * 0.08;
            }
        });

        if (this.moon) {
            this.moon.angle += delta * 1.8;
            const parent = Vector3D.FromArray(this.moon.parent.transform.position);
            this.moon.mesh.transform.SetPosition(
                parent.x + Math.cos(this.moon.angle) * 0.96,
                0.08,
                parent.z + Math.sin(this.moon.angle) * 0.96,
            );
        }

        const yaw = this.cameraYaw + this.time * 0.035;
        const bodies = this.Bodies();
        const body = bodies[this.focus];
        const target = body ? Vector3D.FromArray(body.mesh.transform.position) : new Vector3D();
        const blend = 1 - Math.exp(-delta * 5);
        // Carry the rig with its target, then ease only the remaining framing offset.
        const motion = this.lastTarget ? target.Subtract(this.lastTarget) : new Vector3D();
        this.lastTarget = target;
        this.look.Copy(Vector3D.Lerp(this.look.Add(motion), target, blend));
        const zoom = body ? Math.max(0.65, body.radius * 4) : this.cameraDistance;
        const desired = [
            this.look.x + Math.sin(yaw) * zoom,
            this.look.y + (body ? zoom * 0.35 : 13.5),
            this.look.z + Math.cos(yaw) * zoom,
        ];
        const followed = Vector3D.FromArray(this.camera.position).Add(motion).ToArray();
        this.camera.SetPosition(...desired.map((value, i) => followed[i] + (value - followed[i]) * blend));
        this.camera.LookAt(this.look.ToArray());
        const mouse = Input.instance?.mouse;
        const screen = this.ui.Screen;
        const contact = Input.instance?.touch.GetStartedTouches()[0];
        const point = contact ? Touch.ToScreen(contact.startPosition, screen)
            : mouse?.buttonsDown[0] ? mouse.getPositionRelative(screen.Canvas) : null;
        const menu = this.focusButton.rect;
        if (point && !(point.x >= menu.x && point.x <= menu.x + menu.width && point.y >= menu.y && point.y <= menu.y + menu.height)) {
            const hits = bodies.map((candidate, index) => {
                const p = this.camera.Project(Vector3D.FromArray(candidate.mesh.transform.position), screen.Width, screen.Height);
                return { index, depth: p.depth, hit: p.visible && Math.hypot(point.x - p.x, point.y - p.y) < 25 };
            }).filter(item => item.hit).sort((a, b) => a.depth - b.depth);
            if (hits.length) this.SelectBody(hits[0].index);
        }
    }

    OnGUI() {
        super.OnGUI();
        if (!this.ui) return;

        const draw = this.ui.Draw;
        const ctx = draw.screen.Context;

        ctx.save();
        ctx.globalAlpha = 0.45;
        draw.Color = "#02030A";
        draw.DrawRect(16, 14, 330, 86);
        ctx.restore();

        draw.SetTextAlign("left");
        draw.Color = "#FFD98A";
        draw.Font = "Arial";
        draw.FontSize = "22px";
        draw.DrawText("Sistema Solar - Render3D", 28, 46);
        draw.Color = "#DDE7FF";
        draw.FontSize = "14px";
        this.help.DrawAction('HELP',28,56);
        const w = this.ui.Screen.Width, h = this.ui.Screen.Height;
        const width = Math.min(290, w - 24);
        const x = w - width - 12, y = h - 92;
        const body = this.Bodies()[this.focus];
        this.focusFrame.Panel({ x, y, width, height: 80 });
        this.focusFrame.Text(body?.name ?? 'System overview', x + 12, y + 21, { size: 16, weight: 700 });
        this.focusFrame.Text(body?.facts ?? 'Select a body in the view', x + 12, y + 41, { maxWidth: width - 24 });
        this.focusButton.SetButton({ x, y: y + 46, width, height: 34 });
        this.focusFrame.Text('Next body', x + 12, y + 65, { color: this.focusFrame.theme.gold });
        this.help.OnDrawn();
    }
    OnExit() { this.focusButton?.Dispose(); this.help?.Dispose(); super.OnExit(); }
}
