import figures from "./figures.js";

class Tetris {
  constructor() {
    this.figures = figures;
    this.dashboard = { startTime: null, timeOfGame: {}, score: 0, results: [] };
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
      quantityOfBingoLines: null,
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

    this.dashboard.startTime = setInterval(() => counterChange(count()), 1000);
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
  startNewFigure = () => {
    this.dynamicParams.moveVertical = null;
    this.dynamicParams.spinFigure = 0;
    this.dynamicParams.coordinate = 3;
    this.dynamicParams.runningFigure = this.dynamicParams.nextRunningFigure;
    // if (this.dashboard.timeOfGame.mins % 10 === 0) {
    //   const eventClick = new Event("click");
    //   document.querySelector(".btnUp").dispatchEvent(eventClick);
    // }

    this.nextFigureInit();
    this.moveFigure();
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
    clearInterval(this.dashboard.startTime);
    this.initTimer();
    clearInterval(this.dynamicParams.moveVertical);
    this.updateResultsBar();
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
  updateResultsBar = () => {
    const timeOfGame = Object.values(this.dashboard.timeOfGame).join(":");
    document.querySelector(".results").classList.add("showResults");
    const resultsList = document.querySelector(".results-list");
    this.dashboard.results.push(this.dashboard.score);
    document
      .querySelector(".results-list")
      .insertAdjacentHTML(
        "beforeend",
        `<li><span>${timeOfGame}</span><span>   / ${this.dashboard.score}</span>  </li>`
      );
    resultsList.scrollTo({
      top: resultsList.scrollHeight,
      behavior: "smooth",
    });
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
  showLastMassage = () => {
    const finScore = document.querySelector(".finScore");
    finScore.textContent = `Final score : ${this.dashboard.score}`;
    document.querySelector(".lastMassage").classList.add("showLastMassage");
    this.dynamicParams.gameOver = true;
  };
  updateScore = () => {
    const { quantityOfBingoLines, speeds } = this.dynamicParams;
    const priseOfBingoLine = 100;
    const score =
      quantityOfBingoLines > 1
        ? quantityOfBingoLines * quantityOfBingoLines * priseOfBingoLine
        : quantityOfBingoLines * priseOfBingoLine;
    this.dashboard.score += score;
    document.querySelector(".score-count").innerHTML = this.dashboard.score;
    const upSpeedScoreInterval = 5;
    if (
      score >=
      upSpeedScoreInterval * this.dynamicParams.speeds.currentSpeed
    ) {
      const minSpeedLevel = 0;
      const maxSpeedLevel = 10;
      const speedInterval = maxSpeedLevel + minSpeedLevel;
      const changeSpeedStep = 100;
      const upLevelSpeed = speeds.currentSpeed - changeSpeedStep;
      this.dynamicParams.speeds.currentSpeed = upLevelSpeed;
      const speedLevel = speedInterval - upLevelSpeed / 100;
      const speedValue = document.querySelector(".speedValue");
      speedValue.textContent = `${speedLevel}`;
    }
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
        const quantityOfBingoLines = this.markingBingoLines();
        this.dynamicParams.quantityOfBingoLines = quantityOfBingoLines;
        if (quantityOfBingoLines) {
          this.updateScore();
          this.deleteBingoLines();
        }

        this.dynamicParams.accelerate = false;
        clearInterval(moveVertical);
        if (coordinate !== 3) {
          this.startNewFigure();
          return;
        } else {
          this.showLastMassage();
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
          .map((el) => Number(el.id))
          .filter((el) => el < Number(bingoLines[0].id));
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
}
const tetris = new Tetris();
