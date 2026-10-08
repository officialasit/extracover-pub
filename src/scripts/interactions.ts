import { animate } from 'motion/mini';
import { inView, hover } from 'motion';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Map<HTMLElement, ReturnType<typeof animate>>();
function enter(element: HTMLElement, distance = 8, duration = 0.35, delay = 0) {
  animations.get(element)?.stop();
  if (reducedMotion.matches) {
    element.style.opacity = '1';
    element.style.transform = 'none';
    return;
  }
  const animation = animate(element, {
    opacity: [0.35, 1],
    transform: [`translateY(${distance}px)`, 'translateY(0px)'],
  }, { duration, delay, ease: [0.22, 1, 0.36, 1] });
  animations.set(element, animation);
  animation.then(() => { if (animations.get(element) === animation) animations.delete(element); });
}

const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
function selectTab(tab: HTMLButtonElement) {
  if (tab.getAttribute('aria-selected') === 'true') return;
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls')!);
    if (panel) {
      panel.hidden = !active;
      if (active) enter(panel, 5, 0.22);
    }
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus(); selectTab(tabs[next]);
  });
});

const menu = document.querySelector<HTMLButtonElement>('.mobile-menu');
const nav = document.querySelector<HTMLElement>('#main-nav');
function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Open navigation'); }
menu?.addEventListener('click', () => {
  const open = nav?.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

document.querySelector('.theme-toggle')?.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('ec-landing-theme', next); } catch {}
});

const studioDialog = document.querySelector<HTMLDialogElement>('#studio-dialog');
const studioSlides = Array.from(document.querySelectorAll<HTMLElement>('[data-studio-slide]'));
const studioBack = document.querySelector<HTMLButtonElement>('[data-studio-back]');
const studioNext = document.querySelector<HTMLButtonElement>('[data-studio-next]');
let studioSlide = 0;
function showStudioSlide(index: number, focus = true) {
  studioSlide = Math.max(0, Math.min(index, studioSlides.length - 1));
  studioSlides.forEach((slide, i) => { slide.hidden = i !== studioSlide; });
  if (studioBack) studioBack.disabled = studioSlide === 0;
  const label = studioNext?.querySelector('span');
  if (label) label.textContent = studioSlide === studioSlides.length - 1 ? 'Done' : 'Next';
  const count = document.querySelector('.studio-slide-count');
  if (count) count.textContent = `${studioSlide + 1} / ${studioSlides.length}`;
  if (focus) {
    studioSlides[studioSlide]?.focus({ preventScroll: true });
    if (studioSlides[studioSlide]) enter(studioSlides[studioSlide], 6, 0.25);
  }
}
studioBack?.addEventListener('click', () => showStudioSlide(studioSlide - 1));
studioNext?.addEventListener('click', () => {
  if (studioSlide === studioSlides.length - 1) studioDialog?.close();
  else showStudioSlide(studioSlide + 1);
});
studioDialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' && studioSlide < studioSlides.length - 1) { event.preventDefault(); showStudioSlide(studioSlide + 1); }
  if (event.key === 'ArrowLeft' && studioSlide > 0) { event.preventDefault(); showStudioSlide(studioSlide - 1); }
});
document.querySelectorAll<HTMLButtonElement>('[data-dialog]').forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById(button.dataset.dialog!) as HTMLDialogElement;
  if (dialog === studioDialog) showStudioSlide(0, false);
  dialog?.showModal();
  if (dialog) enter(dialog, 8, 0.25);
}));
// Download links keep their default action, so the file downloads in the
// background (and still works without JavaScript) while next steps open on top.
document.querySelectorAll<HTMLAnchorElement>('a[data-download-dialog]').forEach(link => link.addEventListener('click', () => {
  const dialog = document.getElementById(link.dataset.downloadDialog!) as HTMLDialogElement | null;
  if (!dialog || dialog.open) return;
  link.closest('dialog')?.close();
  setTimeout(() => { dialog.showModal(); enter(dialog, 8, 0.25); });
}));
document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
}));
document.querySelector('.copy-link')?.addEventListener('click', async () => {
  const status = document.querySelector<HTMLElement>('.copy-status')!;
  try {
    await navigator.clipboard.writeText(location.href.split('#')[0]);
    status.textContent = 'Page link copied.';
  } catch { status.textContent = 'Copy the page address from your browser.'; }
});

// Content remains visible before enhancement; reveals never gate reading.
const hero = document.querySelector<HTMLElement>('.hero-content');
if (hero) enter(hero, 8, 0.45);
const revealed = new WeakSet<Element>();
const stopInView = inView('.reveal, .feature-tabs, .hero-visual, .faq-heading, .faq-list, .site-footer', element => {
  if (revealed.has(element)) return;
  revealed.add(element);
  const group = element.matches('.install-steps, .download-cards, .feature-tabs, .faq-list');
  if (group) Array.from(element.children).forEach((child, index) => enter(child as HTMLElement, 10, 0.4, index * 0.06));
  else enter(element as HTMLElement, 10, 0.45);
}, { amount: 0.15 });
const stopHover = hover('.hero-art', element => {
  if (reducedMotion.matches) return;
  const target = element as HTMLElement;
  const animation = animate(target, { transform: 'translateY(-3px)' }, { duration: 0.25 });
  animations.set(target, animation);
  return () => {
    animations.get(target)?.stop();
    if (reducedMotion.matches) target.style.transform = 'none';
    else animations.set(target, animate(target, { transform: 'translateY(0px)' }, { duration: 0.25 }));
  };
});
function syncMotionPreference() {
  if (reducedMotion.matches) {
    animations.forEach((animation, element) => {
      animation.stop(); element.style.opacity = '1'; element.style.transform = 'none';
    });
    animations.clear();
  }
}
reducedMotion.addEventListener('change', syncMotionPreference);
if (import.meta.hot) import.meta.hot.dispose(() => {
  stopInView(); stopHover();
  reducedMotion.removeEventListener('change', syncMotionPreference);
  animations.forEach(animation => animation.stop());
});
