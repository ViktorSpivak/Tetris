export default () => {
  let quantityOfBingoLines = null;
  for (let line = 0; line <= 190; line += 10) {
    for (let j = 0; j <= 9; j += 1) {
      let id = line + j;
      if (document.getElementById(id).classList.contains("static-figure")) {
        if (id === line + 9) {
          quantityOfBingoLines++;

          for (let x = line; x <= id; x++) {
            document.getElementById(x).classList.remove("static-figure");
            document.getElementById(x).classList.add("bingo-line");
          }
        }
      } else break;
    }
  }
  return quantityOfBingoLines;
};
