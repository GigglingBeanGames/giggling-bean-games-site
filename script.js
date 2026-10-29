const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

function closeMenu() {
  navigation?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}

menuButton?.addEventListener('click', () => {
  const isOpen = navigation?.classList.toggle('is-open') ?? false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1080) closeMenu();
});

const beanAssets = [
  'images/bean-pirate-v3.png',
  'images/bean-pest-control-v3.png',
  'images/bean-biomes-v3.png'
];

const beanTriggers = document.querySelectorAll('.bean-drop-trigger, .bean-burst-trigger');
const beanLayer = document.querySelector('.bean-drop-layer');
const beanParticles = new Set();
const logoReturnTimers = new WeakMap();
let beanAnimationFrame = 0;
let previousBeanFrame = 0;

function animateBeans(timestamp) {
  if (!previousBeanFrame) previousBeanFrame = timestamp;
  const delta = Math.min((timestamp - previousBeanFrame) / 1000, 0.035);
  previousBeanFrame = timestamp;

  beanParticles.forEach((particle) => {
    particle.age += delta;
    particle.velocityY += particle.gravity * delta;
    particle.velocityX *= Math.pow(0.985, delta * 60);
    particle.x += particle.velocityX * delta;
    particle.y += particle.velocityY * delta;
    particle.rotation += particle.rotationSpeed * delta;

    const fade = particle.age > 2.35 ? Math.max(0, 1 - (particle.age - 2.35) / 0.7) : 1;
    particle.element.style.opacity = String(fade);
    particle.element.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${particle.rotation}deg)`;

    if (particle.y > window.innerHeight + 90 || particle.age > 3.1 || fade === 0) {
      particle.element.remove();
      beanParticles.delete(particle);
    }
  });

  if (beanParticles.size) {
    beanAnimationFrame = requestAnimationFrame(animateBeans);
  } else {
    beanAnimationFrame = 0;
    previousBeanFrame = 0;
  }
}

function burstBeans(trigger) {
  if (!beanLayer) return;
  const logoRect = trigger.getBoundingClientRect();
  const startX = logoRect.left + logoRect.width / 2;
  const startY = logoRect.top + logoRect.height / 2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beanCount = reducedMotion ? 4 : 8 + Math.floor(Math.random() * 3);

  trigger.classList.add('is-bursting');
  clearTimeout(logoReturnTimers.get(trigger));
  logoReturnTimers.set(trigger, setTimeout(() => trigger.classList.remove('is-bursting'), 2300));

  for (let index = 0; index < beanCount; index += 1) {
    const bean = document.createElement('img');
    const size = Math.round(23 + Math.random() * 11);
    const horizontalDirection = (index / Math.max(1, beanCount - 1)) * 2 - 1;
    const particle = {
      element: bean,
      x: startX - size / 2 + (Math.random() * 18 - 9),
      y: startY - size / 2 + (Math.random() * 8 - 4),
      velocityX: horizontalDirection * (85 + Math.random() * 95) + (Math.random() * 44 - 22),
      velocityY: -(245 + Math.random() * 175),
      gravity: 830 + Math.random() * 240,
      rotation: Math.random() * 70 - 35,
      rotationSpeed: Math.random() * 620 - 310,
      age: 0
    };

    bean.className = 'physics-bean';
    bean.src = beanAssets[Math.floor(Math.random() * beanAssets.length)];
    bean.alt = '';
    bean.decoding = 'async';
    bean.style.width = `${size}px`;
    bean.style.height = `${size}px`;
    bean.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${particle.rotation}deg)`;
    beanLayer.append(bean);
    beanParticles.add(particle);
  }

  if (!beanAnimationFrame) beanAnimationFrame = requestAnimationFrame(animateBeans);
}

beanTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    if (trigger.matches('a')) event.preventDefault();
    burstBeans(trigger);
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
