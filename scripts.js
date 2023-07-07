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

  // let angle = selectedShip.style.transform;

  // selectedShip.style.transform =
  //   angle === "rotate(90deg)" ? "rotate(0deg)" : "rotate(90deg)";
  selectedShip.dataset.rotated =
    selectedShip.dataset.rotated === "true" ? false : true;
  // console.log(selectedShip.dataset.rotated);
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

  msg.innerText = `~ Drag all your ships onto the board to start a game
  
  ~ Click a ship to select and rotate`;
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
  // computerBoardSquares.forEach((square) =>
  //   square.addEventListener("click", handleShot)
  // );
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
  console.log(dragged);
  draggedShipHistory.push(dragged);
  // console.log(draggedShipHistory);
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
    // console.log(`startidx decremented at top level`);
  }
  // console.log(isHorizontal);
  // if (!isHorizontal) {
  //   for (let i = 10; playerTakenSquares.includes(startIdx); i += 10) {
  //     console.log(shipLength);
  //     let verticalChecks = shipLength;
  //     if (verticalChecks < 1) {
  //       startIdx++;
  //       break;
  //     }
  //     side ? (startIdx += i) : (startIdx -= i);
  //     // console.log(startIdx);
  //     side = !side;
  //     // console.log(side);
  //     verticalChecks--;
  //     // console.log(verticalChecks);
  //     if (startIdx < 0) {
  //       console.log(`vertical adjusted`);
  //       startIdx = 0;
  //     }
  //   }
  // } else {
  // for (let i = 0; playerTakenSquares.includes(startIdx); i++) {
  //   side ? (startIdx += i) : (startIdx -= i);
  //   console.log(startIdx);
  //   side = !side;
  //   console.log(side);
  //   if (startIdx < 0) {
  //     startIdx = 0;
  //   }
  // }
  // }

  // console.log(startIdx);
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
          // console.log(startIdx);
          if (startIdx < 0) {
            startIdx = 0;
          } else if (startIdx > 99) {
            startIdx = 99;
          }
        }
        // console.log(startIdx);
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
  // side = true;
  // console.log(validStart);
  // console.log(shipLength, validStart, isHorizontal);
  let isTaken = true;
  //check availability
  if (isHorizontal) {
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(validStart + j)) {
        // console.log(validStart + j);
        // console.log(`hori not taken`);
        isTaken = false;
      } else {
        isTaken = true;
        // console.log(`hori taken`);
        break;
      }
    }
    console.log(`horizontal checked`);
  } else {
    let currentStart = validStart; // Introduce a new variable for iteration
    for (let j = 0; j < shipLength; j++) {
      if (!playerTakenSquares.includes(currentStart)) {
        isTaken = false;
        // console.log(`vertical not taken`);
      } else {
        isTaken = true;
        // console.log(`Vertical taken`);
        break;
      }
      currentStart += 10; // Increment the currentStart variable instead of modifying validStart
    }
    console.log(`vertical checked`);
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
    // console.log(playerTakenSquares);
    // console.log(isTaken);

    isHorizontal ? validStart-- : (validStart -= 10);
    // console.log(`after ternary`);
    // console.log(validStart);
    setPlayerShip(validStart, shipLength, isHorizontal);
    return;
    console.log(`isTakenRan`);
  } else {
    if (isHorizontal) {
      for (let j = 0; j < shipLength; j++) {
        playerTakenSquares.push(validStart + j);
        shipSquares.push(validStart + j);
        // console.log(`added squares to playerTaken array horizontal`);
        // console.log(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        // console.log(currentStart);
        // console.log(`added squares to playerTaken array vertical`);
        playerTakenSquares.push(currentStart);
        shipSquares.push(currentStart);
        currentStart += 10; // Increment the currentStart variable
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
  console.log(lastDroppedShipName);
  console.log(lastDroppedShip);
  lastDroppedShip.occupiedSquares = shipSquares;
  // console.log(lastDroppedShip);
  console.log(shipSquares);
  console.log(lastDroppedShip.occupiedSquares);
  renderBoard(playerTakenSquares, playerBoardSquares);
  console.log(isTaken);
}

// shipLengths.forEach((ship) => setupComputerShips(ship));
compShipData.forEach((ship) => {
  setupComputerShips(ship.length, ship.name);
});

function setupComputerShips(shipLength, shipName) {
  //for all ships
  // console.log(shipLength, shipName);

  if (computerTakenSquares.length === 17) return;

  // console.log(shipLengthsArr[i]);
  let randomIdx = Math.floor(Math.random() * 100);
  while (computerTakenSquares.includes(randomIdx)) {
    randomIdx = Math.floor(Math.random() * 100);
  }
  // randomly make ships horizontal
  let horizontal = Math.random() < 0.5;
  checkValidComputerBounds(shipLength, randomIdx, horizontal, shipName);

  //vertical

  // console.log(computerTakenSquares);

  // don't allow overlap
  // if computerTakenSquares contains
}

function checkValidComputerBounds(shipLength, randomIdx, horizontal, shipName) {
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
    setupComputerShips(shipLength, shipName);
  } else {
    if (horizontal) {
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(validStart + j);
        compShipSquares.push(validStart + j);
        // console.log(validStart + j);
      }
    } else {
      let currentStart = validStart;
      for (let j = 0; j < shipLength; j++) {
        computerTakenSquares.push(currentStart);
        compShipSquares.push(currentStart);
        currentStart += 10; // Increment the currentStart variable
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
  // console.log(`${playerTakenSquares} before filter`);
  playerTakenSquares = playerTakenSquares.filter(
    (squares) => !shipSquaresToRemove.includes(squares)
  );
  // console.log(`${playerTakenSquares} after filter`);
  draggedSquaresHistory.pop();
  let putBackShip = draggedShipHistory.pop();
  shipContainer.appendChild(putBackShip);

  renderBoardUndo(playerTakenSquares, playerBoardSquares);

  //repaint the squares from the last array in draggedSquaresHistory

  //append the last ship in draggedShipHistory back onto ship container
}

function renderBoardUndo(takenSquares, boardSquares) {
  // console.log(takenSquares);
  boardSquares.forEach((square, i) => {
    // console.log(square);
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
        // console.log(ship);
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
  console.log(shot);

  if (playerTakenSquares.includes(shot)) {
    computerHits.push(shot);
    console.log(`pushed a hit in compHandler` + shot);
    computerShotTarget.style.backgroundColor = "red";
    playerShipData.forEach((ship) => {
      if (ship.occupiedSquares.includes(shot)) {
        ship.hits++;
        // console.log(ship);
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
  // console.log(hits);

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
  // let checkCounter = 0;
  console.log(`top level compShot History is ` + compShotHistory);
  console.log(`this is the last hit at the top level:` + lastHit);
  if (compShotHistory.length < 1) {
    function randomFirstShot(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let randomRange = ranges[Math.floor(Math.random() * ranges.length)];
    shot = randomFirstShot(randomRange.min, randomRange.max);
    compShotHistory.push(shot);
    handleComputerShot(shot);
    console.log(`first computerShot`);
    return;
  }

  if (computerHits.length < 1) {
    prevHit = Math.floor(Math.random() * 100);
    console.log(
      `prevHit has been randomized because there are no hits: it is` + prevHit
    );
  } else if (computerHits.length > 0 && computerHits.length < 2) {
    prevHit = computerHits[0];
    console.log(
      `only one prev hit so it's the first in the comp hits array` + prevHit
    );
  } else {
    prevHit = lastHit;
    console.log(`more than one hit so assigned last hit to prevHit` + prevHit);
    console.log(computerHits);
  }
  console.log(
    `this is the guaranteed last hit and should match randomized or other` +
      prevHit
  );
  if (!betterShot && prevHit + 1 <= 99 && computerHits.includes(prevHit + 1)) {
    betterShot = prevHit + 2;
    console.log(`following right trend`);
    console.log(betterShot);
  }
  if (!betterShot && prevHit - 1 >= 0 && computerHits.includes(prevHit - 1)) {
    betterShot = prevHit - 2;
    console.log(`following left trend`);
    console.log(betterShot);
  }
  if (
    !betterShot &&
    prevHit + 10 <= 99 &&
    computerHits.includes(prevHit + 10)
  ) {
    betterShot = prevHit + 20;
    console.log(`following down trend`);
    console.log(betterShot);
  }
  if (!betterShot && prevHit - 10 >= 0 && computerHits.includes(prevHit - 10)) {
    betterShot = prevHit - 20;
    console.log(`following up trend`);
    console.log(betterShot);
  }

  if (!betterShot || compShotHistory.includes(betterShot)) {
    // betterShot = prevHit + guesses[randomGuessIdx];
    // if(compShotHistory.includes(betterShot))
    console.log(
      `shot history just before LOOP: shot was in history =>` + compShotHistory
    );
    console.log(
      `value of betterShot after conditionals after guard before LOOP: ` +
        betterShot
    );
    console.log(`hits just before LOOP` + computerHits);
    // checks for empty squares
    console.log(
      `no adjacent hits to follow so` + prevHit + `is prevHit before LOOP`
    );
    for (let i = 0; i < 4; i++) {
      console.log(i);
      console.log(`guess values are` + guesses[i]);
      betterShot = prevHit + guesses[i];
      if (
        !compShotHistory.includes(betterShot + guesses[i]) &&
        betterShot >= 0 &&
        betterShot <= 99
      ) {
        console.log("found adjacent guess not in history, within LOOP");
        console.log(`prevHit was adjusted by ` + guesses[i]);
        break;
      }
    }
    console.log(prevHit + `is prevHit after LOOP`);
    console.log(betterShot + `is BetterShot (adjusted prevHit after LOOP)`);
  }

  while (
    betterShot > 99 ||
    betterShot < 0 ||
    !betterShot ||
    compShotHistory.includes(betterShot)
  ) {
    console.log(
      `No available guess and around square - looping random (range overrun of boxed in) - - this is after unsuccessfully following trend and checking perimiter `
    );
    betterShot = Math.floor(Math.random() * 100);
    console.log(`value of betterShot in loop:` + betterShot);
  }
  // console.log(lastHit);

  // let randomBoolean = Math.random() > 0.5;

  //computerHits is our array of past hits. prevHit is always the last value

  // right now it will always find a hit within a 4 square radius

  // try logging before conditionals and seeing which are hit

  // function checkBetterShots(checkCounter) {
  //   playerShipData.forEach((ship) => {
  //     let sideCheck = 1;
  //     console.log(ship.occupiedSquares);
  //     console.log(prevHit);
  //     if (
  //       !betterShot &&
  //       ship.occupiedSquares.includes(prevHit + sideCheck + checkCounter) &&
  //       !compShotHistory.includes(prevHit + sideCheck + checkCounter)
  //     ) {
  //       betterShot = prevHit + sideCheck + checkCounter;

  //     }

  //     if (
  //       !betterShot &&
  //       ship.occupiedSquares.includes(
  //         prevHit + sideCheck * -1 + checkCounter * -1
  //       ) &&
  //       !compShotHistory.includes(prevHit + sideCheck * -1 + checkCounter * -1)
  //     ) {
  //       betterShot = prevHit + sideCheck * -1 + checkCounter * -1;

  //     }

  //     if (
  //       !betterShot &&
  //       ship.occupiedSquares.includes(
  //         prevHit + sideCheck * 10 + checkCounter * 10
  //       ) &&
  //       !compShotHistory.includes(prevHit + sideCheck * 10 + checkCounter * 10)
  //     ) {
  //       betterShot = prevHit + sideCheck * 10 + checkCounter * 10;

  //     }

  //     sideCheck *= -1;
  //     checkCounter *= -1;
  //     let betterSide = sideCheck * 10;

  //     if (
  //       !betterShot &&
  //       ship.occupiedSquares.includes(
  //         prevHit + betterSide + checkCounter * 10
  //       ) &&
  //       !compShotHistory.includes(prevHit + betterSide + checkCounter * 10)
  //     ) {
  //       betterShot = prevHit + betterSide + checkCounter * 10;

  //     }
  //   });
  // }
  // if (randomBoolean) {
  //   betterShot = Math.random() > 0.5 ? randomPrevHit + 1 : randomPrevHit + 10; //checking to right and below}
  // } else {
  //   betterShot = Math.random() > 0.5 ? randomPrevHit - 1 : randomPrevHit - 10;
  // }

  // betterShot = Math.floor(Math.random() * 100);
  // console.log(`randomized final, betterShot is in history`);
  // if (betterShot > 99) {
  //   betterShot = 0;
  // }

  console.log(`betterShot just before pushing to history` + betterShot);
  compShotHistory.push(betterShot);
  console.log(`history with new shot added end of function` + compShotHistory);
  console.log(
    `last stage in computerShot, this is passed to handle: ` + betterShot
  );
  handleComputerShot(betterShot);
}

function nextTurn(playerTurn) {
  if (playerHits === 17 || computerHits.length === 17) return;
  if (!playerTurn) {
    // console.log(`comp turn`);
    computerBoardSquares.forEach((square) =>
      square.removeEventListener("click", handleShot)
    );
    thinkingMsg.style.visibility = "visible";

    setTimeout(function () {
      computerShot();
      thinkingMsg.style.visibility = "hidden";
    }, 700);

    return;
  }
  // console.log(`player turn`);
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
        // console.log(list);
        let sunkShip = document.createElement("li");
        // console.log(ship.sunk);
        // console.log(ship.name);
        sunkShip.innerText = ship.name;
        list.appendChild(sunkShip);
        ship.sunk = true;
      }
      // console.log(ship.hits);
    }
  });
  //   const compHitList = document.getElementsByClassName("comp-list-ul");
  // const playerHitList = document.getElementsByClassName("player-list-ul");
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
