// Web Audio API - works in all browsers, zero cost, zero dependency

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail if audio not supported
  }
}

export const sounds = {
  // Exercise started — upbeat beep
  workoutStart: () => {
    playTone(523, 0.15, "sine", 0.4); // C5
    setTimeout(() => playTone(659, 0.15, "sine", 0.4), 150); // E5
    setTimeout(() => playTone(784, 0.3, "sine", 0.5), 300); // G5
  },

  // Exercise completed — satisfying ding
  exerciseDone: () => {
    playTone(800, 0.1, "sine", 0.3);
    setTimeout(() => playTone(1000, 0.2, "sine", 0.3), 100);
  },

  // Workout completed — victory fanfare
  workoutComplete: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.3, "sine", 0.5), i * 150);
    });
  },

  // Rest timer tick
  timerTick: () => {
    playTone(440, 0.05, "square", 0.1);
  },

  // Rest timer end
  timerEnd: () => {
    playTone(880, 0.1, "sine", 0.4);
    setTimeout(() => playTone(880, 0.3, "sine", 0.4), 150);
  },

  // Button tap
  tap: () => {
    playTone(600, 0.05, "sine", 0.15);
  },
};