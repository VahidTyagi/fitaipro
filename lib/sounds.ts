// Web Audio API — zero dependencies, works offline, instant
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, dur: number, vol = 0.3, type: OscillatorType = "sine") {
  const c = audio();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch {}
}

export const sounds = {
  // Workout starts
  workoutStart: () => {
    beep(440, 0.1, 0.3);
    setTimeout(() => beep(554, 0.1, 0.3), 120);
    setTimeout(() => beep(659, 0.25, 0.4), 240);
    setTimeout(() => beep(880, 0.3, 0.5), 380);
  },
  // Exercise done — tick
  exerciseDone: () => {
    beep(880, 0.08, 0.25);
    setTimeout(() => beep(1100, 0.15, 0.3), 100);
  },
  // All exercises done — fanfare
  workoutComplete: () => {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((n, i) => setTimeout(() => beep(n, 0.25, 0.4), i * 130));
  },
  // Rest timer countdown tick
  tick: () => beep(440, 0.04, 0.1, "square"),
  // Rest timer end
  restEnd: () => {
    beep(880, 0.08, 0.35);
    setTimeout(() => beep(880, 0.2, 0.4), 150);
  },
  // Button tap
  tap: () => beep(600, 0.04, 0.12),
  // Error
  error: () => beep(220, 0.3, 0.2, "square"),
};