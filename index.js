"use strict";
import figures from "./figures.js";

const tube = document.querySelector(".tube");
const buttonSpin = document.querySelector(".btnSpin");
const buttonStop = document.querySelector(".btnStop");

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

const moveFigure = (figure) => {
  const speed = 600;
  let runningFigure = 0;
  let coordinate = 0;

  const moveHorizon = (event) => {
    const leftStop = figure[runningFigure].some(
      (el) => (el + coordinate).toString().split("").pop() === "0"
    );
    const rightStop = figure[runningFigure].some(
      (el) => (el + coordinate).toString().split("").pop() === "9"
    );

    if (!figure[runningFigure].some((elem) => elem + coordinate > 199)) {
      leftStop ||
        figure[runningFigure].some((elem) =>
          document
            .getElementById(coordinate - 1 + elem)
            .classList.contains("static-figure")
        ) ||
        (event.key === "ArrowLeft" && coordinate-- && console.log("<"));
      rightStop ||
        figure[runningFigure].some((elem) =>
          document
            .getElementById(coordinate + 1 + elem)
            .classList.contains("static-figure")
        ) ||
        (event.key === "ArrowRight" && coordinate++ && console.log(">"));
    }
  };
  document.body.addEventListener("keydown", moveHorizon);

  const moveVertical = setInterval(() => {
    console.log(coordinate);
    const figureDownLimiter = figure[runningFigure].some(
      (elem) =>
        elem + coordinate > 199 ||
        document
          .getElementById(coordinate + elem)
          .classList.contains("static-figure")
    );

    if (figureDownLimiter) {
      // console.log(figureDownLimiter);
      document.body.removeEventListener("keydown", moveHorizon);
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach((elem) =>
        elem.classList.replace("dynamic-figure", "static-figure")
      );
      // console.log("fin:", coordinate);
      clearInterval(moveVertical);
      if (coordinate) {
        startNewFigure();
        coordinate = 0;
      }
    } else {
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach((elem) => elem.classList.remove("dynamic-figure"));
      for (const elem of figure[runningFigure]) {
        // console.log(elem + coordinate);

        document
          .getElementById(elem + coordinate)
          .classList.add("dynamic-figure");
      }
      // console.log("-");
    }
    coordinate += 10;
  }, speed);

  const spin = () => {
    // runningFigure += 1;
    // runningFigure === figure.length && (runningFigure = 0);
    let rotatedFigure = runningFigure + 1;
    rotatedFigure === figure.length && (rotatedFigure = 0);
    const figureDownLimiter = figure[rotatedFigure].some(
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
        figure[rotatedFigure].some(
          (el) => (el + coordinate).toString().split("").pop() === "0"
        ) &&
        (coordinate -= 1);
      // coordinate.toString().split("").pop() === "7" && (coordinate -= 2);
      // if (coordinate.toString().split("").pop() === "0") {
      //   figure[rotatedFigure].some(
      //     (el) =>
      //       (el + coordinate).toString().split("").pop() === "0" &&
      //       coordinate + 1
      //   );
      // }
      runningFigure = rotatedFigure;
      console.log("@");
    }
  };
  buttonSpin.addEventListener("click", spin);
  buttonStop.addEventListener("click", () => clearInterval(moveVertical));
};
startNewFigure();
function startNewFigure() {
  moveFigure(figures[randomFigure()]);
}
