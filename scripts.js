/*----- constants -----*/
const boardHeight = 10;
const boardWidth = 10;

const ranges = [
  { min: 22, max: 27 },
  { min: 32, max: 37 },
  { min: 42, max: 47 },
  { min: 52, max: 57 },
  { min: 62, max: 67 },
  { min: 72, max: 72 },
];

const guesses = [1, -1, 10, -10];

const playerShipData = [
  { name: "destroyer", occupiedSquares: null, hits: 0, length: 2, sunk: false },
  { name: "sub", occupiedSquares: null, hits: 0, length: 3, sunk: false },
  { name: "cruiser", occupiedSquares: null, hits: 0, length: 3, sunk: false },
  {
    name: "battleship",
    occupiedSquares: null,
    hits: 0,
    length: 4,
    sunk: false,
  },
  { name: "carrier", occupiedSquares: null, hits: 0, length: 5, sunk: false },
];
const compShipData = [
  { name: "destroyer", occupiedSquares: null, hits: 0, length: 2, sunk: false },
  { name: "sub", occupiedSquares: null, hits: 0, length: 3, sunk: false },
  { name: "cruiser", occupiedSquares: null, hits: 0, length: 3, sunk: false },
  {
    name: "battleship",
    occupiedSquares: null,
    hits: 0,
    length: 4,
    sunk: false,
  },
  { name: "carrier", occupiedSquares: null, hits: 0, length: 5, sunk: false },
];

/*----- state variables -----*/

let validStart;
let dragged = null;
let selectedShip = null;
let isHorizontal;
let playerHits = 0;
let computerHits = [];
let playerTurn = true;
let compShotHistory = [];
let playerShotHistory = [];
let side = true;
let draggedSquaresHistory = [];
let draggedShipHistory = [];
let playerTakenSquares = [];
let computerTakenSquares = [];

/*----- cached elements  -----*/
const playerBoard = document.getElementById("player-board");
const computerBoard = document.getElementById("computer-board");
const ships = [...document.getElementsByClassName("ship")];
const shipLengths = ships.map((ship) => ship.dataset.length);
const msg = document.getElementById("msg");
const rotateBtn = document.getElementById("rotate-btn");
const shipContainer = document.getElementById("ship-container");
const resetBtn = document.getElementById("reset-btn");
const undoBtn = document.getElementById("undo-btn");
const compHitList = document.querySelector(".comp-list-ul");
const playerHitList = document.querySelector(".player-list-ul");
const thinkingMsg = document.getElementById("comp-thinking-msg");

/*----- functions -----*/
buildBoards();

function selectShipToggle(e) {
  if (selectedShip === e.target) {
    selectedShip.classList.toggle("ship-focus");
    selectedShip = null;
    return;
  }
  selectedShip = e.target;
  ships.forEach((ship) => {
    if (ship !== e.target) {
      ship.classList.remove("ship-focus");
    }
  });
  selectedShip.classList.toggle("ship-focus");
}

function rotateSelectedShip() {
  if (!selectedShip) return;

  let height = selectedShip.style.height;
  let width = selectedShip.style.width;

  selectedShip.style.height = width;
  selectedShip.style.width = height;

  selectedShip.dataset.rotated =
    selectedShip.dataset.rotated === "true" ? false : true;
}

function buildBoards() {
  //for player
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let cellDiv = document.createElement("div");
      cellDiv.id = `p-c${j}-r${i}`;
      playerBoard.appendChild(cellDiv);
    }
  }
  // for computer
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let cellDiv = document.createElement("div");
      cellDiv.id = `c-c${j}-r${i}`;
      computerBoard.appendChild(cellDiv);
    }
  }
}

const playerBoardSquares = [...playerBoard.querySelectorAll("div")];
const computerBoardSquares = [...computerBoard.querySelectorAll("div")];

startGame();

function startGame() {
  compHitList.innerHTML = null;
  playerHitList.innerHTML = null;
  selectedShip = null;
  dragged = null;
  isHorizontal = false;
  playerTurn = true;
  playerHits = 0;
  computerHits = [];
  playerShotHistory = [];
  compShotHistory = [];
  playerTakenSquares = [];
  computerTakenSquares = [];
  draggedSquaresHistory = [];
  draggedShipHistory = [];

  msg.innerText = `Drag all your ships onto the board to start a game!
  
  Click a ship to select and rotate!`;
  undoBtn.addEventListener("click", undoDrop);

  compShipData.forEach((ship) => {
    ship.occupiedSquares = null;
    ship.sunk = false;
    ship.hits = 0;
  });

  playerShipData.forEach((ship) => {
    ship.occupiedSquares = null;
    ship.sunk = false;
    ship.hits = 0;
  });

  compShipData.forEach((ship) => setupComputerShips(ship.length, ship.name));

  rotateBtn.addEventListener("click", rotateSelectedShip);

  resetBtn.addEventListener("click", startGame);

  playerBoardSquares.forEach(
    (square) => (square.style.backgroundColor = "white")
  );
  computerBoardSquares.forEach(
    (square) => (square.style.backgroundColor = "white")
  );
  playerBoard.addEventListener("dragover", preventDragoverDefault);

  ships.forEach((ship) => {
    ship.addEventListener("dragstart", assignDragged);
    ship.addEventListener("click", selectShipToggle);
    shipContainer.appendChild(ship);
    if (ship.dataset.rotated === "true") {
      selectedShip = ship;
      rotateSelectedShip();
      selectedShip = null;
    }
    ship.classList.remove("ship-focus");
    ship.dataset.rotated = "false";
  });

  playerBoardSquares.forEach((square) => {
    square.addEventListener("dragover", preventDragoverDefault);
    square.addEventListener("drop", handleDrop);
  });
}

function preventDragoverDefault(e) {
  e.preventDefault();
}

function assignDragged(e) {
  dragged = e.target;
}

function handleDrop(e) {
  e.preventDefault();
  draggedShipHistory.push(dragged);
  let dropIdx = playerBoardSquares.indexOf(e.target);
  let shipLength = dragged.getAttribute("data-length");
  isHorizontal = dragged.getAttribute("data-rotated") === "true";
  setPlayerShip(dropIdx, shipLength, isHorizontal);
  shipContainer.removeChild(dragged);
}

function setPlayerShip(startIdx, shipLength, isHorizontal) {
  if (playerTakenSquares.length >= 17) return;
  if (startIdx < 0) {
    startIdx = 99;
  } else if (startIdx > 99) {
    startIdx = 0;
  }

  while (playerTakenSquares.includes(startIdx)) {
    startIdx--;
    if (startIdx < 0) {
      startIdx = 99;
    }
  }
  checkValidPlayerBounds(shipLength, startIdx, isHorizontal);
}

function checkValidPlayerBounds(shipLength, startIdx, isHorizontal) {
  if (isHorizontal) {
    if (startIdx > 100 - shipLength) {
      startIdx = 100 - shipLength;
    }

    for (let k = 10; k <= 100; k += 10) {
      let lowerValidBound = k - 10;
      if (startIdx >= lowerValidBound && startIdx < k) {
        if (startIdx > k - shipLength) {
          startIdx = k - shipLength;
        }

        while (playerTakenSquares.includes(startIdx)) {
          startIdx -= 1;
          if (startIdx < 0) {
            startIdx = 0;
          } else if (startIdx > 99) {
            startIdx = 99;
          }
        }
        updatePlayerTakenSquares(shipLength, startIdx, isHorizontal);
        return;
      }
    }
  } else {
    while (startIdx >= 110 - shipLength * 10) {
      startIdx -= 10;
    }
    updatePlayerTakenSquares(shipLength, startIdx, isHorizontal);
  }
}

function updatePlayerTakenSquares(shipLength, validStart, isHorizontal) {
  let shipSquares = [];
  let isTaken = true;
  if (isHorizontal) {
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(validStart + j)) {
        isTaken = false;
      } else {
        isTaken = true;
        break;
      }
    }
  } else {
    let currentStart = validStart;
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(currentStart)) {
        isTaken = false;
      } else {
        isTaken = true;
        break;
      }
      currentStart += 10;
    }
  }

  if (isTaken) {
    isHorizontal ? validStart-- : (validStart -= 10);
    setPlayerShip(validStart, shipLength, isHorizontal);
    return;
  } else {
    if (isHorizontal) {
      for (let j = 0; j < shipLength; j++) {
        playerTakenSquares.push(validStart + j);
        shipSquares.push(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        playerTakenSquares.push(currentStart);
        shipSquares.push(currentStart);
        currentStart += 10;
      }
    }
    if (playerTakenSquares.length === 17) {
      undoBtn.removeEventListener("click", undoDrop);
      msg.innerText = `Click a cell on the computer's board to take a shot!`;
      nextTurn(playerTurn);
    }
    draggedSquaresHistory.push(shipSquares);
  }

  let lastDroppedShipName =
    draggedShipHistory[draggedShipHistory.length - 1].getAttribute("name");
  let lastDroppedShip = playerShipData.find(
    (ship) => ship.name === lastDroppedShipName
  );
  lastDroppedShip.occupiedSquares = shipSquares;
  renderBoard(playerTakenSquares, playerBoardSquares);
}

compShipData.forEach((ship) => {
  setupComputerShips(ship.length, ship.name);
});

function setupComputerShips(shipLength, shipName) {
  if (computerTakenSquares.length === 17) return;
  let randomIdx = Math.floor(Math.random() * 100);
  while (computerTakenSquares.includes(randomIdx)) {
    randomIdx = Math.floor(Math.random() * 100);
  }
  let horizontal = Math.random() < 0.5;
  checkValidComputerBounds(shipLength, randomIdx, horizontal, shipName);
}

function checkValidComputerBounds(shipLength, randomIdx, horizontal, shipName) {
  if (horizontal) {
    if (randomIdx > 100 - shipLength) {
      randomIdx = 100 - shipLength;
    }
    for (let k = 10; k < 100; k += 10) {
      let lowerValidBound = k - 10;
      if (randomIdx >= lowerValidBound && randomIdx <= k) {
        if (randomIdx > k - shipLength) {
          randomIdx = k - shipLength;
        }
        while (computerTakenSquares.includes(randomIdx)) {
          randomIdx--;
        }
        break;
      }
    }
    //vertical
  } else {
    if (randomIdx > 99 - shipLength * 10) {
      randomIdx = 99 - (shipLength - 1) * 10;
    }
    while (computerTakenSquares.includes(randomIdx)) {
      randomIdx--;
    }
  }
  validStart = randomIdx;
  updateComputerTakenSquares(shipLength, validStart, horizontal, shipName);
}

function updateComputerTakenSquares(
  shipLength,
  validStart,
  horizontal,
  shipName
) {
  let isTaken = true;
  let compShipSquares = [];
  if (horizontal) {
    for (let j = 0; j < shipLength; j++) {
      if (!computerTakenSquares.includes(validStart + j)) {
        isTaken = false;
      } else {
        isTaken = true;
        break;
      }
    }
  } else {
    let currentStart = validStart;
    for (let j = 0; j < shipLength; j++) {
      if (!computerTakenSquares.includes(currentStart)) {
        isTaken = false;
      } else {
        isTaken = true;
        break;
      }
      currentStart += 10;
    }
  }

  if (isTaken) {
    setupComputerShips(shipLength, shipName);
  } else {
    if (horizontal) {
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(validStart + j);
        compShipSquares.push(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(currentStart);
        compShipSquares.push(currentStart);
        currentStart += 10;
      }
    }
    let lastDroppedCompShip = compShipData.find(
      (ship) => ship.name === shipName
    );
    lastDroppedCompShip.occupiedSquares = compShipSquares;
  }
}

function undoDrop() {
  let shipSquaresToRemove =
    draggedSquaresHistory[draggedSquaresHistory.length - 1];
  playerTakenSquares = playerTakenSquares.filter(
    (squares) => !shipSquaresToRemove.includes(squares)
  );
  draggedSquaresHistory.pop();
  let putBackShip = draggedShipHistory.pop();
  shipContainer.appendChild(putBackShip);

  renderBoardUndo(playerTakenSquares, playerBoardSquares);
}

function renderBoardUndo(takenSquares, boardSquares) {
  boardSquares.forEach((square, i) => {
    if (!takenSquares.includes(i)) {
      square.style.backgroundColor = "white";
    }
  });
}

function renderBoard(takenSquares, boardSquares) {
  takenSquares.forEach((idx) => {
    boardSquares[idx].style.backgroundColor = "var(--main-blue)";
  });
}

function handleShot(e) {
  let shotIdx = computerBoardSquares.indexOf(e.target);
  if (playerShotHistory.includes(shotIdx)) {
    msg.innerText = `Click an empty square to take a shot...`;
    return;
  } else if (computerTakenSquares.includes(shotIdx)) {
    computerBoardSquares[shotIdx].style.backgroundColor = "red";
    msg.innerText = `It's a hit!`;
    playerHits++;
    compShipData.forEach((ship) => {
      if (ship.occupiedSquares.includes(shotIdx)) {
        ship.hits++;
      }
    });
  } else {
    msg.innerText = `Missed... `;
    computerBoardSquares[shotIdx].style.backgroundColor = "gray";
  }
  playerShotHistory.push(shotIdx);
  playerTurn = false;
  checkSunkShips(compShipData);
  checkWinner(playerHits, computerHits);
  nextTurn(playerTurn);
}

function handleComputerShot(shot) {
  let computerShotTarget = playerBoardSquares[shot];
  if (playerTakenSquares.includes(shot)) {
    computerHits.push(shot);
    computerShotTarget.style.backgroundColor = "red";
    playerShipData.forEach((ship) => {
      if (ship.occupiedSquares.includes(shot)) {
        ship.hits++;
      }
    });
  } else {
    computerShotTarget.style.backgroundColor = "gray";
  }
  playerTurn = true;
  checkSunkShips(playerShipData);
  checkWinner(playerHits, computerHits);
  nextTurn(playerTurn);
}

function checkWinner(playerHits, computerHits) {
  if (playerHits === 17) {
    msg.innerText = `Player wins! Reset game to play again.`;
    cleanup();
  } else if (computerHits.length === 17) {
    msg.innerText = `Computer wins! Reset game to play again.`;
    cleanup();
  }
}

function computerShot() {
  let lastHit = computerHits[computerHits.length - 1];
  let shot;
  let prevHit;
  let betterShot = null;

  let randomGuessIdx = Math.floor(Math.random() * 4);
  if (compShotHistory.length < 1) {
    function randomFirstShot(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    let randomRange = ranges[Math.floor(Math.random() * ranges.length)];
    shot = randomFirstShot(randomRange.min, randomRange.max);
    compShotHistory.push(shot);
    handleComputerShot(shot);
    return;
  }

  if (computerHits.length < 1) {
    prevHit = Math.floor(Math.random() * 100);
  } else if (computerHits.length > 0 && computerHits.length < 2) {
    prevHit = computerHits[0];
  } else {
    prevHit = lastHit;
  }
  if (!betterShot && prevHit + 1 <= 99 && computerHits.includes(prevHit + 1)) {
    betterShot = prevHit + 2;
  }
  if (!betterShot && prevHit - 1 >= 0 && computerHits.includes(prevHit - 1)) {
    betterShot = prevHit - 2;
  }
  if (
    !betterShot &&
    prevHit + 10 <= 99 &&
    computerHits.includes(prevHit + 10)
  ) {
    betterShot = prevHit + 20;
  }
  if (!betterShot && prevHit - 10 >= 0 && computerHits.includes(prevHit - 10)) {
    betterShot = prevHit - 20;
  }

  if (!betterShot || compShotHistory.includes(betterShot)) {
    for (let i = 0; i < 4; i++) {
      betterShot = prevHit + guesses[i];
      if (
        !compShotHistory.includes(betterShot + guesses[i]) &&
        betterShot >= 0 &&
        betterShot <= 99
      ) {
        break;
      }
    }
  }

  while (
    betterShot > 99 ||
    betterShot < 0 ||
    !betterShot ||
    compShotHistory.includes(betterShot)
  ) {
    betterShot = Math.floor(Math.random() * 100);
  }
  compShotHistory.push(betterShot);
  handleComputerShot(betterShot);
}

function nextTurn(playerTurn) {
  if (playerHits === 17 || computerHits.length === 17) return;
  if (!playerTurn) {
    computerBoardSquares.forEach((square) =>
      square.removeEventListener("click", handleShot)
    );
    thinkingMsg.style.visibility = "visible";
    setTimeout(function () {
      computerShot();
      thinkingMsg.style.visibility = "hidden";
    }, 800);

    return;
  }
  computerBoardSquares.forEach((square) =>
    square.addEventListener("click", handleShot)
  );
  msg.innerText = `Click a cell on the computer's board to take a shot!`;
}

function checkSunkShips(shipData) {
  let list;
  shipData.forEach((ship) => {
    {
      if (ship.hits === ship.length && ship.sunk === false) {
        playerTurn ? (list = playerHitList) : (list = compHitList);
        let sunkShip = document.createElement("li");
        sunkShip.innerText = ship.name;
        list.appendChild(sunkShip);
        ship.sunk = true;
      }
    }
  });
}

function cleanup() {
  computerBoardSquares.forEach((square) =>
    square.removeEventListener("click", handleShot)
  );
  ships.forEach((ship) => {
    ship.removeEventListener("dragstart", (e) => {
      dragged = e.target;
    });
  });
}
