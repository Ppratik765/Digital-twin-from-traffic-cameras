import * as THREE from 'three';

export class DigitalTwinEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Color palette tuned to match the suburban intersection in the video
    this.materials = {
      grass: new THREE.MeshStandardMaterial({ color: 0x476b3a, roughness: 0.9, metalness: 0.05 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x33383f, roughness: 0.85, metalness: 0.1 }),
      concreteRoad: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8, metalness: 0.05 }), // Light grey concrete slab pavement
      concreteJoint: new THREE.MeshBasicMaterial({ color: 0x6b7280 }), // Concrete expansion joints
      sidewalk: new THREE.MeshStandardMaterial({ color: 0xc4cbd4, roughness: 0.85, metalness: 0.05 }),
      curb: new THREE.MeshStandardMaterial({ color: 0x7c8591, roughness: 0.7, metalness: 0.1 }),
      whiteMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      yellowMarking: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
      gantryMetal: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 }),
      signalHousing: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 }),
      redLight: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 }),
      yellowLight: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.3 }),
      greenLight: new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9 }),
      utilityBox: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7 }),
      woodPole: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9, metalness: 0.1 }),
      houseWall1: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 }), // White siding
      houseWall2: new THREE.MeshStandardMaterial({ color: 0xd6cbb8, roughness: 0.8 }), // Beige siding
      houseWall3: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 }), // Slate siding
      houseWall4: new THREE.MeshStandardMaterial({ color: 0xb5c0ad, roughness: 0.8 }), // Sage siding
      houseRoof: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }),  // Shingle roof
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
    // Large natural grass terrain (1600m x 1600m)
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const ground = new THREE.Mesh(groundGeo, this.materials.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  buildRoadNetwork() {
    // 1. Main East-West Highway / Arterial (length 800m, width 32m)
    const ewRoadGeo = new THREE.PlaneGeometry(800, 32);
    const ewRoad = new THREE.Mesh(ewRoadGeo, this.materials.concreteRoad);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.position.set(0, 0.01, 0);
    ewRoad.receiveShadow = true;
    this.group.add(ewRoad);

    // 2. North-South Intersecting Road (length 800m, width 26m)
    const nsRoadGeo = new THREE.PlaneGeometry(26, 800);
    const nsRoad = new THREE.Mesh(nsRoadGeo, this.materials.concreteRoad);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(0, 0.02, 0);
    nsRoad.receiveShadow = true;
    this.group.add(nsRoad);

    // 3. Concrete Curbs & Sidewalks along road borders
    const sidewalkMat = this.materials.sidewalk;
    const curbMat = this.materials.curb;

    // Sidewalk corners & strips
    const corners = [
      { x: -50, z: -50, w: 200, d: 200, rot: 0 },
      { x: 50, z: -50, w: 200, d: 200, rot: 0 },
      { x: -50, z: 50, w: 200, d: 200, rot: 0 },
      { x: 50, z: 50, w: 200, d: 200, rot: 0 }
    ];

    // Sidewalk border paths along East-West road (North and South sides)
    const swNorthGeo = new THREE.PlaneGeometry(800, 4);
    const swNorth = new THREE.Mesh(swNorthGeo, sidewalkMat);
    swNorth.rotation.x = -Math.PI / 2;
    swNorth.position.set(0, 0.08, -18);
    swNorth.receiveShadow = true;
    this.group.add(swNorth);

    const swSouthGeo = new THREE.PlaneGeometry(800, 4);
    const swSouth = new THREE.Mesh(swSouthGeo, sidewalkMat);
    swSouth.rotation.x = -Math.PI / 2;
    swSouth.position.set(0, 0.08, 18);
    swSouth.receiveShadow = true;
    this.group.add(swSouth);

    // Sidewalk border paths along North-South road (West and East sides)
    const swWestGeo = new THREE.PlaneGeometry(4, 800);
    const swWest = new THREE.Mesh(swWestGeo, sidewalkMat);
    swWest.rotation.x = -Math.PI / 2;
    swWest.position.set(-15, 0.08, 0);
    swWest.receiveShadow = true;
    this.group.add(swWest);

    const swEastGeo = new THREE.PlaneGeometry(4, 800);
    const swEast = new THREE.Mesh(swEastGeo, sidewalkMat);
    swEast.rotation.x = -Math.PI / 2;
    swEast.position.set(15, 0.08, 0);
    swEast.receiveShadow = true;
    this.group.add(swEast);

    // Raised concrete curbs (3D boxes)
    const curbHeight = 0.18;
    const curbWidth = 0.35;

    // Curbs along EW road
    const curbEW1 = new THREE.Mesh(new THREE.BoxGeometry(800, curbHeight, curbWidth), curbMat);
    curbEW1.position.set(0, curbHeight / 2, -16);
    curbEW1.castShadow = true;
    this.group.add(curbEW1);

    const curbEW2 = new THREE.Mesh(new THREE.BoxGeometry(800, curbHeight, curbWidth), curbMat);
    curbEW2.position.set(0, curbHeight / 2, 16);
    curbEW2.castShadow = true;
    this.group.add(curbEW2);

    // Curbs along NS road
    const curbNS1 = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, 800), curbMat);
    curbNS1.position.set(-13, curbHeight / 2, 0);
    curbNS1.castShadow = true;
    this.group.add(curbNS1);

    const curbNS2 = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, 800), curbMat);
    curbNS2.position.set(13, curbHeight / 2, 0);
    curbNS2.castShadow = true;
    this.group.add(curbNS2);
  }

  buildConcreteSlabJoints() {
    // Create subtle concrete expansion joints matching the video slab pattern
    const slabSpacing = 8.0;
    const jointMat = this.materials.concreteJoint;

    // EW road slab lines
    for (let x = -80; x <= 80; x += slabSpacing) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 32), jointMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.03, 0);
      this.group.add(line);
    }

    // Longitudinal slab joint
    const longLine = new THREE.Mesh(new THREE.PlaneGeometry(160, 0.08), jointMat);
    longLine.rotation.x = -Math.PI / 2;
    longLine.position.set(0, 0.03, 0);
    this.group.add(longLine);
  }

  buildCrosswalksAndMarkings() {
    const wm = this.materials.whiteMarking;
    const ym = this.materials.yellowMarking;

    // 1. Double Solid Yellow Center Line (East-West road)
    const drawDoubleYellowEW = (xStart, xEnd, zPos) => {
      const len = Math.abs(xEnd - xStart);
      const xMid = (xStart + xEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.2), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xMid, 0.04, zPos - 0.25);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.2), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xMid, 0.04, zPos + 0.25);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowEW(-400, -22, 0);
    drawDoubleYellowEW(22, 400, 0);

    // Double Solid Yellow Center Line (North-South road)
    const drawDoubleYellowNS = (zStart, zEnd, xPos) => {
      const len = Math.abs(zEnd - zStart);
      const zMid = (zStart + zEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, len), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xPos - 0.25, 0.04, zMid);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, len), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xPos + 0.25, 0.04, zMid);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowNS(-400, -22, 0);
    drawDoubleYellowNS(22, 400, 0);

    // 2. Dashed White Lane Dividers (EW & NS)
    const drawDashedLineEW = (xStart, xEnd, zPos) => {
      const step = 8;
      const dashLen = 4;
      for (let x = xStart; x <= xEnd; x += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, 0.2), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x + dashLen / 2, 0.04, zPos);
        this.group.add(dash);
      }
    };

    drawDashedLineEW(-400, -22, -8);
    drawDashedLineEW(-400, -22, 8);
    drawDashedLineEW(22, 400, -8);
    drawDashedLineEW(22, 400, 8);

    const drawDashedLineNS = (zStart, zEnd, xPos) => {
      const step = 8;
      const dashLen = 4;
      for (let z = zStart; z <= zEnd; z += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, dashLen), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xPos, 0.04, z + dashLen / 2);
        this.group.add(dash);
      }
    };

    drawDashedLineNS(-400, -22, -6.5);
    drawDashedLineNS(-400, -22, 6.5);
    drawDashedLineNS(22, 400, -6.5);
    drawDashedLineNS(22, 400, 6.5);

    // 3. Stop Bars
    const stopBarEW1 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 14), wm);
    stopBarEW1.rotation.x = -Math.PI / 2;
    stopBarEW1.position.set(-20, 0.04, 7);
    this.group.add(stopBarEW1);

    const stopBarEW2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 14), wm);
    stopBarEW2.rotation.x = -Math.PI / 2;
    stopBarEW2.position.set(20, 0.04, -7);
    this.group.add(stopBarEW2);

    const stopBarNS1 = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.6), wm);
    stopBarNS1.rotation.x = -Math.PI / 2;
    stopBarNS1.position.set(6, 0.04, -20);
    this.group.add(stopBarNS1);

    const stopBarNS2 = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.6), wm);
    stopBarNS2.rotation.x = -Math.PI / 2;
    stopBarNS2.position.set(-6, 0.04, 20);
    this.group.add(stopBarNS2);

    // 4. Continental / Zebra Crosswalks (4 Approaches)
    const drawCrosswalk = (center, width, height, isHorizontal) => {
      const stripes = 8;
      for (let i = 0; i < stripes; i++) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(isHorizontal ? width : 0.8, isHorizontal ? 0.8 : height),
          wm
        );
        stripe.rotation.x = -Math.PI / 2;
        if (isHorizontal) {
          stripe.position.set(center.x, 0.04, center.z - 12 + i * 3.2);
        } else {
          stripe.position.set(center.x - 12 + i * 3.2, 0.04, center.z);
        }
        this.group.add(stripe);
      }
    };

    drawCrosswalk(new THREE.Vector3(-22, 0, 0), 3.5, 30, true);
    drawCrosswalk(new THREE.Vector3(22, 0, 0), 3.5, 30, true);
    drawCrosswalk(new THREE.Vector3(0, 0, -22), 24, 3.5, false);
    drawCrosswalk(new THREE.Vector3(0, 0, 22), 24, 3.5, false);
  }

  buildTrafficSignals() {
    // Overhanging cantilever traffic signal poles across approaches
    const signalConfigs = [
      { x: -18, z: -17, rotY: 0 },
      { x: 18, z: 17, rotY: Math.PI },
      { x: -16, z: 18, rotY: -Math.PI / 2 },
      { x: 16, z: -18, rotY: Math.PI / 2 }
    ];

    signalConfigs.forEach(cfg => {
      const gantry = new THREE.Group();
      const mastH = 8.5;
      const armLen = 14;

      // Vertical steel pole
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.45, mastH, 16);
      const pole = new THREE.Mesh(poleGeo, this.materials.gantryMetal);
      pole.position.y = mastH / 2;
      pole.castShadow = true;
      gantry.add(pole);

      // Horizontal cantilever arm
      const armGeo = new THREE.CylinderGeometry(0.18, 0.25, armLen, 16);
      const arm = new THREE.Mesh(armGeo, this.materials.gantryMetal);
      arm.rotation.z = -Math.PI / 2;
      arm.position.set(armLen / 2, mastH - 0.4, 0);
      arm.castShadow = true;
      gantry.add(arm);

      // 2 Traffic signal heads hanging from arm
      const head1 = this.createSignalHead();
      head1.position.set(6, mastH - 1.6, 0);
      gantry.add(head1);

      const head2 = this.createSignalHead();
      head2.position.set(11, mastH - 1.6, 0);
      gantry.add(head2);

      gantry.position.set(cfg.x, 0, cfg.z);
      gantry.rotation.y = cfg.rotY;
      this.group.add(gantry);
    });
  }

  createSignalHead() {
    const headGroup = new THREE.Group();

    // Black housing
    const boxGeo = new THREE.BoxGeometry(0.8, 2.2, 0.6);
    const box = new THREE.Mesh(boxGeo, this.materials.signalHousing);
    box.castShadow = true;
    headGroup.add(box);

    // Red lens (top)
    const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.redLight);
    redLens.rotation.x = Math.PI / 2;
    redLens.position.set(0, 0.65, 0.25);
    headGroup.add(redLens);

    // Yellow lens (mid)
    const yellowLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.yellowLight);
    yellowLens.rotation.x = Math.PI / 2;
    yellowLens.position.set(0, 0, 0.25);
    headGroup.add(yellowLens);

    // Green lens (bottom)
    const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.greenLight);
    greenLens.rotation.x = Math.PI / 2;
    greenLens.position.set(0, -0.65, 0.25);
    headGroup.add(greenLens);

    return headGroup;
  }

  buildUtilityBoxes() {
    // Metal utility / traffic controller boxes on the sidewalk (matches video left sidewalk)
    const boxConfigs = [
      { x: -24, z: -17, w: 1.4, h: 2.2, d: 1.0 },
      { x: -26, z: -17, w: 1.8, h: 2.5, d: 1.2 },
      { x: -28.5, z: -17, w: 1.0, h: 1.6, d: 0.8 }
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
    const houseConfigs = [
      // Along North road (hill in background, left & right)
      { x: -35, z: -70, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall1 },
      { x: 35, z: -75, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall2 },
      { x: -40, z: -130, rot: Math.PI / 2, scale: 1.3, mat: this.materials.houseWall4 },
      { x: 42, z: -140, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall3 },
      { x: -38, z: -200, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall2 },
      { x: 45, z: -210, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall1 },

      // Along West road (foreground & background)
      { x: -75, z: -35, rot: 0, scale: 1.2, mat: this.materials.houseWall2 },
      { x: -140, z: -35, rot: 0, scale: 1.3, mat: this.materials.houseWall1 },
      { x: -210, z: -38, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: -75, z: 35, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall1 },
      { x: -145, z: 38, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall4 },
      { x: -215, z: 35, rot: Math.PI, scale: 1.3, mat: this.materials.houseWall2 },

      // Along East road
      { x: 80, z: -36, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: 150, z: -38, rot: 0, scale: 1.1, mat: this.materials.houseWall2 },
      { x: 220, z: -35, rot: 0, scale: 1.3, mat: this.materials.houseWall1 },
      { x: 80, z: 36, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall1 },
      { x: 150, z: 38, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall4 },
      { x: 220, z: 35, rot: Math.PI, scale: 1.1, mat: this.materials.houseWall2 }
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
    const w = 14 * scale;
    const h = 5.5 * scale;
    const d = 11 * scale;

    // Walls
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(wallGeo, wallMaterial);
    wall.position.y = h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    house.add(wall);

    // Gabled Roof
    const roofH = 4.0 * scale;
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.houseRoof);
    roof.position.y = h + roofH / 2;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Chimney
    const chimGeo = new THREE.BoxGeometry(1.4 * scale, 3.5 * scale, 1.4 * scale);
    const chim = new THREE.Mesh(chimGeo, this.materials.gantryMetal);
    chim.position.set(w * 0.25, h + roofH * 0.6, 0);
    chim.castShadow = true;
    house.add(chim);

    // Front Door & Windows
    const doorGeo = new THREE.PlaneGeometry(1.8 * scale, 3.0 * scale);
    const door = new THREE.Mesh(doorGeo, this.materials.woodPole);
    door.position.set(0, 1.5 * scale, d / 2 + 0.05);
    house.add(door);

    const winGeo = new THREE.PlaneGeometry(2.0 * scale, 2.0 * scale);
    const winMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.2, metalness: 0.8 });
    const win1 = new THREE.Mesh(winGeo, winMat);
    win1.position.set(-4.0 * scale, 2.8 * scale, d / 2 + 0.05);
    const win2 = new THREE.Mesh(winGeo, winMat);
    win2.position.set(4.0 * scale, 2.8 * scale, d / 2 + 0.05);
    house.add(win1);
    house.add(win2);

    return house;
  }

  buildTrees() {
    // Position realistic trees along roads, lawns, and in background clusters (matches video)
    const treePositions = [
      // Southwest lawn corner (matches trees in video left foreground)
      [-26, -26], [-32, -22], [-38, -30], [-46, -24], [-54, -32],
      [-28, 28], [-36, 24], [-45, 32], [-58, 26],

      // Southeast lawn corner
      [28, 28], [36, 32], [46, 26], [60, 32], [30, -28], [40, -32], [52, -26],

      // Along North hill road (distant trees in video)
      [-18, -55], [-22, -90], [-20, -130], [-24, -170], [-26, -220],
      [18, -58], [24, -95], [22, -135], [26, -175], [25, -225],

      // Distant tree clusters
      [-70, -70], [-90, -110], [-120, -150], [-80, -200],
      [75, -75], [95, -115], [115, -155], [85, -210],

      // Along West road
      [-80, -24], [-120, -24], [-160, -26], [-200, -24], [-240, -26],
      [-80, 26], [-120, 26], [-160, 24], [-200, 26], [-240, 24],

      // Along East road
      [85, -24], [125, -26], [165, -24], [205, -26], [245, -24],
      [85, 26], [125, 24], [165, 26], [205, 24], [245, 26]
    ];

    treePositions.forEach((pos, idx) => {
      const scale = 1.0 + ((idx * 13) % 7) * 0.15;
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
    const trunkH = 4.0 * scale;
    const trunkGeo = new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // Multi-faceted canopy
    const canopyRadius = 3.5 * scale;
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
    const trunkH = 3.0 * scale;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, trunkH, 8), this.materials.trunk);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    tree.add(trunk);

    // 3 tiered cones
    const tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const r = (3.2 - i * 0.7) * scale;
      const h = (3.8 - i * 0.6) * scale;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), foliageMat);
      cone.position.y = trunkH + (i * 2.2 + 1.4) * scale;
      cone.castShadow = true;
      tree.add(cone);
    }

    return tree;
  }

  buildUtilityPoles() {
    const polePositions = [
      [-45, -20], [-100, -20], [-160, -20], [-220, -20], [-280, -20],
      [45, -20], [100, -20], [160, -20], [220, -20], [280, -20],
      [-16, -65], [-16, -120], [-16, -180], [-16, -240]
    ];

    polePositions.forEach(pos => {
      const poleGroup = new THREE.Group();
      const h = 12;

      // Wooden pole
      const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, h, 8), this.materials.woodPole);
      poleMesh.position.y = h / 2;
      poleMesh.castShadow = true;
      poleGroup.add(poleMesh);

      // Cross-arm
      const armMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.25), this.materials.woodPole);
      armMesh.position.set(0, h - 0.9, 0);
      poleGroup.add(armMesh);

      poleGroup.position.set(pos[0], 0, pos[1]);
      this.group.add(poleGroup);
    });
  }
}
