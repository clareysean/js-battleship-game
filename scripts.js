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

let playerTakenSquares = []; //store the coordinates of where the ship divs have been dropped

let computerTakenSquares = []; // store the coordinates of where computerSetup places boats (simply spans across the )

/*----- cached elements  -----*/
const playerBoard = document.getElementById("player-board");
const computerBoard = document.getElementById("computer-board");
const ships = [...document.getElementsByClassName("ship")];
const shipLengths = ships.map((ship) => ship.dataset.length);
const msg = document.getElementById("msg");
const rotateBtn = document.getElementById("rotate-btn");
const shipContainer = document.getElementById("ship-container");
const resetBtn = document.getElementById("reset-btn");

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
  // console.log("clicked");
  let angle = selectedShip.style.transform;

  selectedShip.style.transform =
    angle === "rotate(90deg)" ? "rotate(0deg)" : "rotate(90deg)";
  selectedShip.dataset.rotated =
    selectedShip.dataset.rotated === "true" ? false : true;
  // console.log(selectedShip.dataset.rotated);
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

  msg.innerText = `Drag all your ships onto the board to start a game!`;

  shipLengths.forEach((ship) => setupComputerShips(ship));
  rotateBtn.addEventListener("click", rotateSelectedShip);

  resetBtn.addEventListener("click", startGame);

  playerBoardSquares.forEach(
    (square) => (square.style.backgroundColor = "white")
  );
  computerBoardSquares.forEach(
    (square) => (square.style.backgroundColor = "white")
  );
  computerBoardSquares.forEach((square) =>
    square.addEventListener("click", handleShot)
  );
  playerBoard.addEventListener("dragover", preventDragoverDefault);

  ships.forEach((ship) => {
    ship.addEventListener("dragstart", assignDragged);
    ship.addEventListener("click", selectShipToggle);
    shipContainer.appendChild(ship);
    ship.style.transform = "rotate(0deg)";
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
  console.log(dragged);
  e.preventDefault();
  let dropIdx = playerBoardSquares.indexOf(e.target);

  let shipLength = dragged.getAttribute("data-length");
  isHorizontal = dragged.getAttribute("data-rotated") === "true";
  setPlayerShip(dropIdx, shipLength, isHorizontal);
  shipContainer.removeChild(dragged);
}

function setPlayerShip(startIdx, shipLength, isHorizontal) {
  if (playerTakenSquares.length >= 17) return;
  // if (startIdx < 0 || startIdx > 99) startIdx = 0;

  // while (playerTakenSquares.includes(startIdx)) {
  //   startIdx--;
  //   if (startIdx < 0) {
  //     startIdx = 99;
  //   }
  // }
  if (!isHorizontal) {
    for (let i = 10; playerTakenSquares.includes(startIdx); i += 10) {
      side ? (startIdx += i) : (startIdx -= i);
      console.log(startIdx);
      side = !side;
      console.log(side);
      if (startIdx < 0) {
        startIdx = 0;
      }
    }
  } else {
    for (let i = 0; playerTakenSquares.includes(startIdx); i++) {
      side ? (startIdx += i) : (startIdx -= i);
      console.log(startIdx);
      side = !side;
      console.log(side);
      if (startIdx < 0) {
        startIdx = 0;
      }
    }
  }

  console.log(startIdx);
  checkValidPlayerBounds(shipLength, startIdx, isHorizontal);
}

function checkValidPlayerBounds(shipLength, startIdx, isHorizontal) {
  // console.log(shipLength, startIdx, isHorizontal);
  if (isHorizontal) {
    if (startIdx > 100 - shipLength) {
      startIdx = 100 - shipLength;
    }

    for (let k = 10; k <= 100; k += 10) {
      let lowerValidBound = k - 10;
      if (startIdx >= lowerValidBound && startIdx < k) {
        if (startIdx > k - shipLength) {
          // console.log(startIdx);
          startIdx = k - shipLength;
        }

        while (playerTakenSquares.includes(startIdx)) {
          startIdx -= 1;
          console.log(startIdx);
          if (startIdx < 0) {
            startIdx = 0;
          } else if (startIdx > 99) {
            startIdx = 99;
          }
        }
        console.log(startIdx);
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
  side = true;
  console.log(validStart);
  // console.log(shipLength, validStart, isHorizontal);
  let isTaken = true;
  //check availability
  if (isHorizontal) {
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(validStart + j)) {
        console.log(validStart + j);
        console.log(`not taken`);
        isTaken = false;
      } else {
        isTaken = true;
        console.log(`taken`);
        break;
      }
    }
  } else {
    let currentStart = validStart; // Introduce a new variable for iteration
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(currentStart)) {
        isTaken = false;
        console.log(`vertical not taken`);
      } else {
        isTaken = true;
        console.log(`Vertical taken`);
        break;
      }
      currentStart += 10; // Increment the currentStart variable instead of modifying validStart
    }
  }

  if (isTaken) {
    // for (let i = 0; i < 100; i++) {
    //   side ? (validStart += i) : (validStart -= i);
    //   console.log(validStart);
    //   side = !side;
    //   console.log(side);
    //   if (validStart < 0) {
    //     validStart = 0;
    //   } else if (validStart > 99) {
    //     validStart = 99;
    //   }

    //   console.log(i);
    // }
    console.log(playerTakenSquares);
    isHorizontal ? validStart-- : (validStart -= 10);

    setPlayerShip(validStart, shipLength, isHorizontal);
  } else {
    if (isHorizontal) {
      for (let j = 0; j < shipLength; j++) {
        playerTakenSquares.push(validStart + j);
        console.log(`added squares to playerTaken array horizontal`);
        // console.log(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        // console.log(currentStart);
        console.log(`added squares to playerTaken array vertical`);
        playerTakenSquares.push(currentStart);
        currentStart += 10; // Increment the currentStart variable
      }
    }
    if (playerTakenSquares.length === 17) {
      msg.innerText = `Click a cell on the computer's board to take a shot!`;
      nextTurn(playerTurn);
    }
  }

  renderBoard(playerTakenSquares, playerBoardSquares);
}

shipLengths.forEach((ship) => setupComputerShips(ship));

function setupComputerShips(shipLength) {
  //for all ships

  // console.log(shipLengthsArr[i]);
  let randomIdx = Math.floor(Math.random() * 100);
  while (computerTakenSquares.includes(randomIdx)) {
    randomIdx = Math.floor(Math.random() * 100);
  }
  // randomly make ships horizontal
  let horizontal = Math.random() < 0.5;
  checkValidComputerBounds(shipLength, randomIdx, horizontal);

  //vertical

  // console.log(computerTakenSquares);

  // don't allow overlap
  // if computerTakenSquares contains
}

function checkValidComputerBounds(shipLength, randomIdx, horizontal) {
  if (horizontal) {
    if (randomIdx > 100 - shipLength) {
      randomIdx = 100 - shipLength;
    }

    //given a random start index, and a ship length, only allow start indices between 0 and 10-length, 10 and 20-length, 20 and 30-length, 30 and 40-length, 40 and 50-length,
    for (let k = 10; k < 100; k += 10) {
      let lowerValidBound = k - 10;
      if (randomIdx >= lowerValidBound && randomIdx <= k) {
        if (randomIdx > k - shipLength) {
          randomIdx = k - shipLength;
        }

        // Check if the adjusted randomIdx is not in computerTakenSquares array
        while (computerTakenSquares.includes(randomIdx)) {
          randomIdx--;
        }

        break; // Exit the loop after finding a valid randomIdx
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
  // console.log(`pre update` + validStart);
  updateComputerTakenSquares(shipLength, validStart, horizontal);
}

function updateComputerTakenSquares(shipLength, validStart, horizontal) {
  let isTaken = true;
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
    let currentStart = validStart; // Introduce a new variable for iteration
    for (let j = 0; j < shipLength; j++) {
      if (!computerTakenSquares.includes(currentStart)) {
        isTaken = false;
      } else {
        isTaken = true;
        break;
      }
      // console.log(currentStart);
      currentStart += 10; // Increment the currentStart variable instead of modifying validStart
    }
  }

  if (isTaken) {
    setupComputerShips(shipLength);
  } else {
    if (horizontal) {
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(validStart + j);
        // console.log(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(currentStart);
        currentStart += 10; // Increment the currentStart variable
      }
    }
  }
}

// console.log(computerTakenSquares);

//use state to update UI

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
  } else {
    msg.innerText = `Missed... `;
    computerBoardSquares[shotIdx].style.backgroundColor = "gray";
  }
  playerShotHistory.push(shotIdx);
  checkWinner(playerHits, computerHits);
  playerTurn = false;

  nextTurn(playerTurn);
}

function handleComputerShot(shot) {
  let computerShotTarget = playerBoardSquares[shot];
  console.log(shot);

  if (playerTakenSquares.includes(shot)) {
    computerHits.push(shot);
    computerShotTarget.style.backgroundColor = "red";
  } else {
    computerShotTarget.style.backgroundColor = "gray";
  }
  playerTurn = true;
  checkWinner(playerHits, computerHits);
  nextTurn(playerTurn);
}

function checkWinner(playerHits, computerHits) {
  // console.log(hits);
  console.log(playerHits);
  if (playerHits === 17) {
    msg.innerText = `Player wins! Reset game to play again.`;
    cleanup();
  } else if (computerHits.length === 17) {
    msg.innerText = `Computer wins! Reset game to play again.`;
    cleanup();
  }
}

function computerShot() {
  let shot;
  let randomPrevHit;
  let betterShot;
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

  if (computerHits.length === 0) {
    randomPrevHit = Math.floor(Math.random() * 100);
  } else if (computerHits.length === 1) {
    randomPrevHit = computerHits[0];
  } else {
    console.log(computerHits);
    randomPrevHit =
      computerHits[Math.floor(Math.random() * computerHits.length)];
    console.log(randomPrevHit);
  }

  let randomBoolean = Math.random() > 0.5;

  if (randomBoolean) {
    betterShot = Math.random() > 0.5 ? randomPrevHit + 1 : randomPrevHit + 10; //checking to right and below}
  } else {
    betterShot = Math.random() > 0.5 ? randomPrevHit - 1 : randomPrevHit - 10;
  }
  console.log(betterShot);
  if (betterShot > 99 || betterShot < 0) {
    betterShot = Math.floor(Math.random() * 100);
  }
  console.log(betterShot);
  while (compShotHistory.includes(betterShot)) {
    betterShot = Math.floor(Math.random() * 100);

    if (betterShot > 99) {
      betterShot = 0;
    }
  }
  // console.log(betterShot);
  compShotHistory.push(betterShot);
  // console.log(compShotHistory);
  handleComputerShot(betterShot);
}

function nextTurn(playerTurn) {
  if (playerHits === 17 || computerHits.length === 17) return;
  if (!playerTurn) {
    console.log(`comp turn`);
    computerBoardSquares.forEach((square) =>
      square.removeEventListener("click", handleShot)
    );
    computerShot();
    return;
  }
  console.log(`player turn`);
  computerBoardSquares.forEach((square) =>
    square.addEventListener("click", handleShot)
  );
  msg.innerText = `Click a cell on the computer's board to take a shot!`;
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
// todo

// refactor place pieces functions to be more reusable, worth it??

//UI fixes:

//instead of using transform for rotate, change piece shape. create custom rotated class for each ship

// more custom css and transitions
