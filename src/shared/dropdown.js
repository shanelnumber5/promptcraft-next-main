import { escapeHTML as e } from './html.js';

// Disclosure menus use native links/buttons and ordinary Tab order, never accordions.
export function renderDropdown({ id, label, content, className = '' }) {
  return `<div class="dropdown ${e(className)}" data-dropdown><button type="button" data-dropdown-toggle aria-expanded="false" aria-controls="${e(id)}">${e(label)}</button><div id="${e(id)}" class="dropdown-panel" popover="manual" hidden>${content}</div></div>`;
}

export function mountDropdowns(root = document) {
  const close = (menu, focus = false) => {
    const toggle = menu.querySelector('[data-dropdown-toggle]');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggle.dataset.closedLabel) toggle.textContent = toggle.dataset.closedLabel;
    const panel = menu.querySelector('.dropdown-panel');
    if (panel.isConnected && panel.matches(':popover-open')) panel.hidePopover();
    panel.hidden = true;
    if (focus) toggle.focus({ preventScroll: true });
  };
  const menus = () => [...root.querySelectorAll('[data-dropdown]')];
  const open = (menu) => {
    const toggle = menu.querySelector('[data-dropdown-toggle]'),
      panel = menu.querySelector('.dropdown-panel');
    toggle.setAttribute('aria-expanded', 'true');
    if (toggle.dataset.openLabel) toggle.textContent = toggle.dataset.openLabel;
    panel.hidden = false;
    panel.style.maxHeight = '';
    panel.showPopover?.();
    const r = toggle.getBoundingClientRect();
    const below = innerHeight - r.bottom - 12,
      above = r.top - 12,
      up = below < Math.min(panel.scrollHeight, 320) && above > below;
    panel.style.maxHeight = Math.max(80, (up ? above : below) - 8) + 'px';
    const bounds = panel.getBoundingClientRect();
    panel.style.left = Math.max(12, Math.min(r.left, innerWidth - bounds.width - 12)) + 'px';
    panel.style.top = (up ? Math.max(12, r.top - bounds.height - 8) : r.bottom + 8) + 'px';
  };
  root.addEventListener('click', (event) => {
    if (event.target.closest('dialog')) return;
    const toggle = event.target.closest('[data-dropdown-toggle]');
    const current = toggle?.closest('[data-dropdown]');
    for (const menu of menus()) if (menu !== current && !menu.contains(event.target)) close(menu);
    if (current) {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      if (opening) open(current);
      else close(current);
      return;
    }
    const selected = event.target.closest('.dropdown-panel a,.dropdown-panel button');
    if (selected && !selected.disabled) {
      if (root.querySelector('dialog[open]')) return;
      const menu = selected.closest('[data-dropdown]');
      // Dialogs and screen changes may already have moved focus to their destination.
      close(menu, document.activeElement === selected);
    }
  });
  root.addEventListener('keydown', (event) => {
    const menu = event.target.closest('[data-dropdown]');
    if (!menu) return;
    const toggle = menu.querySelector('[data-dropdown-toggle]');
    const panel = menu.querySelector('.dropdown-panel');
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      close(menu, true);
    }
    if (event.key === 'ArrowDown' && event.target === toggle) {
      event.preventDefault();
      open(menu);
      [...panel.querySelectorAll('a,button')]
        .find((el) => !el.hidden && !el.disabled && el.getClientRects().length)
        ?.focus();
    }
  });
  root.addEventListener('focusin', (event) => {
    if (root.querySelector('dialog[open]')) return;
    for (const menu of menus()) if (!menu.contains(event.target)) close(menu);
  });
  globalThis.window?.addEventListener('resize', () =>
    menus().forEach((menu) =>
      close(menu, menu.querySelector('.dropdown-panel').contains(root.activeElement)),
    ),
  );
}
