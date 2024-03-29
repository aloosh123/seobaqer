$.getScript("https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js");
$("#floating_particles").append(`<div id="show_dambla"><img src="/images/ludo_icon.jpeg"></div>`);
$("#show_dambla").on("click", function(){
    $("#floating_particles").append(`<div class="modal fade dambla_chat" id="createRomModal" tabindex="-1" role="dialog" aria-modal="true" style="display: block;">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="room_modal__header modal-header label label-primary">
                <div class="modal-title">
                    <p class="room_modal__header__name ellipsis">لعبة دمبلة</p>
                    <button data-dismiss="modal" class="btn btn-danger room_modal__header__close fa fa-times"></button>
                </div>
            </div>
            <div class="dambla_chat_modal__body modal-body">

                    <div>
                        <style>.container {background-color: #ffffff;padding: 30px;border-radius: 15px;box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);width: 80%;max-width: 500px;}h1 {text-align: center;color: #333333;}.game-container {margin-top: 30px;}.players-list {font-size: 18px;text-align: center;margin-bottom: 20px;}.add-player-container {display: flex;justify-content: center;align-items: center;margin-bottom: 20px;}.player-input {padding: 10px;margin-right: 10px;border-radius: 5px;border: 1px solid #ccc;}.add-player-button {padding: 10px 20px;border-radius: 5px;background-color: #4CAF50;color: white;border: none;cursor: pointer;transition: background-color 0.3s;}.add-player-button:hover {background-color: #45a049;}.start-button {display: block;width: 100%;padding: 15px;border-radius: 5px;background-color: #2196F3;color: white;border: none;cursor: pointer;transition: background-color 0.3s;}.start-button:disabled {background-color: #cccccc;cursor: not-allowed;}.start-button:hover {background-color: #0b7dda;}.random-number {font-size: 28px;text-align: center;margin-top: 30px;padding: 20px;background-color: #f9f9f9;border-radius: 15px;box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);display: none;}.dialog-box {padding: 40px;min-width: 400px;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);background-color: #ffffff;color: #000000;border-radius: 15px;box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);z-index: 1000;display: flex;flex-direction: column;align-items: center;}.dialog-box.hidden {opacity: 0;pointer-events: none;}.happy-face {width: 120px;margin-bottom: 20px;position: absolute;top: -60px;}.close-icon {position: absolute;top: 10px;right: 10px;font-size: 24px;color: #ff0000;cursor: pointer;}.close-icon:hover {color: #d00000;}</style>
                        <div class="container">
                            <h1>دمبلة شات ذهب   </h1>
                            
                            <div class="game-container">
                                <div id="playersList" class="players-list"></div>
                                
                                <div class="add-player-container">
                                  
                                </div>
                                                                
                                <div id="randomNumber" class="random-number hidden"></div> 
                    
                                <div id="dialogBox" class="dialog-box hidden">
                                    <img src="https://j.top4top.io/p_3004o1yw41.png" alt="وجه ضاحك لولد" class="happy-face">
                                    <span id="closeButton" class="close-icon">×</span> 
                                    <p id="dialogText"></p>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </div>
</div>`);
    $("#dambla_chat").modal();
let socket = io.connect('http://localhost:3000');

let players = [];
let intervalId;
let currentNumberIndex = 0;
let winner = null;

function generateNumbers() {
    const numbers = [];
    for (let i = 0; i < 5; i++) {
        const number = Math.floor(Math.random() * 100) + 1;
        if (!numbers.includes(number)) {
            numbers.push(number);
        } else {
            i--;
        }
    }
    return numbers;
}

function displayPlayers(updatedPlayers) {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '<p>اللاعبين:</p>';
    
    updatedPlayers.forEach(player => {
        const numbersStr = player.numbers.join(', ');
        playersList.innerHTML += `<p>${player.name}: ${numbersStr}</p>`;
    });
}

function addPlayer() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();

    if (playerName) {
        socket.emit('addPlayer', playerName);
        playerNameInput.value = '';
    } else {
        alert('يرجى إدخال اسم اللاعب!');
    }
}

function startGame() {
    socket.emit('startGame');
}

// Socket.io listeners
socket.on('updatePlayers', (updatedPlayers) => {
    players = updatedPlayers;
    displayPlayers(players);

    const changeButton = document.getElementById('changeButton');
    if (players.length > 1) {
        changeButton.disabled = false;
    } else {
        changeButton.disabled = true;
    }
});

// socket.on('gameStarted', () => {
//     // Implement your game start logic here
//     // For example:
//     startGameLogic();
// });
socket.on('gameStarted', (randomNumber) => {
    const randomNumberDiv = document.getElementById('randomNumber');
    
    randomNumberDiv.innerText = randomNumber;
    randomNumberDiv.style.display = 'block';

    intervalId = setInterval(() => {
        const currentNumber = generateNumbers()[Math.floor(Math.random() * 5)];
        randomNumberDiv.innerText = currentNumber;
    }, 100);

    setTimeout(() => {
        clearInterval(intervalId);
        randomNumberDiv.style.display = 'none';
        checkWinner(randomNumber);
    }, 4000);
});
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

function startGameLogic() {
    if (winner) return;

    const allNumbers = players.flatMap(player => player.numbers);
    
    if (allNumbers.length === 0) {
        alert('يرجى إضافة أرقام للاعبين قبل بدء اللعبة!');
        return;
    }

    const randomNumber = allNumbers[Math.floor(Math.random() * allNumbers.length)];
    const randomNumberDiv = document.getElementById('randomNumber');
    
    randomNumberDiv.innerText = randomNumber;
    randomNumberDiv.style.display = 'block';

    intervalId = setInterval(() => {
        currentNumberIndex = (currentNumberIndex + 1) % allNumbers.length;
        const currentNumber = allNumbers[currentNumberIndex];
        randomNumberDiv.innerText = currentNumber;
    }, 100);

    setTimeout(() => {
        clearInterval(intervalId);
        randomNumberDiv.style.display = 'none';
        checkWinner(randomNumber);
    }, 4000);
}

function checkWinner(randomNumber) {
    for (const player of players) {
        const numberIndex = player.numbers.indexOf(randomNumber);
        if (numberIndex !== -1) {
            player.numbers.splice(numberIndex, 1);
            displayPlayers(players);
            showRemovedNumberDialog(randomNumber, player.name);

            if (player.numbers.length === 0) {
                winner = player.name;
                showCartoonDialog(`الفائز هو: ${winner}`);
                break;
            }
        }
    }
}

function showRemovedNumberDialog(removedNumber, playerName) {
    const dialogText = document.getElementById('dialogText');
    dialogText.textContent = `تم شطب الرقم ${removedNumber} من ${playerName}`;

    const dialogBox = document.getElementById('dialogBox');
    dialogBox.classList.remove('hidden');
}

function showCartoonDialog(message) {
    const dialogText = document.getElementById('dialogText');
    dialogText.textContent = message;

    const dialogBox = document.getElementById('dialogBox');
    dialogBox.classList.remove('hidden');
}

function hideDialogBox() {
    const dialogBox = document.getElementById('dialogBox');
    dialogBox.classList.add('hidden');
}

document.getElementById('closeButton').addEventListener('click', hideDialogBox);
});
