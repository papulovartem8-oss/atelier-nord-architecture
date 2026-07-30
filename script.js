const body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('motion-ready');
document.querySelectorAll('img').forEach((image) => {
  image.loading = 'lazy';
  image.decoding = 'async';
});

const intro = document.querySelector('.intro-screen');
const introWords = [...document.querySelectorAll('.intro-values__words span')];
let wordIndex = 0;

if (reducedMotion) {
  body.classList.add('site-ready');
  body.classList.remove('intro-active');
  intro.hidden = true;
} else {
  const wordTimer = window.setInterval(() => {
    introWords[wordIndex].classList.remove('is-current');
    introWords[wordIndex].classList.add('is-before');
    wordIndex += 1;
    if (wordIndex >= introWords.length) {
      window.clearInterval(wordTimer);
      return;
    }
    introWords[wordIndex].classList.add('is-current');
  }, 540);

  window.setTimeout(() => {
    intro.classList.add('is-exit');
    body.classList.add('site-ready');
  }, 3050);

  window.setTimeout(() => {
    body.classList.remove('intro-active');
    intro.hidden = true;
  }, 4000);
}

const heroVideo = document.querySelector('.hero-video');
const playHero = () => {
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
};
window.addEventListener('load', playHero);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) playHero();
});
window.addEventListener('pointerdown', playHero, { once:true });
if (heroVideo) {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) playHero();
    else heroVideo.pause();
  }, { threshold:.08 }).observe(heroVideo);
}

const heroLine = document.querySelector('[data-hero-line]');
const heroAccent = document.querySelector('[data-hero-accent]');
const heroTitle = heroLine?.closest('h1');
const heroPhrases = [
  { line:'Архитектура', accent:'частной жизни.' },
  { line:'Интерьеры', accent:'с характером.' },
  { line:'Пространства', accent:'вне времени.' }
];
const typePause = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
async function typeInto(element, value, speed) {
  for (const character of Array.from(value)) {
    element.textContent += character;
    await typePause(speed);
  }
}
async function eraseFrom(element, speed) {
  const characters = Array.from(element.textContent);
  while (characters.length) {
    characters.pop();
    element.textContent = characters.join('');
    await typePause(speed);
  }
}
async function rotateHeroPhrases() {
  if (!heroLine || !heroAccent || !heroTitle || reducedMotion) return;
  let phraseIndex = 0;
  await typePause(7000);
  while (true) {
    heroTitle.classList.add('is-typing');
    await eraseFrom(heroAccent, 26);
    await eraseFrom(heroLine, 22);
    phraseIndex = (phraseIndex + 1) % heroPhrases.length;
    await typePause(180);
    await typeInto(heroLine, heroPhrases[phraseIndex].line, 52);
    await typePause(120);
    await typeInto(heroAccent, heroPhrases[phraseIndex].accent, 58);
    heroTitle.classList.remove('is-typing');
    await typePause(3600);
  }
}
rotateHeroPhrases();

document.querySelectorAll('.contact > p,.contact-cta,.contact-grid > div').forEach((element) => element.classList.add('reveal'));

// Editorial type reveal: headings arrive as a composed sequence, not as one block.
// It deliberately stays on the main narrative headlines so the page never feels busy.
if (!reducedMotion) {
  const textRevealTargets = document.querySelectorAll([
    '.studio h2.reveal',
    '.studio-story__content h3.reveal',
    '.projects-title h2',
    '.services-head h2.reveal',
    '.process-lead h2',
    '.approach-statement h2',
    '.research-head h2',
    '.team-content h2',
    '.team-leadership__intro h3',
    '.contact > p'
  ].join(','));

  textRevealTargets.forEach((target) => {
    target.classList.add('text-reveal');
    const textNodes = [];
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let wordIndex = 0;
    textNodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(part);
          return;
        }
        const word = document.createElement('span');
        const wordInner = document.createElement('span');
        word.className = 'text-word';
        word.style.setProperty('--word-delay', `${Math.min(wordIndex * 42, 462)}ms`);
        wordInner.textContent = part;
        word.append(wordInner);
        fragment.append(word);
        wordIndex += 1;
      });
      node.replaceWith(fragment);
    });
  });
}

[
  '.studio-facts',
  '.service-list',
  '.process-steps',
  '.approach-principles',
  '.research-notes',
  '.team-roster',
  '.contact-grid'
].forEach((selector) => {
  const group = document.querySelector(selector);
  if (!group) return;
  [...group.children].forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 90}ms`);
  });
});
document.querySelectorAll('.project-list .project-card').forEach((card, index) => {
  card.style.setProperty('--reveal-delay', `${index % 2 * 110}ms`);
});
document.querySelectorAll('.project-archive__row').forEach((row, index) => {
  row.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 55}ms`);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .08, rootMargin: '0px 0px -4% 0px' });

const revealElements = [...document.querySelectorAll('.reveal,.reveal-image,.reveal-project')];
revealElements.forEach((element) => observer.observe(element));

// A small geometry fallback keeps reveals reliable after intro-lock and hash jumps.
// It only touches opacity/transform classes, so it stays cheap on long pages.
let revealFrame = 0;
const revealOnViewport = () => {
  const limit = window.innerHeight * 1.08;
  revealElements.forEach((element) => {
    if (element.classList.contains('is-visible')) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < limit && rect.bottom > -40) element.classList.add('is-visible');
  });
};
const requestRevealCheck = () => {
  if (revealFrame) return;
  revealFrame = window.requestAnimationFrame(() => {
    revealOnViewport();
    revealFrame = 0;
  });
};
window.addEventListener('scroll', requestRevealCheck, { passive: true });
window.addEventListener('resize', requestRevealCheck);
window.setTimeout(revealOnViewport, 120);

if (!reducedMotion) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = 'true';
      const finalValue = Number(entry.target.textContent);
      if (!Number.isFinite(finalValue)) {
        counterObserver.unobserve(entry.target);
        return;
      }
      const digits = entry.target.textContent.length;
      const startedAt = performance.now();
      const updateCounter = (now) => {
        const progress = Math.min((now - startedAt) / 1300, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        entry.target.textContent = String(Math.round(finalValue * eased)).padStart(digits, '0');
        if (progress < 1) requestAnimationFrame(updateCounter);
      };
      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold:.7 });
  document.querySelectorAll('.studio-facts strong').forEach((counter) => counterObserver.observe(counter));

  const parallaxImages = [...document.querySelectorAll('.project-card figure img')];
  let parallaxFrame = 0;
  const updateParallax = () => {
    parallaxFrame = 0;
    const visibleImages = parallaxImages.map((image) => {
      const bounds = image.parentElement.getBoundingClientRect();
      if (bounds.bottom < -100 || bounds.top > innerHeight + 100) return null;
      const centerOffset = (bounds.top + bounds.height / 2 - innerHeight / 2) / innerHeight;
      return [image, Math.max(-16, Math.min(16, centerOffset * -22)).toFixed(2)];
    }).filter(Boolean);
    visibleImages.forEach(([image, offset]) => image.style.setProperty('--parallax-y', `${offset}px`));
  };
  const requestParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(updateParallax);
  };
  window.addEventListener('scroll', requestParallax, { passive:true });
  window.addEventListener('resize', requestParallax);
  requestParallax();

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach((card) => {
      const figure = card.querySelector('figure');
      if (!figure) return;
      card.addEventListener('pointermove', (event) => {
        const bounds = figure.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        figure.style.setProperty('--tilt-x', `${(-y * 2.2).toFixed(2)}deg`);
        figure.style.setProperty('--tilt-y', `${(x * 2.2).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', () => {
        figure.style.setProperty('--tilt-x', '0deg');
        figure.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
}

const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const open = siteNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? 'Закрыть' : 'Меню';
});
siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  siteNav.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded','false');
  if (menuButton) menuButton.querySelector('span').textContent = 'Меню';
}));
const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const linkedSections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin:'-46% 0px -46% 0px', threshold:0 });
linkedSections.forEach((section) => activeSectionObserver.observe(section));

const projectList = document.querySelector('.project-list');
const projectCards = [...document.querySelectorAll('.project-card')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
function applyProjectFilter(filter, syncUrl = true) {
  const resolvedFilter = filterButtons.some((button) => button.dataset.filter === filter) ? filter : 'all';
  filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === resolvedFilter));
  projectList?.classList.toggle('is-filtered', resolvedFilter !== 'all');
  projectCards.forEach((card) => {
    const hidden = resolvedFilter !== 'all' && card.dataset.category !== resolvedFilter;
    card.classList.toggle('is-filtered-out', hidden);
    if (!hidden) card.classList.add('is-visible');
  });
  if (syncUrl) {
    const url = new URL(location.href);
    if (resolvedFilter === 'all') url.searchParams.delete('type');
    else url.searchParams.set('type', resolvedFilter);
    history.replaceState(null,'',`${url.pathname}${url.search}${url.hash}`);
  }
}
filterButtons.forEach((button) => button.addEventListener('click', () => applyProjectFilter(button.dataset.filter)));
applyProjectFilter(new URL(location.href).searchParams.get('type') || 'all', false);

const projectSignal = document.querySelector('.project-signal');
const projectSignalIndex = document.querySelector('[data-project-signal-index]');
const projectSignalTitle = document.querySelector('[data-project-signal-title]');
const projectsSection = document.querySelector('#projects');
if (projectSignal && projectsSection) {
  new IntersectionObserver(([entry]) => {
    projectSignal.classList.toggle('is-visible', entry.isIntersecting);
  }, { threshold:.08 }).observe(projectsSection);
  const signalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const label = entry.target.querySelector('.project-card__meta span')?.textContent || '';
      projectSignalIndex.textContent = label.split('/')[0].trim();
      projectSignalTitle.textContent = entry.target.querySelector('h3')?.textContent || '';
    });
  }, { threshold:.52 });
  projectCards.forEach((card) => signalObserver.observe(card));
}

const labBoard = document.querySelector('[data-lab-board]');
const labCaption = document.querySelector('[data-lab-caption]');
const labCopy = {
  climate:'Солнце · 08:40 / Ветер · ЮЗ 4,2 м/с',
  material:'Травертин · Бронза · Дуб / Образец 04',
  detail:'Допуск · ±2 мм / Узел фасада 12.4'
};
document.querySelectorAll('[data-lab-mode]').forEach((button) => button.addEventListener('click', () => {
  const mode = button.dataset.labMode;
  document.querySelectorAll('[data-lab-mode]').forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  if (labBoard) labBoard.dataset.mode = mode;
  if (labCaption) {
    labCaption.textContent = labCopy[mode];
    if (!reducedMotion) labCaption.animate(
      [{ opacity:.15, transform:'translateY(4px)' },{ opacity:1, transform:'translateY(0)' }],
      { duration:260, easing:'cubic-bezier(.23,1,.32,1)' }
    );
  }
}));

const viewers = [...document.querySelectorAll('.project-viewer')];
const mainContent = document.querySelector('main');
const projectCurtain = document.querySelector('.project-curtain');
const curtainTitle = document.querySelector('[data-curtain-title]');
const curtainIndex = document.querySelector('[data-curtain-index]');
let projectTransitioning = false;
let projectReturnFocus = null;
function commitProjectOpen(name) {
  viewers.forEach((viewer) => {
    const open = viewer.id === `project-${name}`;
    viewer.classList.toggle('is-open', open);
    viewer.setAttribute('aria-hidden', String(!open));
    if (open) viewer.scrollTop = 0;
  });
  body.classList.add('project-open');
  if (mainContent) mainContent.inert = true;
  const url = new URL(location.href);
  url.hash = `project-${name}`;
  history.replaceState(null,'',`${url.pathname}${url.search}${url.hash}`);
  document.querySelector(`#project-${name} [data-close-project]`)?.focus({ preventScroll:true });
}
function openProject(name) {
  const target = document.querySelector(`#project-${name}`);
  if (!target || projectTransitioning) return;
  if (!document.activeElement?.closest('.project-viewer')) projectReturnFocus = document.activeElement;
  if (reducedMotion || !projectCurtain) {
    commitProjectOpen(name);
    return;
  }
  projectTransitioning = true;
  body.classList.add('project-open');
  const index = viewers.indexOf(target) + 1;
  curtainIndex.textContent = String(index).padStart(2,'0');
  curtainTitle.textContent = target.querySelector('h2')?.textContent || '';
  projectCurtain.classList.remove('is-active','is-reveal');
  requestAnimationFrame(() => projectCurtain.classList.add('is-active'));
  window.setTimeout(() => commitProjectOpen(name), 500);
  window.setTimeout(() => projectCurtain.classList.add('is-reveal'), 760);
  window.setTimeout(() => {
    projectCurtain.classList.remove('is-active','is-reveal');
    projectTransitioning = false;
  }, 1370);
}
function closeProject() {
  viewers.forEach((viewer) => {
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden','true');
  });
  body.classList.remove('project-open');
  if (mainContent && !body.classList.contains('brief-open')) mainContent.inert = false;
  const url = new URL(location.href);
  url.hash = '';
  history.replaceState(null,'',`${url.pathname}${url.search}`);
  projectReturnFocus?.focus?.({ preventScroll:true });
}
document.querySelectorAll('[data-project]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.project)));
document.querySelectorAll('[data-close-project]').forEach((button) => button.addEventListener('click', closeProject));
viewers.forEach((viewer) => viewer.addEventListener('scroll', () => {
  const length = viewer.scrollHeight - viewer.clientHeight;
  viewer.style.setProperty('--case-progress', length > 0 ? viewer.scrollTop / length : 0);
}, { passive:true }));
window.addEventListener('load', () => {
  if (location.hash.startsWith('#project-')) commitProjectOpen(location.hash.replace('#project-',''));
});

const briefPanel = document.querySelector('.brief-panel');
const briefForm = document.querySelector('.brief-form');
let briefReturnFocus = null;
function openBrief() {
  if (!briefPanel) return;
  briefReturnFocus = document.activeElement;
  closeProject();
  briefPanel.classList.add('is-open');
  briefPanel.setAttribute('aria-hidden','false');
  body.classList.add('brief-open');
  if (mainContent) mainContent.inert = true;
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    window.setTimeout(() => briefPanel.querySelector('input')?.focus(), 280);
  }
}
function closeBrief() {
  if (!briefPanel?.classList.contains('is-open')) return;
  briefPanel.classList.remove('is-open');
  briefPanel.setAttribute('aria-hidden','true');
  body.classList.remove('brief-open');
  if (mainContent) mainContent.inert = false;
  briefReturnFocus?.focus?.();
}
document.querySelectorAll('[data-open-brief]').forEach((button) => button.addEventListener('click', openBrief));
document.querySelectorAll('[data-close-brief]').forEach((button) => button.addEventListener('click', closeBrief));
briefForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(briefForm);
  const subject = `Новый проект — ${data.get('name') || 'запрос'}`;
  const message = [
    `Имя: ${data.get('name') || '—'}`,
    `Почта: ${data.get('email') || '—'}`,
    `Локация: ${data.get('location') || '—'}`,
    `Тип проекта: ${data.get('type') || '—'}`,
    `Площадь: ${data.get('area') || '—'}`,
    '',
    'О проекте:',
    data.get('message') || '—'
  ].join('\n');
  window.location.href = `mailto:studio@ateliernord.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
});
window.addEventListener('keydown', (event) => {
  const activeDialog = briefPanel?.classList.contains('is-open')
    ? briefPanel
    : viewers.find((viewer) => viewer.classList.contains('is-open'));
  if (event.key === 'Tab' && activeDialog) {
    const focusable = [...activeDialog.querySelectorAll('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.disabled && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  if (event.key === 'Escape') {
    if (briefPanel?.classList.contains('is-open')) closeBrief();
    else closeProject();
  }
});

const progress = document.querySelector('.scroll-progress i');
let progressFrame = 0;
const updateProgress = () => {
  progressFrame = 0;
  const length = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${length > 0 ? scrollY / length : 0})`;
};
window.addEventListener('scroll', () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}, { passive:true });

const cursor = document.querySelector('.cursor');
let cx=-50,cy=-50,tx=-50,ty=-50;
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('pointermove',(event)=>{tx=event.clientX;ty=event.clientY;});
  function drawCursor(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cursor.style.left=`${cx}px`;cursor.style.top=`${cy}px`;requestAnimationFrame(drawCursor);}
  drawCursor();
  document.querySelectorAll('a,button').forEach((element)=>{
    element.addEventListener('mouseenter',()=>cursor.classList.add('is-active'));
    element.addEventListener('mouseleave',()=>cursor.classList.remove('is-active'));
  });
}
