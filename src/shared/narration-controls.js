export function updateNarrationControls(app, audio) {
  const toggle = app.querySelector('[data-action="toggle-narration"]');
  if (!toggle) return;
  toggle.disabled = !audio.available;
  toggle.setAttribute('aria-pressed', String(audio.enabled));
  toggle.textContent = audio.enabled ? 'Stop narration' : 'Read aloud';
  const repeat = app.querySelector('[data-action="repeat-narration"]');
  if (repeat) repeat.disabled = !audio.enabled;
  const status = app.querySelector('.narration-status');
  if (status) {
    status.setAttribute(
      'data-audio-error',
      String(!audio.available || audio.message.includes('could not play')),
    );
    status.textContent =
      audio.message ||
      (audio.available
        ? 'Dialogue and smartboard audio · device voices'
        : 'Audio is unavailable in this browser. Read the dialogue below.');
  }
}
