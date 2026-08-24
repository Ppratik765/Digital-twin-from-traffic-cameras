import * as THREE from 'three';

export class DigitalTwinEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.materials = {
      grass: new THREE.MeshStandardMaterial({ color: 0x4a6e42, roughness: 0.9, metalness: 0.05 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.85, metalness: 0.1 }),
      concrete: new THREE.MeshStandardMaterial({ color: 0x8a929a, roughness: 0.8, metalness: 0.05 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: 0x9fa6ad, roughness: 0.85, metalness: 0.05 }),
      whiteMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      yellowMarking: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
      gantryMetal: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 }),
      signalHousing: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 }),
      redLight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.8 }),
      yellowLight: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.2 }),
      greenLight: new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9 }),
      woodPole: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 }),
      houseWall1: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 }), // White siding
      houseWall2: new THREE.MeshStandardMaterial({ color: 0xd6cbb8, roughness: 0.8 }), // Beige siding
      houseWall3: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }), // Slate siding
      houseRoof: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }),  // Shingle roof
      trunk: new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 }),
      foliage1: new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 }),
      foliage2: new THREE.MeshStandardMaterial({ color: 0x3b7233, roughness: 0.8 }),
      foliage3: new THREE.MeshStandardMaterial({ color: 0x4c8c43, roughness: 0.8 })
    };

    this.buildLandscape();
    this.buildRoadNetwork();
    this.buildCrosswalks();
    this.buildTrafficSignals();
    this.buildSuburbanHouses();
    this.buildTrees();
    this.buildUtilityPoles();
  }

  buildLandscape() {
    // Massive 800m x 800m natural ground plane
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  buildRoadNetwork() {
    // 1. Central base underneath intersection
    const centerBaseGeo = new THREE.PlaneGeometry(100, 100);
    const centerBase = new THREE.Mesh(centerBaseGeo, this.materials.asphalt);
    centerBase.rotation.x = -Math.PI / 2;
    centerBase.position.set(0, -0.02, 0);
    centerBase.receiveShadow = true;
    this.group.add(centerBase);

    // 2. West Road (Left, -X) - 4-lane crossroad extending to -300m
    const westLen = 250;
    const crossroadWidth = 28;
    const westRoad = new THREE.Mesh(new THREE.PlaneGeometry(westLen, crossroadWidth), this.materials.asphalt);
    westRoad.rotation.x = -Math.PI / 2;
    westRoad.position.set(-50 - westLen / 2, 0, 0);
    westRoad.receiveShadow = true;
    this.group.add(westRoad);

    // 3. East Road (Right, +X) - 4-lane crossroad extending to +300m
    const eastRoad = new THREE.Mesh(new THREE.PlaneGeometry(westLen, crossroadWidth), this.materials.asphalt);
    eastRoad.rotation.x = -Math.PI / 2;
    eastRoad.position.set(50 + westLen / 2, 0, 0);
    eastRoad.receiveShadow = true;
    this.group.add(eastRoad);

    // 4. North Road (Far / Uphill, -Z) - 2-lane road with double yellow lines extending to -300m
    const northLen = 250;
    const northWidth = 16;
    const northRoad = new THREE.Mesh(new THREE.PlaneGeometry(northWidth, northLen), this.materials.asphalt);
    northRoad.rotation.x = -Math.PI / 2;
    northRoad.position.set(0, 0, -50 - northLen / 2);
    northRoad.receiveShadow = true;
    this.group.add(northRoad);

    // 5. South Road (Foreground, +Z) - 2-lane road extending to +200m
    const southLen = 150;
    const southRoad = new THREE.Mesh(new THREE.PlaneGeometry(northWidth, southLen), this.materials.asphalt);
    southRoad.rotation.x = -Math.PI / 2;
    southRoad.position.set(0, 0, 50 + southLen / 2);
    southRoad.receiveShadow = true;
    this.group.add(southRoad);

    // --- Road Markings ---
    // Double yellow lines on North road
    this.createStrip(0.15, northLen, 0x01, -0.2, -50 - northLen / 2, this.materials.yellowMarking);
    this.createStrip(0.15, northLen, 0x01, 0.2, -50 - northLen / 2, this.materials.yellowMarking);

    // Double yellow lines on South road
    this.createStrip(0.15, southLen, 0x01, -0.2, 50 + southLen / 2, this.materials.yellowMarking);
    this.createStrip(0.15, southLen, 0x01, 0.2, 50 + southLen / 2, this.materials.yellowMarking);

    // White dashed lane dividers on West & East roads
    for (let x = -60; x > -290; x -= 10) {
      this.createStrip(5, 0.2, 0.01, x, -4.5, this.materials.whiteMarking);
      this.createStrip(5, 0.2, 0.01, x, 4.5, this.materials.whiteMarking);
      this.createStrip(5, 0.3, 0.01, x, 0, this.materials.yellowMarking);
    }
    for (let x = 60; x < 290; x += 10) {
      this.createStrip(5, 0.2, 0.01, x, -4.5, this.materials.whiteMarking);
      this.createStrip(5, 0.2, 0.01, x, 4.5, this.materials.whiteMarking);
      this.createStrip(5, 0.3, 0.01, x, 0, this.materials.yellowMarking);
    }

    // White edge / shoulder lines
    this.createStrip(westLen, 0.25, 0.01, -50 - westLen / 2, -13.5, this.materials.whiteMarking);
    this.createStrip(westLen, 0.25, 0.01, -50 - westLen / 2, 13.5, this.materials.whiteMarking);
    this.createStrip(westLen, 0.25, 0.01, 50 + westLen / 2, -13.5, this.materials.whiteMarking);
    this.createStrip(westLen, 0.25, 0.01, 50 + westLen / 2, 13.5, this.materials.whiteMarking);

    this.createStrip(0.25, northLen, 0.01, -7.5, -50 - northLen / 2, this.materials.whiteMarking);
    this.createStrip(0.25, northLen, 0.01, 7.5, -50 - northLen / 2, this.materials.whiteMarking);
    this.createStrip(0.25, southLen, 0.01, -7.5, 50 + southLen / 2, this.materials.whiteMarking);
    this.createStrip(0.25, southLen, 0.01, 7.5, 50 + southLen / 2, this.materials.whiteMarking);

    // --- Curbs & Sidewalks ---
    this.buildSidewalk(-50 - westLen / 2, -16.5, westLen, 4);
    this.buildSidewalk(-50 - westLen / 2, 16.5, westLen, 4);
    this.buildSidewalk(50 + westLen / 2, -16.5, westLen, 4);
    this.buildSidewalk(50 + westLen / 2, 16.5, westLen, 4);

    this.buildSidewalk(-10.5, -50 - northLen / 2, 4, northLen);
    this.buildSidewalk(10.5, -50 - northLen / 2, 4, northLen);
    this.buildSidewalk(-10.5, 50 + southLen / 2, 4, southLen);
    this.buildSidewalk(10.5, 50 + southLen / 2, 4, southLen);
  }

  createStrip(width, length, yOffset, x, z, material) {
    const geo = new THREE.PlaneGeometry(width, length);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, yOffset, z);
    this.group.add(mesh);
    return mesh;
  }

  buildSidewalk(x, z, width, length) {
    const curbHeight = 0.25;
    const geo = new THREE.BoxGeometry(width, curbHeight, length);
    const mesh = new THREE.Mesh(geo, this.materials.sidewalk);
    mesh.position.set(x, curbHeight / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    this.group.add(mesh);
  }

  buildCrosswalks() {
    // Crosswalk zebra stripes at 4 entrances
    // West Entrance (x = -48)
    for (let z = -12; z <= 12; z += 2.5) {
      this.createStrip(3, 1.2, 0.01, -48, z, this.materials.whiteMarking);
    }
    // East Entrance (x = 48)
    for (let z = -12; z <= 12; z += 2.5) {
      this.createStrip(3, 1.2, 0.01, 48, z, this.materials.whiteMarking);
    }
    // North Entrance (z = -48)
    for (let x = -6; x <= 6; x += 2.5) {
      this.createStrip(1.2, 3, 0.01, x, -48, this.materials.whiteMarking);
    }
    // South Entrance (z = 48)
    for (let x = -6; x <= 6; x += 2.5) {
      this.createStrip(1.2, 3, 0.01, x, 48, this.materials.whiteMarking);
    }
  }

  buildTrafficSignals() {
    // 1. Main Overhead Steel Gantry (spanning across north intersection entrance at Z = -46)
    const gantryGroup = new THREE.Group();

    // Vertical Mast Pole (Left sidewalk, X = -14, Z = -46)
    const poleGeo = new THREE.CylinderGeometry(0.35, 0.45, 10, 16);
    const pole = new THREE.Mesh(poleGeo, this.materials.gantryMetal);
    pole.position.set(-14, 5, -46);
    pole.castShadow = true;
    gantryGroup.add(pole);

    // Horizontal Mast Arm extending over intersection (Length: 26m from X = -14 to X = 12)
    const armGeo = new THREE.CylinderGeometry(0.2, 0.3, 26, 16);
    const arm = new THREE.Mesh(armGeo, this.materials.gantryMetal);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-1, 9.2, -46);
    arm.castShadow = true;
    gantryGroup.add(arm);

    // Traffic Signal Heads suspended over each lane
    const signalPositions = [-8, -2, 4, 10];
    signalPositions.forEach(xPos => {
      const signalHead = this.createSignalHead();
      signalHead.position.set(xPos, 8.2, -46);
      gantryGroup.add(signalHead);
    });

    // Secondary Traffic Light Pole on Southeast corner (X = 14, Z = 46)
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 7, 16), this.materials.gantryMetal);
    pole2.position.set(14, 3.5, 46);
    pole2.castShadow = true;
    gantryGroup.add(pole2);
    const sig2 = this.createSignalHead();
    sig2.rotation.y = Math.PI;
    sig2.position.set(14, 5.5, 46);
    gantryGroup.add(sig2);

    // Traffic Controller Aluminum Cabinet (on Southwest corner sidewalk)
    const cabinetGeo = new THREE.BoxGeometry(1.2, 1.8, 0.9);
    const cabinet = new THREE.Mesh(cabinetGeo, this.materials.gantryMetal);
    cabinet.position.set(-18, 0.9, -42);
    cabinet.castShadow = true;
    gantryGroup.add(cabinet);

    this.group.add(gantryGroup);
  }

  createSignalHead() {
    const headGroup = new THREE.Group();

    // Black housing
    const boxGeo = new THREE.BoxGeometry(0.8, 2.2, 0.5);
    const box = new THREE.Mesh(boxGeo, this.materials.signalHousing);
    box.castShadow = true;
    headGroup.add(box);

    // Red light (top)
    const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.redLight);
    redLens.rotation.x = Math.PI / 2;
    redLens.position.set(0, 0.65, 0.25);
    headGroup.add(redLens);

    // Yellow light (mid)
    const yellowLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.yellowLight);
    yellowLens.rotation.x = Math.PI / 2;
    yellowLens.position.set(0, 0, 0.25);
    headGroup.add(yellowLens);

    // Green light (bottom)
    const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.greenLight);
    greenLens.rotation.x = Math.PI / 2;
    greenLens.position.set(0, -0.65, 0.25);
    headGroup.add(greenLens);

    return headGroup;
  }

  buildSuburbanHouses() {
    const houseConfigs = [
      // Along North road (far hill, left & right)
      { x: -35, z: -90, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall1 },
      { x: 35, z: -95, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall2 },
      { x: -38, z: -160, rot: Math.PI / 2, scale: 1.3, mat: this.materials.houseWall3 },
      { x: 40, z: -170, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall1 },
      { x: -35, z: -230, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall2 },
      { x: 42, z: -240, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall3 },

      // Along West road
      { x: -90, z: -35, rot: 0, scale: 1.2, mat: this.materials.houseWall2 },
      { x: -160, z: -35, rot: 0, scale: 1.3, mat: this.materials.houseWall1 },
      { x: -230, z: -38, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: -90, z: 35, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall1 },
      { x: -170, z: 38, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall2 },
      { x: -240, z: 35, rot: Math.PI, scale: 1.3, mat: this.materials.houseWall1 },

      // Along East road
      { x: 95, z: -36, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: 170, z: -38, rot: 0, scale: 1.1, mat: this.materials.houseWall2 },
      { x: 240, z: -35, rot: 0, scale: 1.3, mat: this.materials.houseWall1 },
      { x: 90, z: 36, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall1 },
      { x: 165, z: 38, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall3 },
      { x: 235, z: 35, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall2 }
    ];

    houseConfigs.forEach(cfg => {
      const house = this.createHouse(cfg.scale, cfg.mat);
      house.position.set(cfg.x, 0, cfg.z);
      house.rotation.y = cfg.rot;
      this.group.add(house);
    });
  }

  createHouse(scale = 1.0, wallMaterial) {
    const house = new THREE.Group();
    const w = 12 * scale;
    const h = 5 * scale;
    const d = 10 * scale;

    // Walls
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(wallGeo, wallMaterial);
    wall.position.y = h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    // Gabled Roof
    const roofH = 3.5 * scale;
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.houseRoof);
    roof.position.y = h + roofH / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Chimney
    const chimGeo = new THREE.BoxGeometry(1.2 * scale, 3 * scale, 1.2 * scale);
    const chim = new THREE.Mesh(chimGeo, this.materials.gantryMetal);
    chim.position.set(w * 0.25, h + roofH * 0.6, 0);
    chim.castShadow = true;
    house.add(chim);

    // Front Door & Windows
    const doorGeo = new THREE.PlaneGeometry(1.6 * scale, 2.8 * scale);
    const door = new THREE.Mesh(doorGeo, this.materials.woodPole);
    door.position.set(0, 1.4 * scale, d / 2 + 0.05);
    house.add(door);

    const winGeo = new THREE.PlaneGeometry(1.8 * scale, 1.8 * scale);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(-3.5 * scale, 2.5 * scale, d / 2 + 0.05);
    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(3.5 * scale, 2.5 * scale, d / 2 + 0.05);
    house.add(win1);
    house.add(win2);

    return house;
  }

  buildTrees() {
    // Generate realistic trees along roads, lawns and surrounding background
    const treePositions = [
      // Southwest lawn corner (matches trees in video left foreground)
      [-22, -26], [-28, -20], [-35, -28], [-42, -22], [-48, -32],
      [-26, 26], [-34, 22], [-42, 30], [-55, 24],

      // Southeast lawn corner
      [25, 25], [32, 28], [42, 24], [55, 30], [28, -25], [36, -28], [48, -24],

      // Along North hill road (matching distant trees in video)
      [-16, -65], [-20, -110], [-18, -145], [-22, -190], [-25, -240], [-20, -280],
      [16, -68], [22, -115], [19, -150], [24, -195], [22, -245], [26, -285],

      // Distant tree clusters
      [-60, -80], [-80, -120], [-100, -160], [-70, -220],
      [65, -85], [85, -130], [105, -170], [75, -230],

      // Along West road
      [-80, -22], [-120, -22], [-150, -24], [-190, -22], [-230, -24], [-270, -22],
      [-80, 24], [-120, 24], [-155, 22], [-195, 24], [-235, 22], [-275, 24],

      // Along East road
      [80, -22], [120, -24], [155, -22], [195, -24], [235, -22], [275, -24],
      [80, 24], [120, 22], [150, 24], [190, 22], [230, 24], [270, 22]
    ];

    treePositions.forEach((pos, idx) => {
      const scale = 0.8 + ((idx * 17) % 7) * 0.1;
      const foliageMat = idx % 3 === 0 ? this.materials.foliage1 : (idx % 3 === 1 ? this.materials.foliage2 : this.materials.foliage3);
      const isPine = idx % 4 === 0;

      const tree = isPine ? this.createPineTree(scale, foliageMat) : this.createDeciduousTree(scale, foliageMat);
      tree.position.set(pos[0], 0, pos[1]);
      this.group.add(tree);
    });
  }

  createDeciduousTree(scale = 1.0, foliageMat) {
    const tree = new THREE.Group();

    // Trunk
    const trunkH = 3.5 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Multi-sphere / faceted canopy
    const canopyRadius = 2.8 * scale;
    const canopyGeo = new THREE.DodecahedronGeometry(canopyRadius, 1);
    const canopy = new THREE.Mesh(canopyGeo, foliageMat);
    canopy.position.y = trunkH + canopyRadius * 0.75;
    canopy.castShadow = true;
    tree.add(canopy);

    return tree;
  }

  createPineTree(scale = 1.0, foliageMat) {
    const tree = new THREE.Group();

    // Trunk
    const trunkH = 2.5 * scale;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, trunkH, 8), this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // 3 tiered cones
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const r = (2.6 - i * 0.6) * scale;
      const h = (3.2 - i * 0.5) * scale;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), foliageMat);
      cone.position.y = trunkH + (i * 1.8 + 1.2) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }

    return tree;
  }

  buildUtilityPoles() {
    // Wooden utility poles along the road corridors
    const polePositions = [
      [-45, -20], [-100, -20], [-160, -20], [-220, -20], [-280, -20],
      [45, -20], [100, -20], [160, -20], [220, -20], [280, -20],
      [-15, -90], [-15, -160], [-15, -230]
    ];

    polePositions.forEach(pos => {
      const poleGroup = new THREE.Group();
      const h = 11;

      // Vertical wooden pole
      const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, h, 8), this.materials.woodPole);
      poleMesh.position.y = h / 2;
      poleMesh.castShadow = true;
      poleGroup.add(poleMesh);

      // Horizontal cross-arm
      const armMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.2), this.materials.woodPole);
      armMesh.position.set(0, h - 0.8, 0);
      poleGroup.add(armMesh);

      poleGroup.position.set(pos[0], 0, pos[1]);
      this.group.add(poleGroup);
    });
  }
}
