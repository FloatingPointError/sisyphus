export class Metronome {
  constructor(bpm = 60, onTick = () => {}) {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.bpm = bpm;
    this.interval = 60 / this.bpm;
    this.onTick = onTick; // callback on each beat
    this.nextTickTime = 0;
    this.schedulerId = null;
    this.lookahead = 25.0; // milliseconds
    this.scheduleAheadTime = 0.1; // seconds
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextTickTime = this.audioContext.currentTime;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.schedulerId);
  }

  setBPM(bpm) {
    this.bpm = bpm;
    this.interval = 60 / bpm;
  }

  scheduler = () => {
    while (this.nextTickTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.playClick(this.nextTickTime);
      this.onTick();
      this.nextTickTime += this.interval;
    }
    this.schedulerId = setTimeout(this.scheduler, this.lookahead);
  };

  playClick(time) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 1000;
    gain.gain.value = 0.1;

    osc.start(time);
    osc.stop(time + 0.05);
  }

  /**
   * Mute of unmute de metronoom.
   * Dit pauzeert of hervat de audio output zonder de scheduler te stoppen.
   */
  mute() {
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend();
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.isMuted = !this.isMuted; // Update de mute status
  }
}
