import {
  AdditiveBlending,
  BufferGeometry,
  Clock,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const saveData = navigator.connection?.saveData === true;

if (!reducedMotion) document.documentElement.classList.add('motion-ready');

const nav = document.querySelector('.nav');
const syncNav = () => nav?.classList.toggle('is-scrolled', scrollY > 18);
addEventListener('scroll', syncNav, { passive: true });
syncNav();

const reveals = document.querySelectorAll('[data-reveal]');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

const projectVideos = document.querySelectorAll('.project-visual video');
for (const video of projectVideos) {
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'vid-toggle';
  button.textContent = 'Play film';
  button.setAttribute('aria-label', 'Play project animation');
  video.parentElement.append(button);

  const syncButton = () => {
    const paused = video.paused || video.ended;
    button.textContent = paused ? 'Play film' : 'Pause film';
    button.setAttribute('aria-label', paused ? 'Play project animation' : 'Pause project animation');
    button.setAttribute('aria-pressed', String(!paused));
  };

  button.addEventListener('click', () => {
    if (video.paused || video.ended) video.play().catch(() => {});
    else video.pause();
  });
  video.addEventListener('play', syncButton);
  video.addEventListener('pause', syncButton);
  syncButton();
}

if (!reducedMotion && !saveData && 'IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    }
  }, { rootMargin: '160px' });
  projectVideos.forEach((video) => videoObserver.observe(video));
}

const canvas = document.querySelector('#observatory-canvas');
let stopRendering = false;

if (canvas) {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.05, 6.4);

    const sculpture = new Group();
    sculpture.rotation.set(-0.18, -0.36, 0.08);
    scene.add(sculpture);

    const colors = [0x78bfff, 0xa9d5ff, 0xe0f2ff, 0x6f93b6, 0xa5c8e8, 0xd3e8fa, 0x749abd];
    const bandCount = 7;
    const bandPoints = 220;

    for (let band = 0; band < bandCount; band += 1) {
      const points = [];
      const phase = band * 0.56;
      const spread = (band - (bandCount - 1) / 2) * 0.105;

      for (let index = 0; index <= bandPoints; index += 1) {
        const angle = (index / bandPoints) * Math.PI * 2;
        const pulse = 1 + Math.sin(angle * 3 + phase) * 0.045;
        points.push(new Vector3(
          Math.cos(angle) * 2.12 * pulse,
          Math.sin(angle * 2 + phase) * 0.42 + spread,
          Math.sin(angle) * 1.34 * pulse,
        ));
      }

      const geometry = new BufferGeometry().setFromPoints(points);
      const material = new LineBasicMaterial({
        color: colors[band],
        transparent: true,
        opacity: 0.19 + band * 0.045,
        blending: AdditiveBlending,
      });
      sculpture.add(new Line(geometry, material));
    }

    const nodePositions = [];
    for (let index = 0; index < 28; index += 1) {
      const angle = (index / 28) * Math.PI * 2;
      const phase = (index % bandCount) * 0.56;
      nodePositions.push(
        Math.cos(angle) * 2.12,
        Math.sin(angle * 2 + phase) * 0.42 + ((index % bandCount) - 3) * 0.105,
        Math.sin(angle) * 1.34,
      );
    }
    const nodeGeometry = new BufferGeometry();
    nodeGeometry.setAttribute('position', new Float32BufferAttribute(nodePositions, 3));
    const nodes = new Points(nodeGeometry, new PointsMaterial({
      color: 0xe0f2ff,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      blending: AdditiveBlending,
    }));
    sculpture.add(nodes);

    const halo = new Mesh(
      new TorusGeometry(1.03, 0.006, 5, 180),
      new MeshBasicMaterial({
        color: 0xa9d5ff,
        transparent: true,
        opacity: 0.3,
        blending: AdditiveBlending,
      }),
    );
    halo.rotation.set(1.12, 0.34, 0.72);
    sculpture.add(halo);

    const target = { x: sculpture.rotation.x, y: sculpture.rotation.y };
    if (finePointer && !reducedMotion) {
      canvas.closest('.instrument')?.addEventListener('pointermove', (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        target.y = -0.36 + ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.32;
        target.x = -0.18 + ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.22;
      });
      canvas.closest('.instrument')?.addEventListener('pointerleave', () => {
        target.x = -0.18;
        target.y = -0.36;
      });
    }

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const clock = new Clock();
    const render = () => {
      if (stopRendering) return;
      const elapsed = clock.getElapsedTime();
      sculpture.rotation.x += (target.x - sculpture.rotation.x) * 0.035;
      sculpture.rotation.y += (target.y - sculpture.rotation.y) * 0.035;
      sculpture.rotation.z = 0.08 + Math.sin(elapsed * 0.18) * 0.035;
      halo.rotation.z = 0.72 + elapsed * 0.055;
      nodes.material.opacity = 0.76 + Math.sin(elapsed * 0.8) * 0.16;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    document.documentElement.classList.add('has-webgl');
    if (reducedMotion || saveData) renderer.render(scene, camera);
    else requestAnimationFrame(render);

    document.addEventListener('visibilitychange', () => {
      stopRendering = document.hidden;
      if (!stopRendering && !reducedMotion && !saveData) {
        clock.getDelta();
        requestAnimationFrame(render);
      }
    });

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      stopRendering = true;
      document.documentElement.classList.remove('has-webgl');
    });
  } catch {
    document.documentElement.classList.remove('has-webgl');
  }
}
