import * as THREE from 'three';

export class DigitalTwinEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.materials = {
      asphalt: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0.1 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x3d5e3a, roughness: 1.0, metalness: 0.0 }),
      line: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      yellowLine: new THREE.MeshBasicMaterial({ color: 0xeab308 }),
      pole: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.8 }),
      lightHousing: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }),
      redLight: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }),
      greenLight: new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1 }),
      yellowLight: new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 1 }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 }),
      leaves: new THREE.MeshStandardMaterial({ color: 0x4d5c41, roughness: 0.8 }) // Assuming some foliage or just bare trees, let's use dark greens
    };

    this.buildRoads();
    this.buildTerrain();
    this.buildTrafficLights();
    this.buildTrees();
  }

  buildRoads() {
    // Main East-West Road
    const ewRoad = new THREE.Mesh(new THREE.PlaneGeometry(200, 30), this.materials.asphalt);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.receiveShadow = true;
    this.scene.add(ewRoad);

    // North-South Road
    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(30, 200), this.materials.asphalt);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.y = 0.01; // prevent z-fighting
    nsRoad.receiveShadow = true;
    this.scene.add(nsRoad);

    // Road Markings (Yellow Double Lines)
    const lineGeo = new THREE.PlaneGeometry(200, 0.4);
    const ewLine = new THREE.Mesh(lineGeo, this.materials.yellowLine);
    ewLine.rotation.x = -Math.PI / 2;
    ewLine.position.y = 0.02;
    this.scene.add(ewLine);

    const nsLine = new THREE.Mesh(lineGeo, this.materials.yellowLine);
    nsLine.rotation.x = -Math.PI / 2;
    nsLine.rotation.z = Math.PI / 2;
    nsLine.position.y = 0.03;
    this.scene.add(nsLine);

    // Stop lines
    const stopGeo = new THREE.PlaneGeometry(15, 0.8);
    const pos = [
      { x: -16, z: 7.5, r: 0 },
      { x: 16, z: -7.5, r: 0 },
      { x: 7.5, z: 16, r: Math.PI / 2 },
      { x: -7.5, z: -16, r: Math.PI / 2 },
    ];
    pos.forEach(p => {
      const stopLine = new THREE.Mesh(stopGeo, this.materials.line);
      stopLine.rotation.x = -Math.PI / 2;
      stopLine.rotation.z = p.r;
      stopLine.position.set(p.x, 0.04, p.z);
      this.scene.add(stopLine);
    });
  }

  buildTerrain() {
    // 4 Grass corners
    const size = 85;
    const offset = 15 + size / 2;
    
    const corners = [
      { x: offset, z: offset },
      { x: offset, z: -offset },
      { x: -offset, z: offset },
      { x: -offset, z: -offset }
    ];

    corners.forEach(p => {
      const grass = new THREE.Mesh(new THREE.PlaneGeometry(size, size), this.materials.grass);
      grass.rotation.x = -Math.PI / 2;
      grass.position.set(p.x, 0.0, p.z);
      grass.receiveShadow = true;
      this.scene.add(grass);
    });
  }

  buildTrafficLights() {
    // 4 Poles at corners
    const corners = [
      { x: 18, z: 18, r: Math.PI },
      { x: 18, z: -18, r: Math.PI / 2 },
      { x: -18, z: 18, r: -Math.PI / 2 },
      { x: -18, z: -18, r: 0 }
    ];

    corners.forEach(c => {
      const group = new THREE.Group();
      
      // Pole
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, 12);
      const pole = new THREE.Mesh(poleGeo, this.materials.pole);
      pole.position.y = 6;
      pole.castShadow = true;
      group.add(pole);

      // Arm
      const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 10);
      const arm = new THREE.Mesh(armGeo, this.materials.pole);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(5, 11.5, 0);
      arm.castShadow = true;
      group.add(arm);

      // Light Box
      const boxGeo = new THREE.BoxGeometry(1, 3, 1);
      const box = new THREE.Mesh(boxGeo, this.materials.lightHousing);
      box.position.set(9, 10.5, 0);
      box.castShadow = true;
      group.add(box);

      // Lights (Red, Yellow, Green)
      const lGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
      
      const red = new THREE.Mesh(lGeo, this.materials.redLight);
      red.rotation.x = Math.PI / 2;
      red.position.set(9, 11.5, 0.5);
      group.add(red);

      const yellow = new THREE.Mesh(lGeo, this.materials.yellowLight);
      yellow.rotation.x = Math.PI / 2;
      yellow.position.set(9, 10.5, 0.5);
      group.add(yellow);

      const green = new THREE.Mesh(lGeo, this.materials.greenLight);
      green.rotation.x = Math.PI / 2;
      green.position.set(9, 9.5, 0.5);
      group.add(green);

      group.position.set(c.x, 0, c.z);
      group.rotation.y = c.r;
      this.scene.add(group);
    });
  }

  buildTrees() {
    // Add some random procedural trees along the sides
    const positions = [
      [25, 25], [40, 20], [60, 28], [25, 60],
      [-25, -25], [-40, -20], [-60, -28], [-25, -60],
      [-25, 25], [-40, 20], [-60, 28], [-25, 60],
      [25, -25], [40, -20], [60, -28], [25, -60]
    ];

    positions.forEach(p => {
      const tree = new THREE.Group();
      
      const tHeight = 6 + Math.random() * 4;
      const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, tHeight);
      const trunk = new THREE.Mesh(trunkGeo, this.materials.trunk);
      trunk.position.y = tHeight / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Low poly canopy
      const cGeo = new THREE.IcosahedronGeometry(3 + Math.random() * 2, 0);
      const canopy = new THREE.Mesh(cGeo, this.materials.leaves);
      canopy.position.y = tHeight;
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      // Slight random rotation for variety
      canopy.rotation.set(Math.random(), Math.random(), Math.random());
      tree.add(canopy);

      tree.position.set(p[0] + (Math.random()*4-2), 0, p[1] + (Math.random()*4-2));
      this.scene.add(tree);
    });
  }
}
