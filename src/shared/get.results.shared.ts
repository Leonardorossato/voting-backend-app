import { Nominations, Rankings, Results } from './poll.shared.types';

export default (
  rankings: Rankings,
  nominations: Nominations,
  votesPerVoter: number,
): Results => {
  const scores: { [nominationId: string]: number } = {};

  Object.values(rankings).forEach((userRankings) => {
    userRankings.forEach((nominationId, n) => {
      const votesValue = Math.pow(
        (votesPerVoter - 0.5 * n) / votesPerVoter,
        n + 1,
      );
      scores[nominationId] = (scores[nominationId] ?? 0) + votesValue;
    });
  });
  const results = Object.entries(scores).map(([nominationId, score]) => ({
    nominationId,
    nominationText: nominations[nominationId].text,
    score,
  }));

  results.sort((re1, re2) => re2.score - re1.score);
  return results;
};
