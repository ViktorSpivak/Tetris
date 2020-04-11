"use strict";
const tube = document.querySelector(".tube");
const createId = () => {
  //   let i = 0;
  const arr = Array(20)
    .fill("")
    .map((none, index) =>
      Array(10)
        .fill("")
        .map((none, idx) => index.toString() + idx)
    );
  console.log(arr);

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
  [0, 1, 2, 3],
  [0, 1, 2, 12],
  [11, 12, 0, 1],
  [0, 1, 10, 11],
  [0, 1, 2],
  [0, 1, 2, 10],
  [0],
  [0, 1, 2, 11]
];
const min = 0;
const max = figures.length - 1;
const randomFigure = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const verticalMoveFigure = figure => {
  //   const moveHorizon = event => {
  //     event.key === "ArrowLeft" && i--;
  //     event.key === "ArrowRight" && i++;
  //   };
  //   document.body.addEventListener("keydown", moveHorizon);
  let i = 0;
  const move = setInterval(() => {
    if (
      figure.some(elem => elem + i > 199) ||
      figure.some(elem =>
        document.getElementById(i + elem).classList.contains("static-figure")
      )
    ) {
      for (const elem of figure) {
        document
          .getElementById(i - 10 + elem)
          .classList.replace("dynamic-figure", "static-figure");
      }

      // document.body.removeEventListener("keydown", moveHorizon);
      clearInterval(move);
    } else {
      const arr = document.querySelectorAll(".dynamic-figure");
      arr.forEach(elem => elem.classList.remove("dynamic-figure"));

      for (const elem of figure) {
        document.getElementById(elem + i).classList.add("dynamic-figure");
      }
    }
    i += 10;
  }, 400);

  document.body.addEventListener("dblclick", () => clearInterval(move));
};

document.body.addEventListener("click", () =>
  verticalMoveFigure(figures[randomFigure(min, max)])
);
verticalMoveFigure(figures[randomFigure(min, max)]);
const x = "string";
console.log(x[x.length - 1]);
