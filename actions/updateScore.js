export default ({ score }, quantityOfBingoLines) => {
  const priseOfBingoLine = 100;
  const bingoLinesBonus =
    quantityOfBingoLines > 1
      ? quantityOfBingoLines * quantityOfBingoLines * priseOfBingoLine
      : quantityOfBingoLines * priseOfBingoLine;
  const updateScoreCount = score + bingoLinesBonus;
  document.querySelector(".score-count").innerHTML = updateScoreCount;
  return updateScoreCount;
};
