export const incrementalAverage = (currentAvg, currentCount, newRating) => {
  const newAverage =
    (currentAvg * currentCount + newRating) / (currentCount + 1);
  const newCount = currentCount + 1;
  return { newAverage, newCount };
};
