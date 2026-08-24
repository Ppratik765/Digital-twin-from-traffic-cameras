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
    // 1. Main East-West Multi-Lane Road Corridor (Z: -65 to +35, width 100m, length 1000m)
    // Centered around Z = -15, width = 100m
    const ewRoadGeo = new THREE.PlaneGeometry(1000, 106);
    const ewRoad = new THREE.Mesh(ewRoadGeo, this.materials.concreteRoad);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.position.set(0, 0.01, -15);
    ewRoad.receiveShadow = true;
    this.group.add(ewRoad);

    // 2. North Approach Road (X: -10 to +35, width 45m, length 1000m)
    // Centered around X = 12.5
    const nsRoadGeo = new THREE.PlaneGeometry(48, 1000);
    const nsRoad = new THREE.Mesh(nsRoadGeo, this.materials.concreteRoad);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(12.5, 0.02, -250);
    nsRoad.receiveShadow = true;
    this.group.add(nsRoad);

    // 3. Concrete Curbs & Sidewalks along road borders
    const sidewalkMat = this.materials.sidewalk;
    const curbMat = this.materials.curb;

    // North sidewalk of EW road (West of North road: X = -500 to -12)
    const swNorthWest = new THREE.Mesh(new THREE.PlaneGeometry(488, 5), sidewalkMat);
    swNorthWest.rotation.x = -Math.PI / 2;
    swNorthWest.position.set(-256, 0.08, -70.5);
    swNorthWest.receiveShadow = true;
    this.group.add(swNorthWest);

    // North sidewalk of EW road (East of North road: X = +37 to +500)
    const swNorthEast = new THREE.Mesh(new THREE.PlaneGeometry(463, 5), sidewalkMat);
    swNorthEast.rotation.x = -Math.PI / 2;
    swNorthEast.position.set(268.5, 0.08, -70.5);
    swNorthEast.receiveShadow = true;
    this.group.add(swNorthEast);

    // South sidewalk of EW road (Full length X = -500 to +500)
    const swSouth = new THREE.Mesh(new THREE.PlaneGeometry(1000, 5), sidewalkMat);
    swSouth.rotation.x = -Math.PI / 2;
    swSouth.position.set(0, 0.08, 40.5);
    swSouth.receiveShadow = true;
    this.group.add(swSouth);

    // West sidewalk of North road (Z = -70 to -500)
    const swNorthRoadWest = new THREE.Mesh(new THREE.PlaneGeometry(5, 430), sidewalkMat);
    swNorthRoadWest.rotation.x = -Math.PI / 2;
    swNorthRoadWest.position.set(-14.5, 0.08, -285);
    swNorthRoadWest.receiveShadow = true;
    this.group.add(swNorthRoadWest);

    // East sidewalk of North road (Z = -70 to -500)
    const swNorthRoadEast = new THREE.Mesh(new THREE.PlaneGeometry(5, 430), sidewalkMat);
    swNorthRoadEast.rotation.x = -Math.PI / 2;
    swNorthRoadEast.position.set(39.5, 0.08, -285);
    swNorthRoadEast.receiveShadow = true;
    this.group.add(swNorthRoadEast);

    // Raised concrete curbs (3D boxes)
    const curbHeight = 0.18;
    const curbWidth = 0.35;

    // Curb North-West
    const curbNW = new THREE.Mesh(new THREE.BoxGeometry(488, curbHeight, curbWidth), curbMat);
    curbNW.position.set(-256, curbHeight / 2, -68);
    curbNW.castShadow = true;
    this.group.add(curbNW);

    // Curb North-East
    const curbNE = new THREE.Mesh(new THREE.BoxGeometry(463, curbHeight, curbWidth), curbMat);
    curbNE.position.set(268.5, curbHeight / 2, -68);
    curbNE.castShadow = true;
    this.group.add(curbNE);

    // Curb South
    const curbS = new THREE.Mesh(new THREE.BoxGeometry(1000, curbHeight, curbWidth), curbMat);
    curbS.position.set(0, curbHeight / 2, 38);
    curbS.castShadow = true;
    this.group.add(curbS);

    // Curb North Road West
    const curbNRW = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, 430), curbMat);
    curbNRW.position.set(-12, curbHeight / 2, -285);
    curbNRW.castShadow = true;
    this.group.add(curbNRW);

    // Curb North Road East
    const curbNRE = new THREE.Mesh(new THREE.BoxGeometry(curbWidth, curbHeight, 430), curbMat);
    curbNRE.position.set(37, curbHeight / 2, -285);
    curbNRE.castShadow = true;
    this.group.add(curbNRE);
  }

  buildConcreteSlabJoints() {
    const slabSpacing = 10.0;
    const jointMat = this.materials.concreteJoint;

    // EW road slab grid lines
    for (let x = -100; x <= 100; x += slabSpacing) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 106), jointMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.03, -15);
      this.group.add(line);
    }

    // Longitudinal slab joints
    for (let z = -60; z <= 30; z += 12) {
      const longLine = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.08), jointMat);
      longLine.rotation.x = -Math.PI / 2;
      longLine.position.set(0, 0.03, z);
      this.group.add(longLine);
    }
  }

  buildCrosswalksAndMarkings() {
    const wm = this.materials.whiteMarking;
    const ym = this.materials.yellowMarking;

    // 1. Double Solid Yellow Center Line between Westbound and Eastbound lanes (at Z = -30)
    const drawDoubleYellowEW = (xStart, xEnd, zPos) => {
      const len = Math.abs(xEnd - xStart);
      const xMid = (xStart + xEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.25), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xMid, 0.04, zPos - 0.25);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.25), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xMid, 0.04, zPos + 0.25);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowEW(-500, -35, -30);
    drawDoubleYellowEW(35, 500, -30);

    // Double Solid Yellow Center Line for North Road (at X = 12.5)
    const drawDoubleYellowNS = (zStart, zEnd, xPos) => {
      const len = Math.abs(zEnd - zStart);
      const zMid = (zStart + zEnd) / 2;
      const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, len), ym);
      l1.rotation.x = -Math.PI / 2;
      l1.position.set(xPos - 0.25, 0.04, zMid);
      const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, len), ym);
      l2.rotation.x = -Math.PI / 2;
      l2.position.set(xPos + 0.25, 0.04, zMid);
      this.group.add(l1);
      this.group.add(l2);
    };

    drawDoubleYellowNS(-500, -65, 12.5);

    // 2. Dashed White Lane Dividers
    const drawDashedLineEW = (xStart, xEnd, zPos) => {
      const step = 9;
      const dashLen = 4.5;
      for (let x = xStart; x <= xEnd; x += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(dashLen, 0.2), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(x + dashLen / 2, 0.04, zPos);
        this.group.add(dash);
      }
    };

    // Westbound lane dividers (Z < -30)
    drawDashedLineEW(-500, -35, -43);
    drawDashedLineEW(-500, -35, -55);
    drawDashedLineEW(35, 500, -43);
    drawDashedLineEW(35, 500, -55);

    // Eastbound lane dividers (Z > -30)
    drawDashedLineEW(-500, -35, -17);
    drawDashedLineEW(-500, -35, -4);
    drawDashedLineEW(-500, -35, 9);
    drawDashedLineEW(-500, -35, 22);

    drawDashedLineEW(35, 500, -17);
    drawDashedLineEW(35, 500, -4);
    drawDashedLineEW(35, 500, 9);
    drawDashedLineEW(35, 500, 22);

    // North road lane dividers
    const drawDashedLineNS = (zStart, zEnd, xPos) => {
      const step = 9;
      const dashLen = 4.5;
      for (let z = zStart; z <= zEnd; z += step) {
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, dashLen), wm);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xPos, 0.04, z + dashLen / 2);
        this.group.add(dash);
      }
    };

    drawDashedLineNS(-500, -65, 0);
    drawDashedLineNS(-500, -65, 25);

    // 3. Stop Bars
    const stopBarW = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 40), wm);
    stopBarW.rotation.x = -Math.PI / 2;
    stopBarW.position.set(-32, 0.04, -50);
    this.group.add(stopBarW);

    const stopBarE = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 60), wm);
    stopBarE.rotation.x = -Math.PI / 2;
    stopBarE.position.set(32, 0.04, 0);
    this.group.add(stopBarE);

    const stopBarN = new THREE.Mesh(new THREE.PlaneGeometry(45, 0.8), wm);
    stopBarN.rotation.x = -Math.PI / 2;
    stopBarN.position.set(12.5, 0.04, -63);
    this.group.add(stopBarN);

    // 4. Continental Crosswalks
    const drawCrosswalk = (center, width, height, isHorizontal, count = 10) => {
      for (let i = 0; i < count; i++) {
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(isHorizontal ? width : 0.9, isHorizontal ? 0.9 : height),
          wm
        );
        stripe.rotation.x = -Math.PI / 2;
        if (isHorizontal) {
          stripe.position.set(center.x, 0.04, center.z - (count * 1.6) + i * 3.2);
        } else {
          stripe.position.set(center.x - (count * 1.6) + i * 3.2, 0.04, center.z);
        }
        this.group.add(stripe);
      }
    };

    drawCrosswalk(new THREE.Vector3(-35, 0, -15), 4.0, 100, true, 30);
    drawCrosswalk(new THREE.Vector3(35, 0, -15), 4.0, 100, true, 30);
    drawCrosswalk(new THREE.Vector3(12.5, 0, -66), 48, 4.0, false, 15);
  }

  buildTrafficSignals() {
    const signalConfigs = [
      { x: -33, z: -67, rotY: 0 },
      { x: 36, z: 37, rotY: Math.PI },
      { x: -11, z: -67, rotY: -Math.PI / 2 },
      { x: 36, z: -67, rotY: Math.PI / 2 }
    ];

    signalConfigs.forEach(cfg => {
      const gantry = new THREE.Group();
      const mastH = 9.0;
      const armLen = 16;

      // Vertical steel pole
      const poleGeo = new THREE.CylinderGeometry(0.35, 0.5, mastH, 16);
      const pole = new THREE.Mesh(poleGeo, this.materials.gantryMetal);
      pole.position.y = mastH / 2;
      pole.castShadow = true;
      gantry.add(pole);

      // Horizontal cantilever arm
      const armGeo = new THREE.CylinderGeometry(0.2, 0.28, armLen, 16);
      const arm = new THREE.Mesh(armGeo, this.materials.gantryMetal);
      arm.rotation.z = -Math.PI / 2;
      arm.position.set(armLen / 2, mastH - 0.4, 0);
      arm.castShadow = true;
      gantry.add(arm);

      // Traffic signal heads
      const head1 = this.createSignalHead();
      head1.position.set(7, mastH - 1.6, 0);
      gantry.add(head1);

      const head2 = this.createSignalHead();
      head2.position.set(13, mastH - 1.6, 0);
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

    // Red lens
    const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.redLight);
    redLens.rotation.x = Math.PI / 2;
    redLens.position.set(0, 0.65, 0.25);
    headGroup.add(redLens);

    // Yellow lens
    const yellowLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.yellowLight);
    yellowLens.rotation.x = Math.PI / 2;
    yellowLens.position.set(0, 0, 0.25);
    headGroup.add(yellowLens);

    // Green lens
    const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16), this.materials.greenLight);
    greenLens.rotation.x = Math.PI / 2;
    greenLens.position.set(0, -0.65, 0.25);
    headGroup.add(greenLens);

    return headGroup;
  }

  buildUtilityBoxes() {
    // Metal control cabinets (matching left sidewalk in video)
    const boxConfigs = [
      { x: -38, z: -71, w: 1.6, h: 2.4, d: 1.2 },
      { x: -41, z: -71, w: 2.0, h: 2.8, d: 1.4 },
      { x: -44, z: -71, w: 1.2, h: 1.8, d: 0.9 }
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
      // NW Houses (safely on residential lots)
      { x: -50, z: -120, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall1 },
      { x: -90, z: -130, rot: Math.PI / 2, scale: 1.3, mat: this.materials.houseWall2 },
      { x: -140, z: -140, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall4 },
      { x: -45, z: -190, rot: Math.PI / 2, scale: 1.2, mat: this.materials.houseWall3 },
      { x: -95, z: -200, rot: Math.PI / 2, scale: 1.1, mat: this.materials.houseWall1 },

      // NE Houses
      { x: 55, z: -120, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall2 },
      { x: 100, z: -130, rot: -Math.PI / 2, scale: 1.3, mat: this.materials.houseWall1 },
      { x: 150, z: -140, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall4 },
      { x: 60, z: -190, rot: -Math.PI / 2, scale: 1.1, mat: this.materials.houseWall3 },
      { x: 110, z: -200, rot: -Math.PI / 2, scale: 1.2, mat: this.materials.houseWall2 },

      // SW Houses
      { x: -60, z: 65, rot: 0, scale: 1.2, mat: this.materials.houseWall3 },
      { x: -120, z: 70, rot: 0, scale: 1.3, mat: this.materials.houseWall1 },
      { x: -180, z: 65, rot: 0, scale: 1.2, mat: this.materials.houseWall2 },

      // SE Houses
      { x: 80, z: 65, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall1 },
      { x: 140, z: 70, rot: Math.PI, scale: 1.3, mat: this.materials.houseWall4 },
      { x: 200, z: 65, rot: Math.PI, scale: 1.2, mat: this.materials.houseWall2 }
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
    // Trees verified with clearance > 8.5m from all vehicle trajectories
    const treePositions = [[-30,-75],[-30,-165],[-55,-75],[-55,-165],[-80,-105],[-80,-195],[-105,-105],[-105,-195],[-130,-105],[-130,-195],[-155,-105],[-155,-195],[-180,-105],[-180,-195],[-205,-105],[-205,-195],[-230,-105],[-230,-195],[40,-165],[65,-75],[65,-165],[90,-75],[90,-165],[115,-75],[115,-165],[140,-75],[140,-165],[165,-75],[165,-165],[190,-75],[190,-165],[215,-75],[215,-165],[240,-75],[240,-165],[-30,75],[-30,165],[-55,45],[-55,135],[-55,225],[-80,105],[-80,195],[-105,75],[-105,165],[-130,45],[-130,135],[-130,225],[-155,105],[-155,195],[-180,75],[-180,165],[-205,45],[-205,135],[-205,225],[-230,105],[-230,195],[60,75],[60,165],[85,45],[85,135],[85,225],[110,105],[110,195],[135,75],[135,165],[160,45],[160,135],[160,225],[185,105],[185,195],[210,75],[210,165],[235,45],[235,135],[235,225]];

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
      [-55, -72], [-110, -72], [-170, -72], [-230, -72],
      [55, -72], [110, -72], [170, -72], [230, -72],
      [-15, -110], [-15, -180], [-15, -250],
      [40, -110], [40, -180], [40, -250],
      [-55, 42], [-110, 42], [-170, 42],
      [55, 42], [110, 42], [170, 42]
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
