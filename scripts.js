/*----- constants -----*/
const boardHeight = 10;
const boardWidth = 10;

/*----- state variables -----*/

//board state represent hits +1 and misses -1
let boardState;
let validStart;
let dragged = null;

let playerTakenSquares = []; //store the coordinates of where the ship divs have been dropped

let computerTakenSquares = []; // store the coordinates of where computerSetup places boats (simply spans across the )

/*----- cached elements  -----*/
const playerBoard = document.getElementById("player-board");
const computerBoard = document.getElementById("computer-board");
const ships = [...document.getElementsByClassName("ship")];
const shipLengths = ships.map((ship) => ship.dataset.length);

/*----- event listeners -----*/
ships.forEach((ship) =>
  ship.addEventListener("dragstart", (e) => {
    dragged = e.target;
    console.log(dragged);
  })
);

playerBoard.addEventListener("dragover", (e) => e.preventDefault);

playerBoard.addEventListener("drop", (e) => e.preventDefault);
/*----- functions -----*/
buildBoards();
function startGame() {
  boardState = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  buildBoards();
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

// cache the grid cells!
const playerBoardSquares = [...playerBoard.querySelectorAll("div")];
const computerBoardSquares = [...computerBoard.querySelectorAll("div")];

// console.log(playerBoardSquares);
// console.log(computerBoardSquares);
// console.log(shipLengths);

shipLengths.forEach((ship) => setupComputerShips(ship));

function setupComputerShips(shipLength) {
  //for all ships

  // console.log(shipLengthsArr[i]);
  let randomIdx = Math.floor(Math.random() * 100);
  while (computerTakenSquares.includes(randomIdx)) {
    randomIdx = Math.floor(Math.random() * 100);

    // Check if all indices are taken
    if (computerTakenSquares.length === 100) {
      break;
    }
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
      console.log(currentStart);
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

console.log(computerTakenSquares);

//use state to update UI
renderComputerBoard(computerTakenSquares, computerBoardSquares);
function renderComputerBoard(computerTakenSquares, computerBoardSquares) {
  computerTakenSquares.forEach(
    (idx) =>
      (computerBoardSquares[idx].style.backgroundColor = "var(--main-blue)")
  );
}

// todo
// fix build Boards to actually set up grid

//     Battleship:

//     - Two ten by ten grids

//     - one represents hidden computer board, other is player board

//     - create with two containers with 10x10 css grids

//     - append squares to containers at each grid position using for loops to assign their position based on index. Outer of loop takes row, inner takes column;

//    Pieces:

//      - Carrier (5)

//      - Battleship (4)

//      - Cruiser (3)

//      - Submarine (3)

//      - Destroyer (2)

//      Class Ship = {
//       constructor(name, length) {
//         this.name = name;
//         This.length = length;
//    }

//    State:

//     - Hits (number) on boardState

//     - misses (number) on boardState

//     - takenSquares (update when ship dropped)

//     - Sunk Ships (a list on screen generated by an array)

//     - possible to hold hit, miss, or neutral state in an array called boardState.

//     - update board at end of each turn using boardState array to update styles of divs corresponding in index.

//     - structure of boardState and boardSquares (DOM cached DOM squares(divs)) must match in structure. Array of arrays

//    Build board:

//     - 10x for loop, assign col id
//     - 10x inner loop assign row id

//     - figure out where event listeners go to detect and check valid drop on rows and columns

//    - event is on the div itself, which has an index within the boardSquares cached array. I need to understand the structure of the event.target object and how to check available cols based on the indexOf the event.target in boardSquares

//    Setup:

//     - Drag and drop pieces onto game board

//     - Piece can be horizontal or vertical based on isHorizontal

//     - Must be dropped onto empty squares (check e.target squares against taken squares)

//     - Must not go over board boundary (check using board square id?.

//        handleDrop()

//       If isHorizontal

//         - startIdx = boardSquares.indexOf(e.target)
//         - if startIdx + ship.length > 10, invalid drop

//       If !isHorizontal

//         - check if ship.length + column index > 10

//               - this means that each square will be programatically assigned a rowID colID as a co

//     - Once Total taken squares > 17 (34 if adding computer taken squares to array), game starts

//    Player Play:

//     - Player goes first

//     - Click on a square on computer grid

//     - If hit fire hit function and display `it's a hit!` -> update Dom with red coloured divs(square) for hit square -> check sink -> - otherwise miss, white square

//     - check win

//    Computer Play:

//     - Use either random num or alg to pick a square on player board

//     - use set timeout to simulate thinking

//     - update dom to show hits or misses -> check sink -

//     - check win

//    issues:

//    - How to store values of Ships (start in a div at side of screen, dragged onto board.)
//         - ships are groups of divs that span a section on the grid that matches their own dimensions
//         - ship Divs will have hard coded id corresponding to their name

//    - how to check hit:
//         - Use taken squares? (Data associated with ship will be color of div based on hit status, position on board
