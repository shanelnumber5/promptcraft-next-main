// Browser speech is optional; authored dialogue always remains on screen.
export function createNarrator({ speech, Utterance, onChange = () => {} } = {}) {
  const available = Boolean(speech && Utterance);
  let enabled = false,
    speaking = false,
    generation = 0,
    message = '';
  const status = () => ({ available, enabled, speaking, message });
  const notify = () => onChange(status());
  const stop = () => {
    generation++;
    speech?.cancel();
    speaking = false;
  };
  function read(segments) {
    stop();
    if (!available || !enabled) return;
    const current = generation;
    const voices = speech.getVoices().filter((voice) => /^en\b/i.test(voice.lang));
    const queue = segments.filter((segment) => segment.text?.trim());
    let index = 0;
    function next() {
      if (current !== generation) return;
      const segment = queue[index++];
      if (!segment) {
        speaking = false;
        message = 'Finished reading. Narration stays on for the next screen.';
        notify();
        return;
      }
      const utterance = new Utterance(segment.text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      const voice = voices[segment.speaker === 'maya' && voices.length > 1 ? 1 : 0];
      if (voice) utterance.voice = voice;
      utterance.onend = next;
      utterance.onerror = () => {
        if (current !== generation) return;
        stop();
        enabled = false;
        message =
          'Audio could not play. Try Read aloud again; all dialogue is available on screen.';
        notify();
      };
      speaking = true;
      message = 'Reading aloud using your device’s voices.';
      notify();
      speech.speak(utterance);
    }
    next();
  }
  return {
    status,
    read,
    toggle(segments) {
      enabled = available && !enabled;
      message = '';
      if (enabled) read(segments);
      else {
        stop();
        notify();
      }
    },
    dispose() {
      enabled = false;
      stop();
    },
  };
}
