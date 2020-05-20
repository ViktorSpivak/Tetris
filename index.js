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
  let numOfFigure = 0;
  let coordinate = 0;
  const moveHorizon = (event) => {
    const leftStop = figure[numOfFigure].some(
      (el) =>
        (el + coordinate).toString()[
          (el + coordinate).toString().length - 1
        ] === "0"
    );

    const rightStop = figure[numOfFigure].some(
      (el) =>
        (el + coordinate).toString()[
          (el + coordinate).toString().length - 1
        ] === "9"
    );
    leftStop || (event.key === "ArrowLeft" && coordinate--);
    rightStop || (event.key === "ArrowRight" && coordinate++);
    console.log(coordinate);
  };
  document.body.addEventListener("keydown", moveHorizon);

  const moveVertical = setInterval(() => {
    // console.log(coordinate);
    const figureDownLimiter = figure[numOfFigure].some(
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
      console.log("fin:", coordinate);
      clearInterval(moveVertical);
      if (coordinate) {
        startNewFigure();
        coordinate = 0;
      }
    } else {
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach((elem) => elem.classList.remove("dynamic-figure"));
      for (const elem of figure[numOfFigure]) {
        console.log(elem + coordinate);

        document
          .getElementById(elem + coordinate)
          .classList.add("dynamic-figure");
      }
      console.log("-");
    }
    coordinate += 10;
  }, 200);

  const spin = () => {
    numOfFigure += 1;
    numOfFigure === figure.length && (numOfFigure = 0);
  };
  buttonSpin.addEventListener("click", spin);
  buttonStop.addEventListener("click", () => clearInterval(moveVertical));
};
startNewFigure();
function startNewFigure() {
  moveFigure(figures[randomFigure()]);
}
