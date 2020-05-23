import figures from "./figures.js";

// const speed = 300;
// let score = 0;
// const dynamicParamsStop = [];

// const randomFigure = () =>
class Tetris {
  constructor() {
    this.netIds = this.initArrIds();
    this.tube = this.initTube(this.netIds);
    this.buttons = this.initButtons();
    this.figures = figures;
    this.dynamicParams = {
      moveVertical: null,
      runningFigure: null,
      spinFigure: 0,
      coordinate: 3,
      score: 0,
      speed: 300,
      stop: false,
      quantityOfBingoLines: 0,
    };
    this.eventListeners = this.initListeners();
  }
  initArrIds = () => {
    let id = 0;
    const arrOfIds = Array(20)
      .fill("")
      .map((none) =>
        Array(10)
          .fill("")
          .map((none) => id++)
      );

    return arrOfIds;
  };
  initTube = (arrOfIds) => {
    const net = arrOfIds
      .map((el) =>
        el.map((el) => (el = `<div id='${el}' class='cube'></div>`)).join("")
      )
      .join("");
    const tube = document.querySelector(".tube");
    tube.insertAdjacentHTML("afterbegin", net);
    return tube;
  };
  initButtons = () => {
    const buttons = {
      stop: document.querySelector(".btnStop"),
      start: document.querySelector(".btnStart"),
      continue: document.querySelector(".btnContinue"),
    };
    return buttons;
  };
  randomFigure = () => {
    const quantityOfFigures = this.figures.length;
    const numberOfFigure = Math.floor(Math.random() * quantityOfFigures);
    return numberOfFigure;
  };
  startNewFigure() {
    const randomFigure = this.randomFigure();
    this.dynamicParams.moveVertical = null;
    this.dynamicParams.spinFigure = 0;
    this.dynamicParams.coordinate = 3;
    this.dynamicParams.runningFigure = this.figures[randomFigure];
    this.moveFigure();
  }

  startGame = () => {
    if (this.dynamicParams.stop || !this.dynamicParams.moveVertical) {
      const tube = document.querySelector(".tube");
      while (tube.firstChild.id) {
        tube.removeChild(tube.firstChild);
      }
      document.querySelector(".score-count").textContent = "000";
      this.initTube(this.netIds);
      const randomFigure = this.randomFigure();
      this.dynamicParams.runningFigure = this.figures[randomFigure];
      this.dynamicParams.coordinate = 3;
      this.dynamicParams.score = 0;
      this.dynamicParams.stop = false;
      document.querySelector(".lastMassage").classList.remove("turnOnMassage");
      this.moveFigure();
    }
  };
  stop = () => {
    clearInterval(this.dynamicParams.moveVertical);
    this.dynamicParams.stop = true;
  };
  initListeners = () => {
    this.buttons.start.addEventListener("click", this.startGame);
    this.buttons.stop.addEventListener("click", this.stop);
    this.buttons.continue.addEventListener("click", this.continueGame);
    document.addEventListener(
      "keydown",
      (ev) => ev.code === "Space" && this.spin()
    );
    document.addEventListener(
      "keydown",
      (ev) =>
        (ev.code === "ArrowRight" || ev.code === "ArrowLeft") &&
        this.moveHorizon(ev.code)
    );
  };
  spin = () => {
    let { runningFigure, spinFigure, coordinate } = this.dynamicParams;
    if (runningFigure) {
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

        this.dynamicParams.spinFigure = rotatedFigure;
        // console.log("@");
      }
    }
  };
  moveHorizon = (code) => {
    let { runningFigure, spinFigure, coordinate } = this.dynamicParams;
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
        (code === "ArrowLeft" && coordinate--);
      rightStop ||
        runningFigure[spinFigure].some((elem) =>
          document
            .getElementById(coordinate + 1 + elem)
            .classList.contains("static-figure")
        ) ||
        (code === "ArrowRight" && coordinate++);
    }

    this.dynamicParams.coordinate = coordinate;
  };

  moveFigure() {
    let { score, speed } = this.dynamicParams;
    const moveVertical = setInterval(() => {
      let { runningFigure, spinFigure, coordinate } = this.dynamicParams;
      const figureDownLimiter = runningFigure[spinFigure].some(
        (elem) =>
          elem + coordinate > 199 ||
          document
            .getElementById(coordinate + elem)
            .classList.contains("static-figure")
      );

      if (figureDownLimiter) {
        const arr = document.querySelectorAll(".dynamic-figure");
        arr.forEach((elem) =>
          elem.classList.replace("dynamic-figure", "static-figure")
        );
        const quantityOfBingoLines = this.markingBingoLines();
        if (quantityOfBingoLines) {
          score =
            quantityOfBingoLines > 1
              ? quantityOfBingoLines * quantityOfBingoLines * 100
              : quantityOfBingoLines * 100;
          this.dynamicParams.score += score;
          document.querySelector(
            ".score-count"
          ).innerHTML = this.dynamicParams.score;
        }
        this.dynamicParams.quantityOfBingoLines = quantityOfBingoLines;
        this.deleteBingoLines();
        clearInterval(moveVertical);
        if (coordinate !== 3) {
          this.startNewFigure();
          return;
        } else {
          this.lastMassage();
          return;
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
      this.dynamicParams.coordinate = coordinate;
    }, speed);

    this.dynamicParams.moveVertical = moveVertical;
  }

  continueGame = () => {
    if (this.dynamicParams.stop) {
      this.moveFigure();
      this.dynamicParams.stop = false;
    }
  };
  markingBingoLines = () => {
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
  deleteBingoLines = () => {
    setTimeout(() => {
      const { quantityOfBingoLines } = this.dynamicParams;
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
          document
            .getElementById(Number(el) + 10)
            .classList.add("static-figure");
        });
        staticElIdsAboveBingoLine.forEach((el) => {
          document
            .getElementById(Number(el) + 10)
            .classList.add("static-figure");
        });
      }
    }, 500);
  };
  lastMassage = () => {
    const lastMassage = document.querySelector(".lastMassage");
    const finScore = document.querySelector(".finScore");
    finScore.innerHTML = `<p>Final score : ${this.dynamicParams.score}</p>`;
    lastMassage.classList.add("turnOnMassage");
    this.dynamicParams.moveVertical = null;
  };
}
const tetris = new Tetris();
// console.log(tetris);
