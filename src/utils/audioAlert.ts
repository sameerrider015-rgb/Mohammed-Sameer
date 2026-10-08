// Loud repeating ringtone and audio synthesizer for Fresh Chicken order alerts
class OrderAlertManager {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private timerId: number | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Plays a single ring pattern (two alternating high-penetration tones)
  private playRingBurst() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Master volume
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(ctx.destination);

      // Dual frequencies for maximum acoustic punch (853Hz & 960Hz standard bell frequencies)
      const freqs = [853, 960];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Pulsing ringing envelope: ring for 1.6s, then silence for 1.4s
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);

        // Rapid tremolo for urgent bell sound
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(15, now); // 15 Hz ring rattle
        lfoGain.gain.setValueAtTime(0.2, now);
        lfo.connect(gain.gain);
        lfo.start(now);
        lfo.stop(now + 1.6);

        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.01);
        osc.stop(now + 1.65);
      });

      // Also trigger hardware vibration if supported (mobile device)
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([400, 200, 400, 200, 600]);
        } catch {
          // ignore vibration errors
        }
      }
    } catch (err) {
      console.warn("Could not play audio alert burst:", err);
    }
  }

  // Starts the continuous looping ringtone until explicitly stopped
  public startLoudAlarm() {
    if (this.isRinging) return;
    this.isRinging = true;

    // Play immediately
    this.playRingBurst();

    // Repeat every 2.4 seconds
    this.timerId = window.setInterval(() => {
      if (this.isRinging) {
        this.playRingBurst();
      }
    }, 2400);
  }

  // Stops the ringing alert immediately
  public stopLoudAlarm() {
    this.isRinging = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }

  public isAlarmPlaying(): boolean {
    return this.isRinging;
  }

  // Soft single chime for customer notifications
  public playCustomerNotification() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // ignore
    }
  }
}

export const orderAlert = new OrderAlertManager();
