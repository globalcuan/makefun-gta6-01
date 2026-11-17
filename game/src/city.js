(function () {
  const cfg = CS.config, colliders = [], roads = [];
  let scene, rand = CS.rng(721);
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
  function box(parent, x, y, z, w, h, d, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function building(x, z) {
    const w = 12 + rand() * 17, d = 12 + rand() * 17, h = 8 + rand() * 47;
    const color = cfg.palette.stucco[Math.floor(rand() * cfg.palette.stucco.length)];
    box(scene, x, h / 2, z, w, h, d, mat(color));
    box(scene, x, h + 0.35, z, w + 1, 0.7, d + 1, mat(cfg.palette.roof));
    for (let floor = 1; floor < Math.floor(h / 4.5); floor++) {
      for (let side = -1; side <= 1; side += 2) box(scene, x + side * (w / 2 + 0.05), floor * 4.5, z, 0.12, 1.5, 1.7, mat(cfg.palette.glass));
    }
    if (rand() < 0.25) box(scene, x, h + 2.2, z, w * 0.55, 3, d * 0.55, mat(color));
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  }
  function tree(x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 6, 6), mat(0x8b5739));
    trunk.position.set(x, 3, z); scene.add(trunk);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5, 5), mat(0x34754a));
      leaf.position.set(x + Math.cos(i) * 2, 7, z + Math.sin(i) * 2); leaf.rotation.z = -0.7; scene.add(leaf);
    }
  }
  function drawRoadGrid() {
    const asphalt = mat(cfg.palette.asphalt), dash = mat(cfg.palette.dash);
    for (let x = -540; x <= 540; x += 120) {
      roads.push({ x, vertical: true });
      box(scene, x, 0.03, -50, 18, 0.06, 980, asphalt);
      for (let z = -525; z <= 435; z += 24) box(scene, x, 0.07, z, 0.35, 0.025, 9, dash);
    }
    for (let z = -540; z <= 420; z += 120) {
      roads.push({ z, vertical: false });
      box(scene, 0, 0.04, z, 1200, 0.06, 18, asphalt);
      for (let x = -585; x <= 585; x += 24) box(scene, x, 0.08, z, 9, 0.025, 0.35, dash);
    }
  }
  function build() {
    scene = new THREE.Scene(); scene.background = new THREE.Color(cfg.palette.sky);
    scene.fog = new THREE.Fog(cfg.palette.sky, cfg.fog.start, cfg.fog.end);
    scene.add(new THREE.HemisphereLight(0xffe0b2, 0x66584c, cfg.lighting.hemisphere));
    const ambient = new THREE.AmbientLight(0xffffff, cfg.lighting.ambient); scene.add(ambient);
    const sun = new THREE.DirectionalLight(cfg.lighting.sun, cfg.lighting.sunIntensity);
    sun.position.set(-180, 300, 140); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -700; sun.shadow.camera.right = sun.shadow.camera.top = 700; scene.add(sun);
    box(scene, 0, -1, 0, 1200, 1, 1200, mat(cfg.palette.ground)); drawRoadGrid();
    box(scene, 0, -0.45, 505, 1200, 0.1, 130, mat(cfg.palette.sand));
    const seaGeom = new THREE.PlaneGeometry(1200, 500, 32, 20); seaGeom.rotateX(-Math.PI / 2);
    const sea = new THREE.Mesh(seaGeom, mat(cfg.palette.sea)); sea.position.set(0, -0.35, 820);
    sea.userData.animate = function (t) { const p = sea.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(t * 1.4 + p.getX(i) * 0.025 + p.getZ(i) * 0.04) * 0.35); p.needsUpdate = true; sea.geometry.computeVertexNormals(); };
    scene.add(sea);
    for (let x = -510; x <= 510; x += 40) for (let z = -490; z <= 370; z += 40) if (rand() < 0.72) building(x + rand() * 12 - 6, z + rand() * 12 - 6);
    for (let i = 0; i < 42; i++) tree(-555 + rand() * 1110, 385 + rand() * 40);
    for (let x = -540; x <= 540; x += 120) for (let z = -540; z <= 420; z += 120) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6, 6), mat(0x4a4641)); pole.position.set(x + 12, 3, z + 12); scene.add(pole);
      box(scene, x + 12, 6.1, z + 12, 1.2, 0.18, 0.18, mat(0xffd283));
    }
    for (let i = 0; i < 16; i++) box(scene, -500 + rand() * 1000, 1, -500 + rand() * 850, 2, 2, 2, mat(0x9b673b));
    return scene;
  }
  function isOnRoad(x, z) { return roads.some(r => r.vertical ? Math.abs(x - r.x) < 9 : Math.abs(z - r.z) < 9); }
  function randomRoadPoint(rng) { const r = rng || CS.random, vertical = r() < 0.5, line = Math.floor(r() * 10) * 120 - 540; return vertical ? { x: line, z: -540 + r() * 960 } : { x: -540 + r() * 1080, z: line }; }
  CS.city = { build, colliders, randomRoadPoint, isOnRoad, get roadGrid() { return roads; } };
}());
