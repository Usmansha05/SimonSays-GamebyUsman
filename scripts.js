document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const colors = ['green', 'red', 'yellow', 'blue'];
    const colorButtons = document.querySelectorAll('.color-btn');
    const startButton = document.getElementById('start-btn');
    const strictButton = document.getElementById('strict-btn');
    const endButton = document.getElementById('end-btn');
    const submitNameButton = document.getElementById('submit-name');
    const playerNameInput = document.getElementById('player-name');
    const currentPlayerDisplay = document.getElementById('current-player');
    const levelDisplay = document.getElementById('level');
    const messageDisplay = document.querySelector('.message-content');
    const playersList = document.getElementById('players-list');
    const playerInputSection = document.getElementById('player-input');
    const confettiContainer = document.querySelector('.confetti-container');

    // Game State Variables
    let sequence = [];
    let playerSequence = [];
    let level = 1;
    let strictMode = false;
    let gameStarted = false;
    let currentPlayer = '';
    let players = [];
    let computerPlaying = false;

    // Initialize Game
    function init() {
        sequence = [];
        playerSequence = [];
        level = 1;
        updateLevel();
        setMessage('PRESS START TO BEGIN');
        gameStarted = false;
        computerPlaying = false;
        colorButtons.forEach(btn => btn.style.opacity = '0.9');
    }

    // Start Game
    function startGame() {
        if (!currentPlayer || gameStarted) return;
        
        gameStarted = true;
        sequence = [];
        playerSequence = [];
        level = 1;
        updateLevel();
        setMessage('WATCH CAREFULLY');
        computerPlaying = true;
        
        // Reset button opacities
        colorButtons.forEach(btn => btn.style.opacity = '0.7');
        
        setTimeout(() => {
            addToSequence();
            playSequence();
        }, 1000);
    }

    // End Game
    function endGame() {
        if (gameStarted && level > 1) {
            addPlayerToScoreboard(currentPlayer, level - 1);
        }
        init();
        currentPlayer = '';
        currentPlayerDisplay.textContent = '-';
        playerNameInput.value = '';
        playerInputSection.style.display = 'flex';
        startButton.disabled = true;
        setMessage('ENTER YOUR NAME TO PLAY');
    }

    // Add Player to Scoreboard
    function addPlayerToScoreboard(name, score) {
        const existingPlayerIndex = players.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
        
        if (existingPlayerIndex !== -1) {
            if (players[existingPlayerIndex].score < score) {
                players[existingPlayerIndex].score = score;
            }
        } else {
            players.push({ name, score });
        }
        
        players.sort((a, b) => b.score - a.score);
        updateScoreboard();
    }

    // Update Scoreboard Display
    function updateScoreboard() {
        playersList.innerHTML = '';
        
        players.slice(0, 10).forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = `player-score ${player.name === currentPlayer ? 'current-player' : ''}`;
            playerElement.innerHTML = `
                <span class="name">${player.name}</span>
                <span class="level">${player.score}</span>
            `;
            playersList.appendChild(playerElement);
        });
    }

    // Handle Name Submission
    function handleNameSubmission() {
        const name = playerNameInput.value.trim();
        
        if (name.length < 1) {
            setMessage('PLEASE ENTER YOUR NAME');
            shakeInput();
            return;
        }
        
        currentPlayer = name;
        currentPlayerDisplay.textContent = name;
        playerInputSection.style.display = 'none';
        startButton.disabled = false;
        setMessage('PRESS START TO BEGIN');
    }

    // Shake input for error
    function shakeInput() {
        const input = playerNameInput.parentElement;
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }

    // Set message with animation
    function setMessage(text) {
        messageDisplay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            messageDisplay.textContent = text;
            messageDisplay.style.animation = 'fadeIn 0.3s forwards';
        }, 300);
    }

    // Add to Sequence
    function addToSequence() {
        const randomColor = Math.floor(Math.random() * 4);
        sequence.push(randomColor);
    }

    // Play Sequence
    function playSequence() {
        let i = 0;
        computerPlaying = true;
        
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                computerPlaying = false;
                playerSequence = [];
                setMessage('YOUR TURN');
                colorButtons.forEach(btn => btn.style.opacity = '0.9');
                return;
            }
            
            const colorIndex = sequence[i];
            const color = colors[colorIndex];
            activateButton(color);
            i++;
        }, 800);
    }

    // Activate Button (Visual and Audio Feedback)
    function activateButton(color) {
        const button = document.getElementById(color);
        button.style.opacity = '1';
        playSound(color);
        
        setTimeout(() => {
            if (!computerPlaying) {
                button.style.opacity = '0.9';
            } else {
                button.style.opacity = '0.7';
            }
        }, 400);
    }

    // Play Sound
    function playSound(color) {
        const sounds = {
            green: 392,
            red: 329.63,
            yellow: 261.63,
            blue: 440
        };
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = sounds[color];
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Handle Player Input
    function handlePlayerInput(colorIndex) {
        if (!gameStarted || computerPlaying || playerSequence.length >= sequence.length) return;
        
        const color = colors[colorIndex];
        activateButton(color);
        playerSequence.push(colorIndex);
        
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            wrongSequence();
            return;
        }
        
        if (playerSequence.length === sequence.length) {
            if (level === 20) {
                setMessage('YOU WON! CONGRATULATIONS!');
                addPlayerToScoreboard(currentPlayer, level);
                createConfetti();
                setTimeout(() => {
                    endGame();
                }, 3000);
                return;
            }
            
            level++;
            updateLevel();
            playerSequence = [];
            setMessage('GOOD JOB! NEXT LEVEL...');
            computerPlaying = true;
            colorButtons.forEach(btn => btn.style.opacity = '0.7');
            
            setTimeout(() => {
                addToSequence();
                playSequence();
            }, 1500);
        }
    }

    // Wrong Sequence Handler
    function wrongSequence() {
        playSound('red');
        setMessage('OOPS! TRY AGAIN');
        
        if (strictMode) {
            setTimeout(() => {
                addPlayerToScoreboard(currentPlayer, level - 1);
                init();
                startGame();
            }, 1500);
        } else {
            setTimeout(() => {
                playerSequence = [];
                setMessage('WATCH CAREFULLY');
                computerPlaying = true;
                colorButtons.forEach(btn => btn.style.opacity = '0.7');
                playSequence();
            }, 1500);
        }
    }

    // Create confetti effect
    function createConfetti() {
        const colors = ['#2ecc71', '#e74c3c', '#f1c40f', '#3498db', '#9b59b6', 
                       '#1abc9c', '#e67e22', '#34495e', '#7f8c8d', '#d35400'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Update Level Display
    function updateLevel() {
        levelDisplay.textContent = level;
    }

    // Toggle Strict Mode
    function toggleStrictMode() {
        strictMode = !strictMode;
        strictButton.classList.toggle('strict-on');
        strictButton.innerHTML = strictMode ? 
            '<i class="fas fa-bolt"></i> STRICT: ON' : 
            '<i class="fas fa-bolt"></i> STRICT: OFF';
        playSound(strictMode ? 'blue' : 'yellow');
    }

    // Event Listeners
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const colorIndex = parseInt(button.getAttribute('data-color'));
            handlePlayerInput(colorIndex);
        });
    });
    
    startButton.addEventListener('click', startGame);
    strictButton.addEventListener('click', toggleStrictMode);
    endButton.addEventListener('click', endGame);
    submitNameButton.addEventListener('click', handleNameSubmission);
    
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleNameSubmission();
        }
    });

    // Initialize Game
    init();

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fadeOut {
            to { opacity: 0; transform: translateY(-5px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

// Updated activateButton function for subtle flashing
function activateButton(color) {
    const button = document.getElementById(color);
    button.classList.add('active');
    playSound(color);
    
    // Very brief flash (150ms)
    setTimeout(() => {
        button.classList.remove('active');
    }, 150);
}

// Face expressions and quotes
const expressions = {
    happy: {
        class: 'happy',
        quotes: [
            "Awesome job!",
            "You're amazing!",
            "Wow! So smart!",
            "Keep it up!",
            "Super star!"
        ],
        sound: 'happy-sound'
    },
    sad: {
        class: 'sad',
        quotes: [
            "Oops! Try again!",
            "Almost had it!",
            "You'll get it next time!",
            "Don't give up!",
            "Keep trying!"
        ],
        sound: 'sad-sound'
    },
    surprised: {
        class: 'surprised',
        quotes: [
            "Whoa!",
            "Incredible!",
            "Unbelievable!",
            "How did you do that?",
            "Amazing memory!"
        ],
        sound: 'surprise-sound'
    }
};

// DOM elements
const mouth = document.querySelector('.mouth');
const quoteElement = document.querySelector('.quote');
const startBtn = document.getElementById('start-btn');
const colorButtons = document.querySelectorAll('.color-btn');

// Change face expression
function setExpression(type) {
    const expression = expressions[type];
    
    // Reset all classes
    mouth.className = 'mouth';
    
    // Add new expression class
    mouth.classList.add(expression.class);
    
    // Show random quote
    const randomQuote = expression.quotes[Math.floor(Math.random() * expression.quotes.length)];
    quoteElement.textContent = randomQuote;
    quoteElement.classList.add('show-quote');
    
    // Play sound
    const sound = document.getElementById(expression.sound);
    sound.currentTime = 0;
    sound.play();
    
    // Hide quote after delay
    setTimeout(() => {
        quoteElement.classList.remove('show-quote');
    }, 2000);
}

// Game start
startBtn.addEventListener('click', () => {
    setExpression('happy');
    
    // Start your game logic here
    // For demonstration, we'll just show expressions when buttons are clicked
});

// Button clicks
colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Random expression for demonstration
        const types = ['happy', 'sad', 'surprised'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setExpression(randomType);
    });
});