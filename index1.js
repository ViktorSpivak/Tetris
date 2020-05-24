"use strict";
import figures from "./figures.js";

const tube = document.querySelector(".tube");
const buttonStop = document.querySelector(".btnStop");
const buttonStart = document.querySelector(".btnStart");
const buttonContinue = document.querySelector(".btnContinue");

const speed = 300;
// let score = 0;
const stateStop = [];
const createId = () => {
  let coordinate = 0;
  const arr = Array(20)
    .fill("")
    .map((none) =>
      Array(10)
        .fill("")
        .map((none) => coordinate++)
    );
  return arr;
};
const arrOfId = createId();
const net = arrOfId
  .map((el) =>
    el.map((el) => (el = `<div id='${el}' class='cube'>${el}</div>`)).join("")
  )
  .join("");
tube.insertAdjacentHTML("afterbegin", net);
const quantityOfFigures = figures.length;
const randomFigure = () => Math.floor(Math.random() * quantityOfFigures);

const moveFigure = (
  runningFigure,
  spinFigure = 0,
  coordinate = 3,
  score = 0
) => {
  const spin = (code) => {
    console.log("spin", coordinate);
    if (code === "Space") {
      let rotatedFigure = spinFigure + 1;
      rotatedFigure === runningFigure.length && (rotatedFigure = 0);
      const figureDownLimiter = runningFigure[rotatedFigure].some(
        (elem) =>
          elem + coordinate > 199 ||
          document
            .getElementById(coordinate + elem)
            .classList.contains("static-figure")
      );

      if (!figureDownLimiter) {
        coordinate.toString().split("").pop() === "9" && (coordinate += 1);
        coordinate.toString().split("").pop() === "8" &&
          (coordinate -= 1) &&
          runningFigure[rotatedFigure].some(
            (el) => (el + coordinate).toString().split("").pop() === "0"
          ) &&
          (coordinate -= 1);

        spinFigure = rotatedFigure;
        console.log("@");
      }
    }
  };
  !console.log("add spin") &&
    document.addEventListener("keydown", (ev) => spin(ev.code));
  const moveHorizon = (event) => {
    const leftStop = runningFigure[spinFigure].some(
      (el) => (el + coordinate).toString().split("").pop() === "0"
    );
    const rightStop = runningFigure[spinFigure].some(
      (el) => (el + coordinate).toString().split("").pop() === "9"
    );

    if (!runningFigure[spinFigure].some((elem) => elem + coordinate > 199)) {
      leftStop ||
        runningFigure[spinFigure].some((elem) =>
          document
            .getElementById(coordinate - 1 + elem)
            .classList.contains("static-figure")
        ) ||
        (event.code === "ArrowLeft" && coordinate--);
      rightStop ||
        runningFigure[spinFigure].some((elem) =>
          document
            .getElementById(coordinate + 1 + elem)
            .classList.contains("static-figure")
        ) ||
        (event.code === "ArrowRight" && coordinate++);
    }
  };
  document.addEventListener("keydown", moveHorizon);

  const moveVertical = setInterval(() => {
    const figureDownLimiter = runningFigure[spinFigure].some(
      (elem) =>
        elem + coordinate > 199 ||
        document
          .getElementById(coordinate + elem)
          .classList.contains("static-figure")
    );

    if (figureDownLimiter) {
      // document.removeEventListener("keydown", moveHorizon);

      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach((elem) =>
        elem.classList.replace("dynamic-figure", "static-figure")
      );
      const quantityOfBingoLines = markingBingoLines();
      if (quantityOfBingoLines) {
        score +=
          quantityOfBingoLines > 1
            ? quantityOfBingoLines * quantityOfBingoLines * 100
            : quantityOfBingoLines * 100;
        document.querySelector(".score-Count").innerHTML = score;
      }

      deleteBingoLines(quantityOfBingoLines);
      clearInterval(moveVertical);
      !console.log("spin remove") &&
        document.removeEventListener("keydown", (ev) => spin(ev.code));
      // !console.log("stop remove") &&
      //   buttonStop.removeEventListener("click", () => stop(currentState));

      if (coordinate !== 3) {
        startNewFigure();
      }
    } else {
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach((elem) => elem.classList.remove("dynamic-figure"));
      for (const elem of runningFigure[spinFigure]) {
        document
          .getElementById(elem + coordinate)
          .classList.add("dynamic-figure");
      }
    }

    coordinate += 10;
    stateStop.splice(
      0,
      5,
      moveVertical,
      runningFigure,
      spinFigure,
      coordinate,
      score
    );
  }, speed);
};

buttonStart.addEventListener("click", startNewFigure);
buttonStop.addEventListener("click", stop);
function startNewFigure() {
  let spinFigure, coordinate;
  buttonStart.removeEventListener("click", startNewFigure);

  const numberOfFigure = randomFigure();
  const currentState = moveFigure(
    figures[numberOfFigure],
    spinFigure,
    coordinate
  );
}
function stop() {
  buttonStart.addEventListener("click", startNewFigure);
  buttonContinue.addEventListener("click", continueGame);
  stateStop[0] &&
    clearInterval(stateStop[0]) &&
    buttonStop.removeEventListener("click", stop);
}
function continueGame() {
  console.log(stateStop);

  moveFigure(stateStop[1], stateStop[2], stateStop[3], stateStop[4]);
}
function markingBingoLines() {
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
}

function deleteBingoLines(quantityOfBingoLines) {
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
        .map((el) => el.id)
        .filter((el) => el < bingoLines[0].id);
      staticElIdsAboveBingoLine.forEach((el) => {
        document.getElementById(Number(el)).classList.remove("static-figure");
        document.getElementById(Number(el) + 10).classList.add("static-figure");
      });
      staticElIdsAboveBingoLine.forEach((el) => {
        document.getElementById(Number(el) + 10).classList.add("static-figure");
      });
    }
  }, 500);
}
