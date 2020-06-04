export default (quantityOfBingoLines) => {
  setTimeout(() => {
    for (let i = 0; i < quantityOfBingoLines; i++) {
      const bingoLines = document.querySelectorAll(".bingo-line");
      const firstElemIdBingoLine = bingoLines[0].id;
      bingoLines.forEach(
        (el) =>
          Number(el.id) < Number(firstElemIdBingoLine) + 10 &&
          el.classList.remove("bingo-line")
      );
      const staticElements = document.querySelectorAll(".static-figure");
      const staticElIdsAboveBingoLine = Array.from(staticElements)
        .map((el) => Number(el.id))
        .filter((el) => el < Number(bingoLines[0].id));
      staticElIdsAboveBingoLine.forEach((el) => {
        document.getElementById(Number(el)).classList.remove("static-figure");
        document.getElementById(Number(el) + 10).classList.add("static-figure");
      });
      staticElIdsAboveBingoLine.forEach((el) => {
        document.getElementById(Number(el) + 10).classList.add("static-figure");
      });
    }
  }, 500);
};
