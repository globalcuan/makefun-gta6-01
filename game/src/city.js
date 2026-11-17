(function () {
  const CS = window.CS, colliders = [], roadGrid = { spacing: 120, vertical: [], horizontal: [] };
  let scene;
  const box = (parent, x, y, z, w, h, d, color) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color })); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; };
  function build() {
    scene = new THREE.Scene(); scene.background = new THREE.Color(CS.config.colors.sky); scene.fog = new THREE.Fog(scene.background, CS.config.fog.start, CS.config.fog.end);
    scene.add(new THREE.HemisphereLight(0xffd8a2, 0x57504b, CS.config.lighting.hemisphere)); scene.add(new THREE.AmbientLight(0xffffff, CS.config.lighting.ambient));
    const sun = new THREE.DirectionalLight(CS.config.lighting.sun, CS.config.lighting.sunIntensity); sun.position.set(-220, 380, 180); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -700; sun.shadow.camera.right = 700; sun.shadow.camera.top = 700; sun.shadow.camera.bottom = -700; scene.add(sun);
    const rng = CS.rng(1738); const colors = CS.config.colors;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: colors.ground })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.12; ground.receiveShadow = true; scene.add(ground);
    roadGrid.vertical = []; roadGrid.horizontal = [];
    for (let x = -540; x <= 540; x += 120) { roadGrid.vertical.push(x); box(scene, x, 0, -60, 18, .08, 1000, colors.asphalt); for (let z = -520; z <= 420; z += 30) box(scene, x, .055, z, .35, .025, 10, colors.dash); }
    for (let z = -540; z <= 420; z += 120) { roadGrid.horizontal.push(z); box(scene, 0, .01, z, 1200, .08, 18, colors.asphalt); for (let x = -580; x <= 580; x += 30) box(scene, x, .065, z, 10, .025, .35, colors.dash); }
    // Four building lots occupy each block while leaving the sidewalks clear.
    for (let x = -480; x < 540; x += 120) for (let z = -480; z < 420; z += 120) for (let n = 0; n < 4; n++) {
      const bx = x + (n % 2 ? 76 : 30), bz = z + (n > 1 ? 76 : 30), w = 25 + rng() * 22, d = 25 + rng() * 22, h = 8 + rng() * 47;
      const color = colors.stucco[Math.floor(rng() * colors.stucco.length)]; box(scene, bx, h / 2, bz, w, h, d, color); box(scene, bx, h + .35, bz, w + 1, .7, d + 1, colors.roof);
      for (let wx = bx - w * .3; wx <= bx + w * .3; wx += 7) box(scene, wx, Math.min(h * .58, 18), bz + d / 2 + .12, 2.4, 3.2, .18, colors.glass);
      colliders.push({ minX: bx - w / 2, maxX: bx + w / 2, minZ: bz - d / 2, maxZ: bz + d / 2 });
      if (rng() < .25) box(scene, bx + 2, h + 2.5, bz, w * .45, 4, d * .45, colors.stucco[Math.floor(rng() * colors.stucco.length)]);
    }
    box(scene, 0, -.04, 505, 1200, .12, 130, colors.sand);
    const seaGeo = new THREE.PlaneGeometry(1200, 500, 50, 24); seaGeo.rotateX(-Math.PI / 2); const sea = new THREE.Mesh(seaGeo, new THREE.MeshStandardMaterial({ color: colors.sea, roughness: .42, metalness: .08 })); sea.position.set(0, -.03, 820); sea.userData.animate = t => { const p = sea.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(t * 1.3 + p.getX(i) * .025 + p.getZ(i) * .04) * .45); p.needsUpdate = true; sea.geometry.computeVertexNormals(); }; scene.add(sea);
    for (let i = 0; i < 28; i++) { const x = -560 + rng() * 1120, z = 450 + rng() * 75; palm(scene, x, z); }
    for (const x of roadGrid.vertical) for (const z of roadGrid.horizontal) lamp(scene, x + 13, z + 13);
    for (let i = 0; i < 16; i++) box(scene, -470 + rng() * 940, 1, -470 + rng() * 880, 2, 2, 2, 0x9b6845);
    return scene;
  }
  function palm(parent, x, z) { const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.25, .55, 9, 6), new THREE.MeshStandardMaterial({ color: 0x806044 })); trunk.position.set(x, 4.5, z); parent.add(trunk); for (let i = 0; i < 7; i++) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(.7, .18, 5), new THREE.MeshStandardMaterial({ color: 0x41734e })); leaf.position.set(x, 8.8, z); leaf.rotation.y = i * Math.PI / 3.5; leaf.rotation.x = -.2; parent.add(leaf); } }
  function lamp(parent, x, z) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 7, 6), new THREE.MeshStandardMaterial({ color: 0x464449 })); pole.position.set(x, 3.5, z); parent.add(pole); box(parent, x, 7.1, z, 1.2, .25, .5, 0xffd28a); }
  function randomRoadPoint(rng) { const pick = rng || CS.random; const vertical = pick() < .5; return vertical ? { x: roadGrid.vertical[Math.floor(pick() * roadGrid.vertical.length)], z: -520 + pick() * 940 } : { x: -580 + pick() * 1160, z: roadGrid.horizontal[Math.floor(pick() * roadGrid.horizontal.length)] }; }
  function isOnRoad(x, z) { return roadGrid.vertical.some(v => Math.abs(v - x) < 9) || roadGrid.horizontal.some(v => Math.abs(v - z) < 9); }
  CS.city = { build, roadGrid, colliders, randomRoadPoint, isOnRoad, get scene() { return scene; } };
})();
