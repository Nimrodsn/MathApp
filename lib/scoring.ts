/** Points for Nth correct solver on a riddle: 1st=10 … 10th=1, 11th+=1. */
export function pointsForSolveRank(rank: number): number {
  if (rank < 1) {
    throw new RangeError("rank must be >= 1");
  }
  return Math.max(1, 11 - rank);
}

export function formatRankedSuccessMessage(solveRank: number, awardedPoints: number): string {
  return `Brilliant! You were #${solveRank} — +${awardedPoints} points.`;
}
