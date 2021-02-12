// players
const PlayerFactory = (name, marker, scoreID, type) => {
  let playerName = name;
  const playerSide = document.querySelector(`#${scoreID}`);
  let playerMarker = marker;
  const isCPU = () => type === "cpu";
  const get_marker = () => playerMarker;
  const get_score = () => playerSide;
  const get_name = () => playerName;
  const set_marker = newMarker => {
      playerMarker = newMarker || marker;
  };
  const set_name = newName => {
      playerName = newName || name;
  };
  return{
    set_name, get_name, get_marker, set_marker, get_score, isCPU
  }
}

let player1 = PlayerFactory("Player 1", "X", "p1-score", "human");
let player2 = PlayerFactory("Player 2", "O", "p2-score", "CPU");

// cpu funcationality
const cpuPlayer = (function(){

  const getCpuMove = board => {
      let possibleMoves = []; 
      for(let i = 0; i < board.length; i++)
      {
          if(board[i] === "")
          {
              possibleMoves.push(i);
          }
      }
      let randomIndex = Math.floor(Math.random() * possibleMoves.length);
      return possibleMoves[randomIndex];
  }

  return { getCpuMove }
})();

// gameboard
const gameboard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];
    
    const getField = (index) => {
        if (index > board.length) return;
        return board[index];
    };

    const markField = (index, player) => {
        board[index] = player;
    }

    const reset = () => {
        for (let i = 0; i < board.length; i++) {
          board[i] = "";
        }
      };


    // gameplay
    let turn = 1;
    let isRoundOver = false;
    let isPlaying = false;
    let currentPlayer = undefined;

    const playRound = (index) => {
      isPlaying = true;
      currentPlayer = player1;
      if (isPlaying && board[index] === ""){
          markField(index, getCurrentPlayerSign());
          if (checkWinner(index)) {
            display.setResultMessage(getCurrentPlayerName());
            var winner = getCurrentPlayerScore();
            winner.textContent += 'I';
            isRoundOver = true;
            if (winner.textContent.length >= 3){
              display.gameOverMessage(getCurrentPlayerName())
            }
          } else if (turn === 9) {
            display.setResultMessage("Draw");
            isRoundOver = true;
          } else {
              changeTurn();
              //When playing vs bot
              if(player2.isCPU()) {
                isPlaying = false;
                setTimeout(() => {
                  let cpuIndex = cpuPlayer.getCpuMove(board)
                  markField(cpuIndex, getCurrentPlayerSign());
                  display.updateGameboard();
                  console.log(cpuIndex)
                      //Check for Draw
                      if(checkWinner(cpuIndex)){
                        display.setResultMessage(getCurrentPlayerName());
                        var winner = getCurrentPlayerScore();
                        winner.textContent += 'I';
                        isRoundOver = true;
                        if (winner.textContent.length >= 3){
                          display.gameOverMessage(getCurrentPlayerName())
                        }
                      } else if (turn === 9) {
                        display.setResultMessage("Draw");
                        isRoundOver = true;
                      } else {
                          isPlaying = true;
                          changeTurn();
                      }
                  }, 800);
              }
          }
      }
    }
    
    const changeTurn = () => {
        currentPlayer = currentPlayer == player1? player2: player1;
        turn++;
        display.setMessageElement(
          `${getCurrentPlayerSign()}'s turn`
        );
    }
    const getCurrentPlayerSign = () => {
      return turn % 2 === 1 ? player1.get_marker() : player2.get_marker();
    };

    const getCurrentPlayerName = () => {
      return turn % 2 === 1 ? player1.get_name() : player2.get_name();
    };

    const getCurrentPlayerScore = () => {
      return turn % 2 === 1 ? player1.get_score() : player2.get_score();
    };

    const checkWinner = (fieldIndex) => {
        const winConditions = [
          [0, 1, 2],
          [0, 3, 6],
          [0, 4, 8],
          [1, 4, 7],
          [2, 5, 8],
          [2, 4, 6],
          [3, 4, 5],
          [6, 7, 8],
        ];
    
        return winConditions
          .filter((winCombo) => winCombo.includes(fieldIndex))
          .some((posibleWinCombos) => posibleWinCombos.every(
              (index) => gameboard.getField(index) === getCurrentPlayerSign()
            )
          );
      };

    const roundOver = () => {
        return isRoundOver;
    };

    const roundReset = () => {
        turn = 1;
        isRoundOver = false;
      };

    const restart = () => {
        turn = 1;
        isRoundOver = false;
        player1.get_score().textContent = ""
        player2.get_score().textContent = ""
      };
    
    return { markField, getField, reset, playRound, roundOver, roundReset, restart };
})();



// display
const display = (() => {
    const fieldElements = document.querySelectorAll(".field");
    const messageElement = document.getElementById("message");
    const clearButton = document.getElementById("clear-button");
    const restartButton = document.getElementById("restart-button");

    fieldElements.forEach((field) =>
        field.addEventListener("click", (e) => {
          console.log('click 2')
            if (gameboard.roundOver() || e.target.textContent !== "") return;
            gameboard.playRound(parseInt(e.target.dataset.index));
            updateGameboard();
        })
    );

    clearButton.addEventListener("click", (e) => {
        gameboard.reset();
        gameboard.roundReset()
        updateGameboard();
        messageElement.textContent = `${player1.get_name()}'s turn`
        messageElement.style.cssText = 'color: var(--pencil)';
      });

    restartButton.addEventListener("click", (e) => {
        let play = document.querySelector("#gametype");
        let main = document.querySelector("#main");
        player1 = PlayerFactory("Player 1", "X", "p1-score", "human");
        player2 = PlayerFactory("CPU", "O", "p2-score", "cpu");
        play.style.display = "block";
        main.style.display = "none";
        gameboard.reset();
        gameboard.restart();
        updateGameboard();
        messageElement.textContent = `${player1.get_name()}'s turn`
        messageElement.style.cssText = 'color: var(--pencil)';
        clearButton.style.display = "flex";
      });
    
    const updateGameboard = () => {
    for (let i = 0; i < fieldElements.length; i++) {
        fieldElements[i].textContent = gameboard.getField(i);
    }
    };

    const setResultMessage = (winner) => {
      if (winner === "Draw") {
          messageElement.textContent = "It's a draw!";
      } else {
          messageElement.textContent = `${winner} wins!`;
          messageElement.style.cssText = 'color: var(--winnerGreen);'
      }
    };

    const gameOverMessage = (winner) => {
      messageElement.textContent = `Its over! ${winner} wins!`;
      clearButton.style.display = "none";
    }

    const setMessageElement = (message) => {
      messageElement.textContent = message;
    };

    return { setResultMessage, setMessageElement, gameOverMessage, updateGameboard };
})();


//Start button

(function(){
    let play = document.querySelector("#gametype");
    let main = document.querySelector("#main");
    let playerBtn = document.querySelector("#vs-human");
    let cpuBtn = document.querySelector("#vs-cpu");
    let player1nameInput = document.querySelector("#p1-name")
    let player2nameInput = document.querySelector("#p2-name")
    let player1markerInput = document.querySelector("#p1-marker")
    let player2markerInput = document.querySelector("#p2-marker")

    playerBtn.addEventListener("click", () => {
        player2 = PlayerFactory("Player 2", "O", "p2-score", "human");
        play.style.display = "none";
        main.style.display = "flex";
        player1nameInput.value = "Player 1";
        player2nameInput.value = "Player 2";
        player1markerInput.value = "X";
        player2markerInput.value = "O";
    })

    cpuBtn.addEventListener("click", () => {
        player2 = PlayerFactory("CPU", "O", "p2-score", "cpu");
        play.style.display = "none";
        main.style.display = "flex";
        player1nameInput.value = "Player 1";
        player2nameInput.value = "CPU";
        player1markerInput.value = "X";
        player2markerInput.value = "O";
    })
})();


// change name
(function(){
  let nameInput1 = document.querySelector("#p1-name");
  let nameInput2 = document.querySelector("#p2-name");

  nameInput1.addEventListener("change", e => {
      player1.set_name(e.target.value)
  })

  nameInput2.addEventListener("change", e => {
      player2.set_name(e.target.value)
  })
})();

// change marker
(function(){
  let markerInput1 = document.querySelector("#p1-marker");
  let markerInput2 = document.querySelector("#p2-marker");

  markerInput1.addEventListener("change", e => {
      player1.set_marker(e.target.value)
  })

  markerInput2.addEventListener("change", e => {
      player2.set_marker(e.target.value)
  })
})();

// resize input
var inputs = document.querySelectorAll('input'); // get the input element
inputs.forEach((input) =>{
  input.addEventListener('input', resizeInput); // bind the "resizeInput" callback on "input" event
  resizeInput.call(input); // immediately call the function
});
function resizeInput() {
  this.style.width = (this.value.length *1.2) + "ch";
}