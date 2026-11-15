import { Mesh, PrimitiveMesh, StandardMaterial, UnlitMaterial } from 'gameforgejs/3d';

export class TrailGoal {
    constructor(scene, definition) {
        this.scene = scene;
        this.definition = definition;
        this.meshes = [];
        this.CreateGoal();
    }

    CreateGoal() {
        const goal = this.definition;
        this.goalRingMaterial = new UnlitMaterial({ name: "GoalRing", color: [1, 0.48, 0.2, 1] });
        this.goalFlagMaterial = new UnlitMaterial({ name: "GoalFlag", color: [1, 0.42, 0.22, 1] });
        this.goalBeaconMaterial = new StandardMaterial({
            name: "GoalBeacon",
            albedoColor: [1, 0.48, 0.2, 1],
            emissiveColor: [0.3, 0.05, 0.01],
            roughness: 0.28,
        });

        const pole = Mesh.FromGeometry(
            PrimitiveMesh.Cube(),
            new StandardMaterial({ name: "GoalPole", albedoColor: [0.92, 0.96, 1, 1], metallic: 0.3 }),
            { name: "GoalPole", castShadow: true, receiveShadow: true },
        );
        pole.transform.SetPosition(...goal.pole.position.ToArray()).SetScale(...goal.pole.scale.ToArray());
        this.scene.Add(pole);
        this.meshes.push(pole);

        this.goalFlag = Mesh.FromGeometry(
            PrimitiveMesh.Cube(),
            this.goalFlagMaterial,
            { name: "GoalFlag", castShadow: false, receiveShadow: false },
        );
        this.goalFlag.transform.SetPosition(...goal.flag.position.ToArray()).SetScale(...goal.flag.scale.ToArray());
        this.scene.Add(this.goalFlag);
        this.meshes.push(this.goalFlag);

        this.goalRing = Mesh.FromGeometry(
            PrimitiveMesh.Ring(goal.ring.innerRadius, goal.ring.outerRadius, { segments: 48 }),
            this.goalRingMaterial,
            { name: "GoalRing", castShadow: false, receiveShadow: false },
        );
        this.goalRing.transform.SetPosition(...goal.trigger.AddValue(goal.ring.offset).ToArray());
        this.scene.Add(this.goalRing);
        this.meshes.push(this.goalRing);

        this.goalBeacon = Mesh.FromGeometry(
            PrimitiveMesh.Sphere(goal.beacon.radius, { widthSegments: 20, heightSegments: 10 }),
            this.goalBeaconMaterial,
            { name: "GoalBeacon", castShadow: false, receiveShadow: false },
        );
        this.goalBeacon.transform.SetPosition(...goal.trigger.AddValue(goal.beacon.offset).ToArray());
        this.scene.Add(this.goalBeacon);
        this.meshes.push(this.goalBeacon);
        this.SetGoalUnlocked(false);
    }

    SetGoalUnlocked(unlocked) {
        this.goalUnlocked = unlocked;
        this.goalRingMaterial.albedoColor = unlocked ? [0.2, 1, 0.44, 1] : [1, 0.43, 0.2, 1];
        this.goalFlagMaterial.albedoColor = unlocked ? [0.18, 0.95, 0.42, 1] : [1, 0.36, 0.16, 1];
        this.goalBeaconMaterial.albedoColor = unlocked ? [0.28, 1, 0.45, 1] : [1, 0.45, 0.15, 1];
        this.goalBeaconMaterial.emissiveColor = unlocked ? [0.08, 0.38, 0.13] : [0.28, 0.06, 0.01];
    }

    Update(time) {
        const goal = this.definition;
        const pulse = 1 + Math.sin(time * 4) * 0.09;
        this.goalRing.transform.SetScale(pulse, 1, pulse);
        this.goalBeacon.transform.position[1] = goal.trigger.y + goal.beacon.offset.y
            + Math.sin(time * goal.beacon.bobSpeed) * goal.beacon.bobDistance;
    }

    OnDestroy() {
        for (const mesh of this.meshes) this.scene.Remove(mesh);
    }
}

