const HIGH_SCORE_STORAGE_KEY = "mouse-runner.high-score";

export class HighScore {
  value: number;
  private recordToBeat: number;

  constructor() {
    this.value = HighScore.read();
    this.recordToBeat = this.value;
    // The score is persisted when a run ends, this catches the runs that are
    // abandoned by closing the tab instead.
    window.addEventListener("pagehide", () => this.persist());
  }

  startRun() {
    this.recordToBeat = this.value;
  }

  submit(score: number) {
    if (score > this.value) {
      this.value = score;
    }
  }

  // The very first run of a player beats a high score of zero, which is not
  // worth celebrating.
  get isNewRecord() {
    return this.recordToBeat > 0 && this.value > this.recordToBeat;
  }

  persist() {
    try {
      window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(this.value));
    } catch {
      // Storage can be unavailable (private mode, blocked cookies), in which
      // case the high score simply does not survive a reload.
    }
  }

  toString() {
    return this.value.toString().padStart(5, "0");
  }

  private static read(): number {
    try {
      const stored = Number(
        window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY)
      );
      return Number.isFinite(stored) && stored > 0 ? Math.floor(stored) : 0;
    } catch {
      return 0;
    }
  }
}
