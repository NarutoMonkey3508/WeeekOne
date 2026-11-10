// WeeekOne 3D background for the home page (Spline-style glossy shapes, built with three.js).
//
// To use a real Spline scene instead: in Spline, Export → Viewer → copy the
// "prod.spline.design/.../scene.splinecode" link and put it in data-spline="" on
// <div id="bg3d"> in index.html. The Spline viewer is then loaded instead of this scene.
//
// The page works without this file: if WebGL is missing, data saving is on, or anything
// fails, the plain colour background stays. With reduced motion, one still frame is drawn.

const host = document.getElementById('bg3d');
const section = host && host.closest('section');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection && navigator.connection.saveData;

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}

async function startSpline(url) {
  await import('https://unpkg.com/@splinetool/viewer@2.0.113/build/spline-viewer.js');
  const v = document.createElement('spline-viewer');
  v.setAttribute('url', url);
  v.setAttribute('loading-anim-type', 'none');
  v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  host.appendChild(v);
  host.classList.add('ready');
}

async function startThree() {
  const THREE = await import('./vendor/three.module.min.js');
  const { RoomEnvironment } = await import('./vendor/RoomEnvironment.js');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 4, 6); scene.add(key);
  const blue = new THREE.PointLight(0x0297DE, 40, 40); blue.position.set(-6, 5, 4); scene.add(blue);
  const orange = new THREE.PointLight(0xFC734D, 35, 40); orange.position.set(6, -4, 4); scene.add(orange);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const glossy = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, ...extra });
  const M = {
    midnight: glossy(0x0b1419), orange: glossy(0xFC734D), blue: glossy(0x0297DE), sky: glossy(0x5CC3FF),
    white: glossy(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.25 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.6, ior: 1.3, clearcoat: 1 }),
  };

  // --- the WeeekOne calendar (same proportions as the logo) ---
  function roundedRect(x, y, w, h, r, topOnly) {
    const s = new THREE.Shape();
    s.moveTo(x + r, y + h); s.lineTo(x + w - r, y + h); s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
    if (topOnly) { s.lineTo(x + w, y); s.lineTo(x, y); }
    else { s.lineTo(x + w, y + r); s.quadraticCurveTo(x + w, y, x + w - r, y); s.lineTo(x + r, y); s.quadraticCurveTo(x, y, x, y + r); }
    s.lineTo(x, y + h - r); s.quadraticCurveTo(x, y + h, x + r, y + h);
    return s;
  }
  const ext = (shape, depth, bevel = 0.03) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 20 });
    g.translate(0, 0, -depth / 2); return g;
  };
  const U = 0.01;
  const cal = new THREE.Group();
  cal.add(new THREE.Mesh(ext(roundedRect(-60 * U, -60 * U, 120 * U, 120 * U, 24 * U), 0.22), M.midnight));
  const band = new THREE.Mesh(ext(roundedRect(-60 * U, 26 * U, 120 * U, 34 * U, 24 * U, true), 0.24), M.orange); band.position.z = 0.006; cal.add(band);
  for (const x of [-25, 25]) { const r = new THREE.Mesh(new THREE.CapsuleGeometry(7 * U, 14 * U, 8, 20), M.midnight); r.position.set(x * U, 58 * U, 0.13); cal.add(r); }
  const one = new THREE.Shape();
  one.moveTo(70.18, 114.74); one.lineTo(57.47, 114.74); one.lineTo(57.47, 80.89); one.lineTo(49.82, 80.89); one.lineTo(49.82, 69.89);
  one.quadraticCurveTo(53.64, 69.89, 55.98, 68.52); one.quadraticCurveTo(58.32, 67.16, 59.03, 63.26); one.lineTo(70.18, 63.26); one.closePath();
  const oneG = new THREE.ExtrudeGeometry(one, { depth: 6, bevelEnabled: true, bevelThickness: 1, bevelSize: 0.6, bevelSegments: 3 });
  oneG.translate(-60, -72, 0); oneG.scale(U, U, U); oneG.rotateX(Math.PI);
  const oneM = new THREE.Mesh(oneG, M.white); oneM.position.z = 0.2; cal.add(oneM);

  // --- floating shapes, placed around the headline and cards (never on top of the text) ---
  const pill = (mat) => new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.9, 10, 28), mat);
  const items = [
    { name: 'cal', obj: cal, size: 1.4, spin: 0.25 },
    { name: 'dot', obj: new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), M.orange), size: 1.0, spin: 0 },
    { name: 'ring', obj: new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.2, 28, 64), M.blue), size: 1.5, spin: 0.35 },
    { name: 'pillA', obj: pill(M.orange), size: 1.6, spin: 0.5 },
    { name: 'pillB', obj: pill(M.sky), size: 1.6, spin: -0.45 },
    { name: 'glass', obj: new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), M.glass), size: 1.0, spin: 0 },
    { name: 'gem', obj: new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), M.sky), size: 1.0, spin: 0.6 },
  ];
  items.forEach((it, i) => { it.phase = i * 1.37; scene.add(it.obj); });
  const byName = Object.fromEntries(items.map(it => [it.name, it]));

  let W = 1, H = 1;
  // [x px, y px, size px, z] for each shape, worked out from where the text and cards are
  function spots() {
    const box = host.getBoundingClientRect();
    const rel = el => { const r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top }; };
    const head = rel(section.querySelector('.chooser-head h1'));
    const lead = rel(section.querySelector('.chooser-head .lead'));
    const cards = rel(section.querySelector('.paths'));
    const trust = rel(section.querySelector('.trust-strip'));
    const side = Math.max(0, cards.l);                       // empty margin each side of the cards
    if (W < 700) {                                          // phone: only the edges and corners
      return {
        cal: [W - 30, head.t + 34, 90, 0.5], dot: [W - 96, lead.b + 30, 34, -1],
        ring: [-6, cards.t + 30, 70, -1], pillA: [W + 6, cards.b - 120, 90, 0],
        glass: [18, trust.t - 30, 46, 1], pillB: [W - 30, trust.b + 30, 70, 0], gem: null,
      };
    }
    const right = Math.max(head.r, lead.r);
    const calX = Math.min(W - 110, Math.max(right + 170, W - 260));
    return {
      cal: [calX, head.t + 120, 230, 0.5],
      dot: [calX - 190, head.t - 10, 70, -1],
      ring: [side * 0.5, cards.t + 90, 130, -1],
      pillA: [W - side * 0.5, cards.b - 70, 150, 0],
      glass: [side * 0.55, trust.t + 10, 80, 1],
      gem: [W - side * 0.6, trust.t - 20, 70, -2],
      pillB: [W * 0.5 + 200, trust.b + 50, 110, 0],
    };
  }
  function layout() {
    const r = host.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    const where = spots();
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    items.forEach(it => {
      const spot = where[it.name];
      it.obj.visible = !!spot;
      if (!spot) return;
      const [px, py, sizePx, z] = spot;
      const visH = 2 * (camera.position.z - z) * tanHalf, visW = visH * camera.aspect;
      it.base = new THREE.Vector3((px / W - 0.5) * visW, (0.5 - py / H) * visH, z);
      it.obj.scale.setScalar((sizePx * visH / H) / it.size);
    });
  }

  // Gentle parallax that follows the mouse on computers
  const target = { x: 0, y: 0 }, look = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    target.x = (e.clientX / innerWidth - 0.5) * 0.8;
    target.y = (e.clientY / innerHeight - 0.5) * 0.5;
  }, { passive: true });

  function draw(t) {
    look.x += (target.x - look.x) * 0.05; look.y += (target.y - look.y) * 0.05;
    camera.position.x = look.x * 0.5; camera.position.y = -look.y * 0.5; camera.lookAt(camera.position.x * 0.2, camera.position.y * 0.2, 0);
    items.forEach(it => {
      const p = it.phase;
      if (!it.obj.visible) return;
      const f = it.obj.scale.x * 0.12;
      it.obj.position.set(it.base.x + Math.sin(t * 0.4 + p) * f, it.base.y + Math.sin(t * 0.7 + p) * f * 1.6, it.base.z);
      if (it.obj === cal) { cal.rotation.set(0.12 + Math.sin(t * 0.5) * 0.08, -0.45 + Math.sin(t * 0.35) * 0.35, Math.sin(t * 0.3) * 0.05); }
      else { it.obj.rotation.set(t * it.spin * 0.6 + p, t * it.spin + p, Math.sin(t * 0.3 + p) * 0.4); }
    });
    renderer.render(scene, camera);
  }

  layout();
  addEventListener('resize', layout);
  draw(0);
  host.classList.add('ready');
  if (reduceMotion) return;                 // one still frame only

  // Run only while the home section is on screen and the tab is visible
  let onScreen = true, raf = 0;
  const t0 = performance.now();
  const loop = () => { raf = 0; if (!onScreen || document.hidden) return; draw((performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); };
  const wake = () => { if (!raf && onScreen && !document.hidden) { layout(); raf = requestAnimationFrame(loop); } };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; wake(); }).observe(section || host);
  document.addEventListener('visibilitychange', wake);
  new MutationObserver(wake).observe(document.body, { attributes: true, attributeFilter: ['data-path'] });
  wake();
}

if (host && !saveData && hasWebGL()) {
  const start = () => (host.dataset.spline ? startSpline(host.dataset.spline) : startThree()).catch(err => console.warn('3D background skipped:', err));
  // Wait until the page has loaded, so the 3D never slows down the first view
  if (document.readyState === 'complete') setTimeout(start, 200);
  else addEventListener('load', () => setTimeout(start, 200));
}
