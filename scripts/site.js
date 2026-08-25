const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = navigator.connection?.saveData === true;

if (!reducedMotion) document.documentElement.classList.add('motion-ready');

const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const syncNav = () => nav?.classList.toggle('is-scrolled', scrollY > 18);
addEventListener('scroll', syncNav, { passive: true });
syncNav();

if (nav && navToggle) {
  document.documentElement.classList.add('has-navigation');

  const closeMenu = () => {
    nav.classList.remove('is-menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-menu-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('is-menu-open')) return;
    closeMenu();
    navToggle.focus();
  });
}

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
const manuallyPausedVideos = new WeakSet();
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
    if (video.paused || video.ended) {
      manuallyPausedVideos.delete(video);
      video.play().catch(() => {});
    } else {
      manuallyPausedVideos.add(video);
      video.pause();
    }
  });
  video.addEventListener('play', syncButton);
  video.addEventListener('pause', syncButton);
  syncButton();
}

if (!reducedMotion && !saveData && 'IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !manuallyPausedVideos.has(entry.target)) entry.target.play().catch(() => {});
      else entry.target.pause();
    }
  }, { rootMargin: '160px' });
  projectVideos.forEach((video) => videoObserver.observe(video));
}
