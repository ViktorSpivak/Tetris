import figures from "./figures.js";
import markingBingoLines from "./actions/markingBingoLines.js";
import deleteBingoLines from "./actions/deleteBingoLines.js";
import updateResultsBar from "./actions/updateResultsBar.js";
import updateScore from "./actions/updateScore.js";
import showLastMassage from "./actions/showLastMassage.js";

class Tetris {
  constructor() {
    this.figures = figures;
    this.dashboard = {
      upLevelInterval: null,
      startTimeInterval: null,
      timeOfGame: {},
      score: 0,
      results: [],
    };
    this.dynamicParams = {
      moveVertical: null,
      runningFigure: null,
      nextRunningFigure: null,
      spinFigure: 0,
      coordinate: 3,
      speeds: { currentSpeed: 500, accelerateSpeed: 10 },
      accelerate: false,
      gameOver: false,
      stop: false,
    };
    this.game = this.initGame();
  }
  initGame = () => {
    const netIds = this.initArrIds();
    this.initForecastArea(netIds);
    this.initTube(netIds);
    this.initButtons();
    this.initLastMassage();
    this.initListeners();
    this.initSpeedBar();
  };
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
        el.map((el) => (el = `<div id=${el} class='cube'></div>`)).join("")
      )
      .join("");
    const tube = document.querySelector(".tube");
    tube.insertAdjacentHTML("afterbegin", net);
    return tube;
  };
  initForecastArea = (arrOfIds) => {
    const nextFigureElem = document.querySelector(".nextFigure");
    const forecastArea = arrOfIds
      .map((el, idx) =>
        idx < 2
          ? el
              .map((el, idx) =>
                idx < 4
                  ? (el = `<div id='${el}next' class='nextFigure-cube'></div>`)
                  : ""
              )
              .join("")
          : ""
      )
      .join("");
    nextFigureElem.insertAdjacentHTML("afterbegin", forecastArea);
    return nextFigureElem;
  };
  initSpeedBar = () => {
    const speed = this.dynamicParams.speeds.currentSpeed;
    const minSpeedLevel = 0;
    const maxSpeedLevel = 10;
    const speedInterval = maxSpeedLevel + minSpeedLevel;
    let speedLevel = speedInterval - speed / 100;

    const speedBar = document.querySelector(".speed");
    speedBar.insertAdjacentHTML(
      "afterbegin",
      `<button class=btnUp>Up</button><p class=speedValue>${speedLevel}</p><button class=btnDown>Down</button>`
    );
    const speedValue = document.querySelector(".speedValue");
    const changeSpeed = (step) => {
      step || step--;
      if (
        speedLevel + step <= maxSpeedLevel &&
        speedLevel + step >= minSpeedLevel
      ) {
        speedLevel += step;
        this.dynamicParams.speeds.currentSpeed =
          (speedInterval - speedLevel) * 100;
        speedValue.textContent = `${speedLevel}`;
        if (this.dynamicParams.moveVertical) {
          clearInterval(this.dynamicParams.moveVertical);
          this.dynamicParams.stop || this.moveFigure();
        }
      }
    };
    document
      .querySelector(".btnUp")
      .addEventListener("click", () => changeSpeed(true));
    document
      .querySelector(".btnDown")
      .addEventListener("click", () => changeSpeed(false));
  };
  initTimer = () => {
    const startTime = Date.now();
    const counts = document.querySelectorAll(".timer__value");
    counts.forEach((el) => (el.textContent = "00"));
    const count = () => {
      const time = Date.now() - startTime;
      const hours = Math.floor(
        (time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const mins = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((time % (1000 * 60)) / 1000);
      this.dashboard.timeOfGame = { hours, mins, secs };
      return [hours, mins, secs];
    };
    const counterChange = (arr) => {
      counts.forEach(
        (el, idx) => (el.textContent = String(arr[idx]).padStart(2, "0"))
      );
    };
    const upLevelTime = 600000;
    this.dashboard.upLevelInterval = setInterval(() => {
      const eventClick = new Event("click");
      document.querySelector(".btnUp").dispatchEvent(eventClick);
    }, upLevelTime);
    this.dashboard.startTimeInterval = setInterval(
      () => counterChange(count()),
      1000
    );
  };
  initButtons = () => {
    const btnArea = document.querySelector(".btnArea");
    btnArea.insertAdjacentHTML(
      "afterbegin",
      "<button class=btnStart name=start type=button>Start new game</button><button class=btnStop name=stop type=button>Pause</button><button class=btnContinue name=continueGame type=button>Continue</button>"
    );
  };
  initListeners = () => {
    const btnArea = document.querySelector(".btnArea");
    btnArea.addEventListener("click", (ev) => {
      const { name } = ev.target;
      name === "start" && this.startNewGame();
      name === "stop" && this.pause();
      name === "continueGame" && this.continueGame();
    });

    document.body.addEventListener("keydown", (ev) => {
      ev.preventDefault();
      const { code } = ev;
      code === "Space" && this.spin();
      (code === "ArrowRight" || code === "ArrowLeft") && this.moveHorizon(code);
      code === "ArrowDown" && this.accelerate();
    });
  };
  initLastMassage = () => {
    const tube = document.querySelector(".tube");
    const lastMassageElem = `<div class=lastMassage><p>GAME OVER</p><p class=finScore></p></div>`;
    tube.insertAdjacentHTML("afterend", lastMassageElem);
  };
  randomFigure = () => {
    const quantityOfFigures = this.figures.length;
    const numberOfFigure = Math.floor(Math.random() * quantityOfFigures);
    return numberOfFigure;
  };
  nextFigureInit = () => {
    const nextFigure = this.randomFigure();
    this.dynamicParams.nextRunningFigure = this.figures[nextFigure];
    const nextFigureChildElem = document.querySelector(".nextFigure")
      .childNodes;
    nextFigureChildElem.forEach((el) => el.classList.remove("nextFig__paint"));
    nextFigureChildElem.forEach(
      (el) =>
        this.dynamicParams.nextRunningFigure[0].includes(parseInt(el.id, 10)) &&
        el.classList.add("nextFig__paint")
    );
  };
  startNewGame = () => {
    if (!this.dynamicParams.moveVertical) {
      const figureNumber = this.randomFigure();
      this.nextFigureInit();
      this.dynamicParams.runningFigure = this.figures[figureNumber];
      this.moveFigure();
      this.initTimer();
      return;
    }
    clearInterval(this.dashboard.startTimeInterval);
    clearInterval(this.dynamicParams.moveVertical);
    this.initTimer();
    this.dashboard.results = updateResultsBar(this.dashboard);
    document.querySelector(".lastMassage").classList.remove("showLastMassage");
    document.querySelector(".score-count").textContent = "000";
    const tube = document.querySelector(".tube");
    Array.from(tube.children).forEach((el) => {
      el.classList.remove("dynamic-figure");
      el.classList.remove("static-figure");
    });
    const figureNumber = this.randomFigure();
    this.nextFigureInit();
    this.dynamicParams.runningFigure = this.figures[figureNumber];
    this.dynamicParams.coordinate = 3;
    this.dynamicParams.stop = false;
    this.dashboard.score = 0;
    this.dynamicParams.gameOver = false;
    this.dynamicParams.spinFigure = 0;
    this.moveFigure();
  };
  startNewFigure = () => {
    this.dynamicParams.moveVertical = null;
    this.dynamicParams.spinFigure = 0;
    this.dynamicParams.coordinate = 3;
    this.dynamicParams.runningFigure = this.dynamicParams.nextRunningFigure;
    this.nextFigureInit();
    this.moveFigure();
  };
  pause = () => {
    clearInterval(this.dynamicParams.moveVertical);
    this.dynamicParams.stop = true;
  };
  continueGame = () => {
    if (this.dynamicParams.stop && this.dynamicParams.moveVertical) {
      this.moveFigure();
      this.dynamicParams.stop = false;
    }
  };
  accelerate = () => {
    if (this.dynamicParams.moveVertical) {
      this.dynamicParams.accelerate = true;
      clearInterval(this.dynamicParams.moveVertical);
      this.moveFigure();
    }
  };
  spin = () => {
    let { runningFigure, spinFigure, coordinate } = this.dynamicParams;
    if (runningFigure) {
      let rotatedFigure = spinFigure + 1;
      if (rotatedFigure >= runningFigure.length) {
        rotatedFigure = 0;
      }

      const figureDownLimiter = runningFigure[rotatedFigure].some(
        (elem) =>
          elem + coordinate > 199 ||
          document
            .getElementById(coordinate + elem)
            .classList.contains("static-figure")
      );

      if (!figureDownLimiter) {
        const lastNumberOfCoordinate = coordinate.toString().split("").pop();
        lastNumberOfCoordinate === "9" && (coordinate += 1);
        lastNumberOfCoordinate === "8" &&
          (coordinate -= 1) &&
          runningFigure[rotatedFigure].some(
            (el) => (el + coordinate).toString().split("").pop() === "0"
          ) &&
          (coordinate -= 1);
        this.dynamicParams.coordinate = coordinate;

        this.dynamicParams.spinFigure = rotatedFigure;
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
    let { accelerate } = this.dynamicParams;
    let speed = accelerate
      ? this.dynamicParams.speeds.accelerateSpeed
      : this.dynamicParams.speeds.currentSpeed;
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
        const runningFigureOnTube = document.querySelectorAll(
          ".dynamic-figure"
        );
        runningFigureOnTube.forEach((elem) =>
          elem.classList.replace("dynamic-figure", "static-figure")
        );
        const quantityOfBingoLines = markingBingoLines();
        if (quantityOfBingoLines) {
          this.dashboard.score = updateScore(
            this.dashboard,
            quantityOfBingoLines
          );
          deleteBingoLines(quantityOfBingoLines);
        }

        this.dynamicParams.accelerate = false;
        clearInterval(moveVertical);
        if (coordinate !== 3) {
          this.startNewFigure();
          return;
        } else {
          this.dynamicParams.gameOver = showLastMassage(this.dashboard);
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
}
const tetris = new Tetris();
