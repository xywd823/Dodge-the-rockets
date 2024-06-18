document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const character = document.getElementById('character');
    const startScreen = document.getElementById('startScreen');
    const endScreen = document.getElementById('endScreen');
    const startButton = document.getElementById('startButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const shotsLeftDisplay = document.getElementById('shotsLeft');
    const survivalTimeDisplay = document.getElementById('survivalTime');
    const finalTimeDisplay = document.getElementById('finalTime');
    const finalPointsDisplay = document.getElementById('finalPoints');
    const pointsDisplay = document.getElementById('points');
    let characterY = gameArea.clientHeight / 2;
    let rockets = [];
    let bigRockets = [];
    let yellowRockets = [];
    let gameActive = false;
    let rocketSpeed = 5; // Initial speed for rockets
    let bigRocketSpeed = 7; // Initial speed for big rockets
    let yellowRocketSpeed = 15;
    let shotsLeft = 5;
    let survivalTime = 0;
    let points = 0;
    let survivalTimer;
    let speedIncreaseTimer;
    let moveUp = false;
    let moveDown = false;
    const maxRockets = 10; // Maximum number of rockets on the screen at once

    character.style.top = `${characterY}px`;
    character.style.left = '100px'; // Move character more to the right

    function moveCharacter() {
        if (!gameActive) return;
        if (moveUp) {
            characterY -= 5;
        }
        if (moveDown) {
            characterY += 5;
        }
        characterY = Math.max(0, Math.min(characterY, gameArea.clientHeight - character.clientHeight));
        character.style.top = `${characterY}px`;
        requestAnimationFrame(moveCharacter);
    }

    function createRocket() {
        if (!gameActive || rockets.length + bigRockets.length >= maxRockets) return;
        let top;
        let overlap;
        do {
            top = Math.floor(Math.random() * (gameArea.clientHeight - 20));
            overlap = rockets.filter(rocket => Math.abs(parseInt(rocket.style.top) - top) < 40).length >= 3;
        } while (overlap);
        const rocket = document.createElement('div');
        rocket.classList.add('rocket');
        rocket.style.top = `${top}px`;
        gameArea.appendChild(rocket);
        rockets.push(rocket);
    }

    function createBigRocket() {
        if (!gameActive || rockets.length + bigRockets.length >= maxRockets) return;
        for (let i = 0; i < 3; i++) {
            let top;
            let overlap;
            do {
                top = Math.floor(Math.random() * (gameArea.clientHeight - 30));
                overlap = bigRockets.filter(bigRocket => Math.abs(parseInt(bigRocket.style.top) - top) < 50).length >= 3;
            } while (overlap);
            const bigRocket = document.createElement('div');
            bigRocket.classList.add('bigRocket');
            bigRocket.style.top = `${top}px`;
            gameArea.appendChild(bigRocket);
            bigRockets.push(bigRocket);
        }
    }

    function shootYellowRocket(event) {
        if (event.button !== 1 || !gameActive || shotsLeft <= 0) return; // Only respond to middle-click (scroll wheel press) and if shots are available
        shotsLeft--;
        updateShotsLeftDisplay();
        const yellowRocket = document.createElement('div');
        yellowRocket.classList.add('yellowRocket');
        yellowRocket.style.top = `${characterY + character.clientHeight / 2 - 5}px`;
        yellowRocket.style.left = `${character.offsetLeft + character.clientWidth}px`;
        gameArea.appendChild(yellowRocket);
        yellowRockets.push(yellowRocket);
    }

    function moveRockets() {
        rockets.forEach((rocket, index) => {
            let rocketX = rocket.offsetLeft - rocketSpeed;
            if (rocketX < -50) {
                rocket.remove();
                rockets.splice(index, 1);
            } else {
                rocket.style.left = `${rocketX}px`;
                checkCollision(rocket);
            }
        });
    }

    function moveBigRockets() {
        bigRockets.forEach((bigRocket, index) => {
            let bigRocketX = bigRocket.offsetLeft - bigRocketSpeed;
            if (bigRocketX < -70) {
                bigRocket.remove();
                bigRockets.splice(index, 1);
            } else {
                bigRocket.style.left = `${bigRocketX}px`;
                checkCollision(bigRocket);
            }
        });
    }

    function moveYellowRockets() {
        yellowRockets.forEach((yellowRocket, index) => {
            let yellowRocketX = yellowRocket.offsetLeft + yellowRocketSpeed;
            if (yellowRocketX > gameArea.clientWidth) {
                yellowRocket.remove();
                yellowRockets.splice(index, 1);
            } else {
                yellowRocket.style.left = `${yellowRocketX}px`;
                checkYellowCollision(yellowRocket);
            }
        });
    }

    function checkCollision(rocket) {
        const rocketRect = rocket.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();

        if (
            rocketRect.left < characterRect.right &&
            rocketRect.right > characterRect.left &&
            rocketRect.top < characterRect.bottom &&
            rocketRect.bottom > characterRect.top
        ) {
            gameOver();
        }
    }

    function checkYellowCollision(yellowRocket) {
        const yellowRocketRect = yellowRocket.getBoundingClientRect();

        bigRockets.forEach((bigRocket, index) => {
            const bigRocketRect = bigRocket.getBoundingClientRect();

            if (
                yellowRocketRect.left < bigRocketRect.right &&
                yellowRocketRect.right > bigRocketRect.left &&
                yellowRocketRect.top < bigRocketRect.bottom &&
                yellowRocketRect.bottom > bigRocketRect.top
            ) {
                bigRocket.remove();
                bigRockets.splice(index, 1);
                yellowRocket.remove();
                yellowRockets.splice(yellowRockets.indexOf(yellowRocket), 1);
                points++;
                updatePointsDisplay();
            }
        });
    }

    function gameOver() {
        gameActive = false;
        rockets.forEach(rocket => rocket.remove());
        bigRockets.forEach(bigRocket => bigRocket.remove());
        yellowRockets.forEach(yellowRocket => yellowRocket.remove());
        rockets = [];
        bigRockets = [];
        yellowRockets = [];
        character.style.top = `${gameArea.clientHeight / 2}px`;
        finalTimeDisplay.textContent = `You survived for ${survivalTime} seconds`;
        finalPointsDisplay.textContent = `Points: ${points}`;
        startScreen.style.display = 'flex';
        endScreen.style.display = 'flex';
        clearInterval(survivalTimer);
        clearInterval(speedIncreaseTimer);
    }

    function startGame() {
        gameActive = true;
        survivalTime = 0;
        points = 0;
        shotsLeft = 5;
        rocketSpeed = 5; // Reset speed for rockets
        bigRocketSpeed = 7; // Reset speed for big rockets
        updateShotsLeftDisplay();
        updateSurvivalTimeDisplay();
        updatePointsDisplay();
        startScreen.style.display = 'none';
        endScreen.style.display = 'none';
        characterY = gameArea.clientHeight / 2;
        character.style.top = `${characterY}px`;
        setInterval(createRocket, 1650); // Rockets spawn 10% less frequently
        setInterval(createBigRocket, 10000); // Three big green rockets spawn every 10 seconds
        setInterval(resetShots, 10000); // Reset shots every 10 seconds
        survivalTimer = setInterval(incrementSurvivalTime, 1000); // Update survival time every second
        speedIncreaseTimer = setInterval(increaseSpeed, 5000); // Increase speed every 5 seconds
        requestAnimationFrame(gameLoop);
        requestAnimationFrame(moveCharacter);
    }

    function increaseSpeed() {
        rocketSpeed += 0.5;
        bigRocketSpeed += 0.5;
    }

    function resetShots() {
        if (gameActive) {
            shotsLeft = 5;
            updateShotsLeftDisplay();
        }
    }

    function incrementSurvivalTime() {
        if (gameActive) {
            survivalTime++;
            updateSurvivalTimeDisplay();
        }
    }

    function updateShotsLeftDisplay() {
        shotsLeftDisplay.textContent = `Shots Left: ${shotsLeft}`;
    }

    function updateSurvivalTimeDisplay() {
        survivalTimeDisplay.textContent = `Time: ${survivalTime}s`;
    }

    function updatePointsDisplay() {
        pointsDisplay.textContent = `Points: ${points}`;
    }

    function gameLoop() {
        if (gameActive) {
            moveRockets();
            moveBigRockets();
            moveYellowRockets();
            requestAnimationFrame(gameLoop);
        }
    }

    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', () => {
        endScreen.style.display = 'none';
        startScreen.style.display = 'flex';
    });
    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) moveUp = true;
        if (event.button === 2) moveDown = true;
    });
    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) moveUp = false;
        if (event.button === 2) moveDown = false;
    });
    window.addEventListener('contextmenu', (event) => event.preventDefault()); // Prevent context menu on right-click
    window.addEventListener('mousedown', shootYellowRocket); // Middle-click to shoot
});
