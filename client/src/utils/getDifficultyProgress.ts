export const DIFFICULTY_RAMP_DURATION = 70000;

// Grows fast at the beginning and then saturates towards 1, so the game gets
// harder right away but approaches a fixed ceiling instead of turning into an
// unplayable wall of obstacles.
export function getDifficultyProgress(duration: number): number {
  return 1 - Math.exp(-duration / DIFFICULTY_RAMP_DURATION);
}
