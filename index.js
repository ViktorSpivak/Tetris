"use strict";
const tube = document.querySelector(".tube");
const buttonSpin = document.querySelector(".btnSpin");
const buttonStop = document.querySelector(".btnStop");

// console.log(tube.offsetHeight);
// const squareHorizonSize = tube.offsetWidth / 10;
// const squareVerticalSize = tube.offsetHeight / 10;
// console.log(squareHorizonSize, squareVerticalSize);
const createId = () => {
  let step = 0;
  const arr = Array(20)
    .fill("")
    .map(none =>
      Array(10)
        .fill("")
        .map(none => step++)
    );
  return arr;
};
const arrOfId = createId();
const net = arrOfId
  .map(el =>
    el.map(el => (el = `<div id='${el}' class='cube'>${el}</div>`)).join("")
  )
  .join("");
tube.insertAdjacentHTML("afterbegin", net);
const figures = [
  [
    [0, 1, 2, 3],
    [1, 11, 21, 31]
  ],
  [
    [0, 1, 2, 12],
    [1, 11, 21, 20],
    [0, 10, 11, 12],
    [1, 11, 21, 2]
  ],
  [
    [0, 1, 11, 12],
    [0, 10, 11, 21]
  ],
  [
    [0, 1, 10, 11],
    [0, 1, 10, 11]
  ],
  [
    [0, 1, 2],
    [1, 11, 21]
  ],
  [
    [0, 1, 2, 10],
    [0, 1, 11, 21],
    [2, 12, 11, 10],
    [1, 11, 21, 22]
  ],
  [[0], [0]],
  [
    [0, 1, 2, 11],
    [1, 11, 21, 10],
    [10, 11, 12, 1],
    [1, 11, 21, 12]
  ]
];
const min = 0;
const max = figures.length - 1;
const randomFigure = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const moveFigure = (figure, numOfFigure) => {
  numOfFigure = 0;

  const spin = () => {
    numOfFigure += 1;
    numOfFigure === figure.length && (numOfFigure = 0);
  };
  buttonSpin.addEventListener("click", spin);
  const moveHorizon = event => {
    const leftStop = figure[numOfFigure].some(
      el => (el + step).toString()[(el + step).toString().length - 1] === "0"
    );

    const rightStop = figure[numOfFigure].some(
      el => (el + step).toString()[(el + step).toString().length - 1] === "9"
    );

    if (
      figure[numOfFigure].some(elem => elem + step > 199) ||
      figure[numOfFigure].some(elem =>
        document.getElementById(step + elem).classList.contains("static-figure")
      )
    ) {
    } else {
      leftStop || (event.key === "ArrowLeft" && step--);
      rightStop || (event.key === "ArrowRight" && step++);
    }
  };
  document.body.addEventListener("keydown", moveHorizon);
  let step = 0;
  const moveVertical = setInterval(() => {
    if (
      figure[numOfFigure].some(elem => elem + step > 199) ||
      figure[numOfFigure].some(elem =>
        document.getElementById(step + elem).classList.contains("static-figure")
      )
    ) {
      if (step !== 0) {
        for (const elem of figure[numOfFigure]) {
          document
            .getElementById(step - 10 + elem)
            .classList.replace("dynamic-figure", "static-figure");
        }
        startNewFigure();
      }

      document.body.removeEventListener("keydown", moveHorizon);
      clearInterval(moveVertical);
    } else {
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach(elem => elem.classList.remove("dynamic-figure"));

      for (const elem of figure[numOfFigure]) {
        document.getElementById(elem + step).classList.add("dynamic-figure");
      }
    }
    step += 10;
  }, 300);
  buttonStop.addEventListener("click", () => clearInterval(moveVertical));
};
startNewFigure();
function startNewFigure() {
  const numOfFigure = randomFigure(min, max);
  moveFigure(figures[numOfFigure], numOfFigure);
}

// verticalMoveFigure(figures[0]);

// const x = "string";
// console.log(typeof x[x.length - 1]);

// console.log(randomFigure());

// const net=lattice.map(el=>el+'<div class="square"><div>') document.createElement('div')

// const tubeSizeHorizon = 0.5;
// const tubeSizeVertical = 0.8;
// const tubeHorizon = Math.floor(
//   document.documentElement.clientWidth * tubeSizeHorizon
// );
// const tubeVertical = Math.floor(
//   document.documentElement.clientHeight * tubeSizeVertical
// );
// console.log(tubeHorizon, tubeVertical);
