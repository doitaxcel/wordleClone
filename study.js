// API for fetching words (assumes it returns an array of 5-letter words)
const wordAPI = '/words.json';

const fallbackWords = ['APPLE', 'GRAPE', 'LEMON', 'PEACH', 'BERRY', 'PLUMB', 'ORANGE', 'MELON', 'CHERRY', 'BANANA'];

// Create the tile grid
const board = document.getElementById('board');
for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile', 'w-16', 'h-16', 'border', 'border-gray-400', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'uppercase', 'bg-white');
    board.appendChild(tile);
}

const tiles = document.querySelectorAll('.tile');

// Grid constants
const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;
let targetWord = ''; // Will hold the fetched word

async function fetchTargetWord() {
    console.log('Starting fetch for target word...'); // Debug log
    try {
        const response = await fetch(wordAPI);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const words = await response.json();
        console.log('Fetched words array:', words); // Debug: Log the full array
        if (Array.isArray(words) && words.length > 0) {
            targetWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
            console.log('Selected target word:', targetWord); // This should now log
        } else {
            throw new Error('API returned invalid data (not an array or empty)');
        }
    } catch (error) {
        console.error('Failed to fetch word from API:', error);
        // Fallback to hardcoded word
        targetWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
        console.log('Using fallback target word:', targetWord);
    }
}
fetchTargetWord(); // Call on startup

// Helper: Get tile at row/col
function getTile(row, col) {
    return tiles[row * COLS + col];
}

// Helper: Update active tile (highlight current input spot)
function updateActiveTile() {
    tiles.forEach(t => t.classList.remove('active'));
    if (currentRow < ROWS && currentCol < COLS) {
        getTile(currentRow, currentCol).classList.add('active');
    }
}
updateActiveTile();

// Helper: Check word validity (basic check; expand with a real dictionary)
function isValidWord(word) {
    // For now, just check length and that it's all letters
    return word.length === COLS && /^[A-Z]+$/.test(word);
    // TODO: Add check against a word list (e.g., fetch a dictionary API)
}

// Helper: Provide feedback (color tiles: green=correct pos, yellow=wrong pos, gray=not in word)
function checkWord(word) {
    const feedback = Array(COLS).fill('gray'); // Default to gray
    const targetLetters = targetWord.split('');
    const wordLetters = word.split('');

    // First pass: Mark greens (correct position)
    for (let i = 0; i < COLS; i++) {
        if (wordLetters[i] === targetLetters[i]) {
            feedback[i] = 'green';
            targetLetters[i] = null; // Mark as used
        }
    }

    // Second pass: Mark yellows (wrong position, but in word)
    for (let i = 0; i < COLS; i++) {
        if (feedback[i] === 'gray' && targetLetters.includes(wordLetters[i])) {
            feedback[i] = 'yellow';
            targetLetters[targetLetters.indexOf(wordLetters[i])] = null; // Mark as used
        }
    }

    // Apply colors to tiles
    for (let i = 0; i < COLS; i++) {
        const tile = getTile(currentRow, i);
        tile.classList.add(feedback[i]); // Add CSS class (e.g., .green { background: green; })
    }

    // Check win/lose
    if (word === targetWord) {
        alert('You win!');
        currentRow = ROWS; // End game
    } else if (currentRow === ROWS - 1) {
        alert(`Game over! The word was ${targetWord}`);
    }
}

// Single keydown listener (row/col-based)
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Ignore input if game is over
    if (currentRow >= ROWS) return;

    // Letter input
    if (/^[a-zA-Z]$/.test(key)) {
        if (currentCol < COLS) {
            getTile(currentRow, currentCol).textContent = key.toUpperCase();
            currentCol++;
            updateActiveTile();
        }

    // Backspace
    } else if (key === 'Backspace') {
        if (currentCol > 0) {
            currentCol--;
            getTile(currentRow, currentCol).textContent = '';
            updateActiveTile();
        }

    // Enter: Submit if row is full
    } else if (key === 'Enter') {
        if (currentCol === COLS) {
            let word = '';
            for (let i = 0; i < COLS; i++) {
                word += getTile(currentRow, i).textContent || '';
            }
            if (isValidWord(word)) {
                checkWord(word);
                if (currentRow < ROWS - 1) {
                    currentRow++;
                    currentCol = 0;
                    updateActiveTile();
                }
            } else {
                alert('Not a valid word!');
            }
        } else {
            alert('Not enough letters!');
        }
    }
});