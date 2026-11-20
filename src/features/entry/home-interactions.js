// The artwork responds to pointer and keyboard focus; navigation remains ordinary links.
export function mountHomeInteractions(app) {
  const root = app.querySelector('.reference-home');
  if (!root) return () => {};
  const controller = new AbortController(),
    options = { signal: controller.signal };
  const captions = {
    0: 'A place to experiment with your teaching.',
    1: 'Meet Pixel and Maya through a guided classroom challenge.',
    2: 'Shape an activity around your learners and learning goal.',
    3: 'Find a starting point. Make it your own.',
    4: 'Take your assignment and rubric into your course.',
  };
  function show(id) {
    root.querySelectorAll('[data-workshop-plate]').forEach((plate) => {
      const active = plate.dataset.workshopPlate === id;
      plate.classList.toggle('is-active', active);
      plate.setAttribute('aria-hidden', String(!active));
    });
    root.querySelector('[data-workshop-caption]').textContent = captions[id] || captions[0];
  }
  const activate = (event) => {
    const row = event.target.closest('[data-home-plate]');
    if (row) show(row.dataset.homePlate);
  };
  root.addEventListener('pointerover', activate, options);
  root.addEventListener('focusin', activate, options);
  root.addEventListener(
    'pointerleave',
    () => {
      if (!root.contains(document.activeElement)) show('0');
    },
    options,
  );
  root.addEventListener(
    'focusout',
    (event) => {
      if (!root.contains(event.relatedTarget)) show('0');
    },
    options,
  );
  return () => controller.abort();
}
