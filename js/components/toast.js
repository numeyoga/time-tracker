/**
 * Toast notification component.
 * Injects toast elements into a container element managed by the page.
 */

/**
 * Creates an SVG element with the given path data.
 * @param {string[][]} paths — array of [element tag, attrs object] tuples
 * @param {string} cls
 * @returns {SVGElement}
 */
const makeSvg = (cls, children) => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const [tag, attrs] of children) {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    svg.appendChild(el);
  }
  return svg;
};

const ICON_PATHS = {
  success: [
    ['path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }],
    ['polyline', { points: '22 4 12 14.01 9 11.01' }],
  ],
  danger: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '12', y1: '8', x2: '12', y2: '12' }],
    ['line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }],
  ],
  warning: [
    ['path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }],
    ['line', { x1: '12', y1: '9', x2: '12', y2: '13' }],
    ['line', { x1: '12', y1: '17', x2: '12.01', y2: '17' }],
  ],
  info: [
    ['circle', { cx: '12', cy: '12', r: '10' }],
    ['line', { x1: '12', y1: '16', x2: '12', y2: '12' }],
    ['line', { x1: '12', y1: '8', x2: '12.01', y2: '8' }],
  ],
};

const CLOSE_PATHS = [
  ['line', { x1: '18', y1: '6', x2: '6', y2: '18' }],
  ['line', { x1: '6', y1: '6', x2: '18', y2: '18' }],
];

const removeToast = (toast) => {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(var(--space-2))';
  toast.style.transition = `opacity var(--duration-fast) var(--ease-in), transform var(--duration-fast) var(--ease-in)`;
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
};

/**
 * Displays a toast notification.
 * @param {object} opts
 * @param {string} opts.message
 * @param {'success'|'danger'|'warning'|'info'} [opts.variant='info']
 * @param {number} [opts.duration=5000] — 0 = manual close only
 */
export const showToast = ({ message, variant = 'info', duration = 5000 }) => {
  const container = document.querySelector('[data-js-toast-container]');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('data-variant', variant);

  const iconPaths = ICON_PATHS[variant] ?? ICON_PATHS.info;
  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast__message';
  msgSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn';
  closeBtn.setAttribute('data-variant', 'ghost');
  closeBtn.setAttribute('data-size', 'sm');
  closeBtn.setAttribute('aria-label', 'Fermer la notification');
  closeBtn.setAttribute('type', 'button');
  closeBtn.appendChild(makeSvg('btn__icon', CLOSE_PATHS));
  closeBtn.addEventListener('click', () => removeToast(toast));

  toast.appendChild(makeSvg('toast__icon', iconPaths));
  toast.appendChild(msgSpan);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  if (duration > 0) setTimeout(() => removeToast(toast), duration);
};
