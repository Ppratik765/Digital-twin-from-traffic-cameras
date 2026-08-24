import * as THREE from 'three';

export class DigitalTwinEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Color palette calibrated to match real camera footage from CityFlow
    this.materials = {
      grass: new THREE.MeshStandardMaterial({ color: 0x3d5e34, roughness: 0.9, metalness: 0.05 }),
      concreteRoad: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.78, metalness: 0.08 }), // Concrete slab pavement
      concreteJoint: new THREE.MeshBasicMaterial({ color: 0x525b66 }), // Expansion slab joints
      sidewalk: new THREE.MeshStandardMaterial({ color: 0xc9d1d9, roughness: 0.85, metalness: 0.05 }),
      curb: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.7, metalness: 0.1 }),
      whiteMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      yellowMarking: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
      gantryMetal: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.85 }),
      signalHousing: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 }),
      redLight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.95 }),
      yellowLight: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.3 }),
      greenLight: new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.95 }),
      utilityBox: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.75 }),
      woodPole: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 }),
      houseWall1: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 }), // White vinyl siding
      houseWall2: new THREE.MeshStandardMaterial({ color: 0xd6cbb8, roughness: 0.75 }), // Warm beige siding
      houseWall3: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }),  // Slate blue siding
      houseWall4: new THREE.MeshStandardMaterial({ color: 0xb5c0ad, roughness: 0.75 }), // Sage green siding
      houseRoof: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.1 }), // Dark shingle roof
      trunk: new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 }),
      foliage1: new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 }),
      foliage2: new THREE.MeshStandardMaterial({ color: 0x3b7233, roughness: 0.8 }),
      foliage3: new THREE.MeshStandardMaterial({ color: 0x4c8c43, roughness: 0.8 })
    };

    this.buildLandscape();
    this.buildRoadNetwork();
    this.buildConcreteSlabJoints();
    this.buildCrosswalksAndMarkings();
    this.buildTrafficSignals();
    this.buildUtilityBoxes();
    this.buildSuburbanHouses();
    this.buildTrees();
    this.buildUtilityPoles();
  }

  buildLandscape() {
    // Massive continuous terrain plane (2000m x 2000m)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  buildRoadNetwork() {
    // 1. Main East-West Highway Corridor (Z in [-92, +32], Center Z = -30m, Width 124m, Length 1600m)
    const ewRoadGeo = new THREE.PlaneGeometry(1600, 124);
    const ewRoad = new THREE.Mesh(ewRoadGeo, this.materials.concreteRoad);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.position.set(0, 0.01, -30);
    ewRoad.receiveShadow = true;
    this.group.add(ewRoad);

    // 2. Intersecting North-South Arterial (X in [-42, +64], Center X = +11m, Width 106m, Length 1600m)
    const nsRoadGeo = new THREE.PlaneGeometry(106, 1600);
    const nsRoad = new THREE.Mesh(nsRoadGeo, this.materials.concreteRoad);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(11, 0.02, 0);
    nsRoad.receiveShadow = true;
    this.group.add(nsRoad);

    // 3. Sidewalks running along road perimeters
    const sidewalkMat = this.materials.sidewalk;
    const curbMat = this.materials.curb;
    const curbH = 0.2;
    const curbW = 0.4;

    // EW Sidewalks
    const swNorth = new THREE.Mesh(new THREE.PlaneGeometry(1600, 6), sidewalkMat);
    swNorth.rotation.x = -Math.PI / 2;
    swNorth.position.set(0, 0.08, -95);
    swNorth.receiveShadow = true;
    this.group.add(swNorth);

    const swSouth = new THREE.Mesh(new THREE.PlaneGeometry(1600, 6), sidewalkMat);
    swSouth.rotation.x = -Math.PI / 2;
    swSouth.position.set(0, 0.08, 35);
    swSouth.receiveShadow = true;
    this.group.add(swSouth);

    // NS Sidewalks
    const swWest = new THREE.Mesh(new THREE.PlaneGeometry(6, 1600), sidewalkMat);
    swWest.rotation.x = -Math.PI / 2;
    swWest.position.set(-45, 0.08, 0);
    swWest.receiveShadow = true;
    this.group.add(swWest);

    const swEast = new THREE.Mesh(new THREE.PlaneGeometry(6, 1600), sidewalkMat);
    swEast.rotation.x = -Math.PI / 2;
    swEast.position.set(67, 0.08, 0);
    swEast.receiveShadow = true;
    this.group.add(swEast);

    // 3D Raised Concrete Curbs
    const curbEW1 = new THREE.Mesh(new THREE.BoxGeometry(1600, curbH, curbW), curbMat);
    curbEW1.position.set(0, curbH / 2, -92);
    curbEW1.castShadow = true;
    this.group.add(curbEW1);

    const curbEW2 = new THREE.Mesh(new THREE.BoxGeometry(1600, curbH, curbW), curbMat);
    curbEW2.position.set(0, curbH / 2, 32);
    curbEW2.castShadow = true;
    this.group.add(curbEW2);

    const curbNS1 = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, 1600), curbMat);
    curbNS1.position.set(-42, curbH / 2, 0);
    curbNS1.castShadow = true;
    this.group.add(curbNS1);

    const curbNS2 = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, 1600), curbMat);
    curbNS2.position.set(64, curbH / 2, 0);
    curbNS2.castShadow = true;
    this.group.add(curbNS2);
  }

  buildConcreteSlabJoints() {
    const jointMat = this.materials.concreteJoint;
    const slabSpacing = 12.0;

    // Transverse slab lines
    for (let x = -200; x <= 200; x += slabSpacing) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 124), jointMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.03, -30);
      this.group.add(line);
    }

    // Longitudinal slab lines along lanes
    const zLines = [-75, -55, -35, -20, -5, 10, 25];
    zLines.forEach(z => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.12), jointMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.03, z);
      this.group.add(line);
    });
  }

  buildCrosswalksAndMarkings() {
    const wm = this.materials.whiteMarking;
    const ym = this.materials.yellowMarking;

    // 1. East-West Road Double Solid Yellow Divider Line (at Z = -20)
    const drawDoubleYellowEW = (xStart, xEnd, zPos) => {
      const len = Math.abs(xEnd - xStart);
      const xMid = (xStart + xEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.25), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xMid, 0.04, zPos - 0.3);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.25), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xMid, 0.04, zPos + 0.3);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowEW(-800, -45, -20);
    drawDoubleYellowEW(65, 800, -20);

    // 2. North-South Road Double Solid Yellow Divider Line (at X = +10)
    const drawDoubleYellowNS = (zStart, zEnd, xPos) => {
      const len = Math.abs(zEnd - zStart);
      const zMid = (zStart + zEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, len), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xPos - 0.3, 0.04, zMid);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, len), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xPos + 0.3, 0.04, zMid);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowNS(-800, -95, 10);
    drawDoubleYellowNS(35, 800, 10);

    // 3. Dashed White Lane Dividers
    const drawDashedLineEW = (xStart, xEnd, zPos) => {
      const step = 9;
      const dashLen = 4.5;
      for (let x = xStart; x <= xEnd; x += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, 0.22), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x + dashLen / 2, 0.04, zPos);
        this.group.add(dash);
      }
    };

    // Westbound lanes (Z = -45, Z = -65)
    drawDashedLineEW(-800, -45, -45);
    drawDashedLineEW(-800, -45, -65);
    drawDashedLineEW(65, 800, -45);
    drawDashedLineEW(65, 800, -65);

    // Eastbound lanes (Z = 0, Z = 15)
    drawDashedLineEW(-800, -45, 0);
    drawDashedLineEW(-800, -45, 15);
    drawDashedLineEW(65, 800, 0);
    drawDashedLineEW(65, 800, 15);

    const drawDashedLineNS = (zStart, zEnd, xPos) => {
      const step = 9;
      const dashLen = 4.5;
      for (let z = zStart; z <= zEnd; z += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, dashLen), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xPos, 0.04, z + dashLen / 2);
        this.group.add(dash);
      }
    };

    // Southbound lanes (X = -15, X = -30)
    drawDashedLineNS(-800, -95, -15);
    drawDashedLineNS(-800, -95, -30);
    drawDashedLineNS(35, 800, -15);
    drawDashedLineNS(35, 800, -30);

    // Northbound lanes (X = 30, X = 48)
    drawDashedLineNS(-800, -95, 30);
    drawDashedLineNS(-800, -95, 48);
    drawDashedLineNS(35, 800, 30);
    drawDashedLineNS(35, 800, 48);

    // 4. Stop Bars
    const drawStopBar = (x, z, width, length) => {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(width, length), wm);
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(x, 0.045, z);
      this.group.add(bar);
    };

    drawStopBar(-44, 6, 0.8, 50);   // West approach eastbound
    drawStopBar(64, -55, 0.8, 65);  // East approach westbound
    drawStopBar(-8, -94, 60, 0.8);  // North approach southbound
    drawStopBar(35, 34, 50, 0.8);   // South approach northbound

    // 5. Continental Crosswalks
    const drawCrosswalk = (center, width, height, isHorizontal) => {
      const count = Math.floor((isHorizontal ? height : width) / 4);
      for (let i = 0; i < count; i++) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(isHorizontal ? width : 1.2, isHorizontal ? 1.2 : height),
          wm
        );
        stripe.rotation.x = -Math.PI / 2;
        if (isHorizontal) {
          stripe.position.set(center.x, 0.045, center.z - height / 2 + i * 4 + 2);
        } else {
          stripe.position.set(center.x - width / 2 + i * 4 + 2, 0.045, center.z);
        }
        this.group.add(stripe);
      }
    };

    drawCrosswalk(new THREE.Vector3(-46, 0, -30), 5.0, 120, true);
    drawCrosswalk(new THREE.Vector3(66, 0, -30), 5.0, 120, true);
    drawCrosswalk(new THREE.Vector3(11, 0, -96), 104, 5.0, false);
    drawCrosswalk(new THREE.Vector3(11, 0, 36), 104, 5.0, false);
  }

  buildTrafficSignals() {
    // 4 Corner Overhanging Cantilever Gantries
    const signalConfigs = [
      { x: -44, z: -94, rotY: 0, armLen: 22 },
      { x: 64, z: 34, rotY: Math.PI, armLen: 22 },
      { x: -44, z: 34, rotY: -Math.PI / 2, armLen: 26 },
      { x: 64, z: -94, rotY: Math.PI / 2, armLen: 26 }
    ];

    signalConfigs.forEach(cfg => {
      const gantry = new THREE.Group();
      const mastH = 9.5;

      // Vertical steel mast
      const poleGeo = new THREE.CylinderGeometry(0.35, 0.5, mastH, 16);
      const pole = new THREE.Mesh(poleGeo, this.materials.gantryMetal);
      pole.position.y = mastH / 2;
      pole.castShadow = true;
      gantry.add(pole);

      // Cantilever arm
      const armGeo = new THREE.CylinderGeometry(0.2, 0.3, cfg.armLen, 16);
      const arm = new THREE.Mesh(armGeo, this.materials.gantryMetal);
      arm.rotation.z = -Math.PI / 2;
      arm.position.set(cfg.armLen / 2, mastH - 0.4, 0);
      arm.castShadow = true;
      gantry.add(arm);

      // Signal heads
      const head1 = this.createSignalHead();
      head1.position.set(cfg.armLen * 0.45, mastH - 1.8, 0);
      gantry.add(head1);

      const head2 = this.createSignalHead();
      head2.position.set(cfg.armLen * 0.85, mastH - 1.8, 0);
      gantry.add(head2);

      gantry.position.set(cfg.x, 0, cfg.z);
      gantry.rotation.y = cfg.rotY;
      this.group.add(gantry);
    });
  }

  createSignalHead() {
    const headGroup = new THREE.Group();

    // Black housing
    const boxGeo = new THREE.BoxGeometry(0.9, 2.4, 0.65);
    const box = new THREE.Mesh(boxGeo, this.materials.signalHousing);
    box.castShadow = true;
    headGroup.add(box);

    // Red lens (top)
    const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), this.materials.redLight);
    redLens.rotation.x = Math.PI / 2;
    redLens.position.set(0, 0.7, 0.28);
    headGroup.add(redLens);

    // Yellow lens (mid)
    const yellowLens = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), this.materials.yellowLight);
    yellowLens.rotation.x = Math.PI / 2;
    yellowLens.position.set(0, 0, 0.28);
    headGroup.add(yellowLens);

    // Green lens (bottom)
    const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), this.materials.greenLight);
    greenLens.rotation.x = Math.PI / 2;
    greenLens.position.set(0, -0.7, 0.28);
    headGroup.add(greenLens);

    return headGroup;
  }

  buildUtilityBoxes() {
    // Metal utility boxes on the sidewalk (left foreground of video)
    const boxConfigs = [
      { x: -48, z: -35, w: 1.6, h: 2.4, d: 1.1 },
      { x: -51, z: -35, w: 2.0, h: 2.8, d: 1.3 },
      { x: -54, z: -35, w: 1.2, h: 1.8, d: 0.9 }
    ];

    boxConfigs.forEach(cfg => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d),
        this.materials.utilityBox
      );
      box.position.set(cfg.x, cfg.h / 2, cfg.z);
      box.castShadow = true;
      box.receiveShadow = true;
      this.group.add(box);
    });
  }

  buildSuburbanHouses() {
    // Positioned safely in the 4 setback quadrants
    const houseConfigs = [
      // Northwest Quadrant (X <= -85, Z <= -135)
      { x: -85, z: -135, rot: 0, scale: 1.2, mat: this.materials.houseWall1 },
      { x: -125, z: -135, rot: 0, scale: 1.3, mat: this.materials.houseWall2 },
      { x: -165, z: -135, rot: 0, scale: 1.1, mat: this.materials.houseWall4 },

      // Northeast Quadrant (X >= 95, Z <= -135)
      { x: 95, z: -135, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: 135, z: -135, rot: 0, scale: 1.1, mat: this.materials.houseWall1 },
      { x: 175, z: -135, rot: 0, scale: 1.3, mat: this.materials.houseWall2 },

      // Southwest Quadrant (X <= -85, Z >= 75)
      { x: -85, z: 75, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall2 },
      { x: -125, z: 75, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall1 },
      { x: -165, z: 75, rot: Math.PI, scale: 1.3, mat: this.materials.houseWall3 },

      // Southeast Quadrant (X >= 95, Z >= 75)
      { x: 95, z: 75, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall4 },
      { x: 135, z: 75, rot: Math.PI, scale: 1.3, mat: this.materials.houseWall2 },
      { x: 175, z: 75, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall1 },

      // Distant North Hill Background
      { x: -45, z: -230, rot: Math.PI / 2, scale: 1.3, mat: this.materials.houseWall1 },
      { x: 45, z: -230, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall2 },
      { x: -90, z: -250, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall3 },
      { x: 90, z: -250, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall4 }
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
    const w = 15 * scale;
    const h = 6.0 * scale;
    const d = 12 * scale;

    // Main House Body
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(wallGeo, wallMaterial);
    wall.position.y = h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    // Pitched Gabled Roof
    const roofH = 4.2 * scale;
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.houseRoof);
    roof.position.y = h + roofH / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Chimney
    const chimGeo = new THREE.BoxGeometry(1.5 * scale, 4.0 * scale, 1.5 * scale);
    const chim = new THREE.Mesh(chimGeo, this.materials.gantryMetal);
    chim.position.set(w * 0.25, h + roofH * 0.6, 0);
    chim.castShadow = true;
    house.add(chim);

    // Front Door & Windows
    const doorGeo = new THREE.PlaneGeometry(2.0 * scale, 3.2 * scale);
    const door = new THREE.Mesh(doorGeo, this.materials.woodPole);
    door.position.set(0, 1.6 * scale, d / 2 + 0.05);
    house.add(door);

    const winGeo = new THREE.PlaneGeometry(2.2 * scale, 2.2 * scale);
    const winMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.2, metalness: 0.8 });
    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(-4.5 * scale, 3.0 * scale, d / 2 + 0.05);
    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(4.5 * scale, 3.0 * scale, d / 2 + 0.05);
    house.add(win1);
    house.add(win2);

    return house;
  }

  buildTrees() {
    // Tree positions in lawns and backgrounds (0 collisions with lanes)
    const treePositions = [
      // Northwest zone (X <= -70, Z <= -115)
      [-70, -115], [-85, -110], [-95, -125], [-110, -115], [-75, -145], [-90, -155], [-120, -145],

      // Northeast zone (X >= 80, Z <= -115)
      [80, -115], [95, -110], [110, -125], [125, -115], [85, -145], [105, -155], [130, -145],

      // Southwest zone (X <= -70, Z >= 55)
      [-70, 55], [-85, 50], [-100, 60], [-115, 55], [-75, 80], [-95, 90], [-120, 80],

      // Southeast zone (X >= 80, Z >= 55)
      [80, 55], [95, 50], [110, 60], [125, 55], [85, 80], [105, 90], [130, 80],

      // Distant Hill & Background Trees
      [-30, -220], [0, -225], [30, -220], [-60, -250], [60, -250],
      [-160, -30], [-200, -30], [-240, -30],
      [160, -30], [200, -30], [240, -30]
    ];

    treePositions.forEach((pos, idx) => {
      const scale = 1.1 + ((idx * 13) % 7) * 0.15;
      const foliageMat = idx % 3 === 0 ? this.materials.foliage1 : (idx % 3 === 1 ? this.materials.foliage2 : this.materials.foliage3);
      const isPine = idx % 3 === 0;

      const tree = isPine ? this.createPineTree(scale, foliageMat) : this.createDeciduousTree(scale, foliageMat);
      tree.position.set(pos[0], 0, pos[1]);
      this.group.add(tree);
    });
  }

  createDeciduousTree(scale = 1.0, foliageMat) {
    const tree = new THREE.Group();

    // Trunk
    const trunkH = 4.2 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Organic multifaceted canopy
    const canopyRadius = 3.8 * scale;
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
    const trunkH = 3.2 * scale;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, trunkH, 8), this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // 3 tiered cones
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const r = (3.5 - i * 0.8) * scale;
      const h = (4.0 - i * 0.6) * scale;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), foliageMat);
      cone.position.y = trunkH + (i * 2.4 + 1.5) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }

    return tree;
  }

  buildUtilityPoles() {
    const polePositions = [
      [-48, -120], [-48, -180], [-48, -240],
      [70, -120], [70, -180], [70, -240],
      [-120, -96], [-180, -96], [-240, -96],
      [120, -96], [180, -96], [240, -96],
      [-120, 36], [-180, 36], [-240, 36],
      [120, 36], [180, 36], [240, 36]
    ];

    polePositions.forEach(pos => {
      const poleGroup = new THREE.Group();
      const h = 13;

      // Wooden pole
      const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, h, 8), this.materials.woodPole);
      poleMesh.position.y = h / 2;
      poleMesh.castShadow = true;
      poleGroup.add(poleMesh);

      // Cross-arm
      const armMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 0.28), this.materials.woodPole);
      armMesh.position.set(0, h - 1.0, 0);
      poleGroup.add(armMesh);

      poleGroup.position.set(pos[0], 0, pos[1]);
      this.group.add(poleGroup);
    });
  }
}
