const wordAPI = 'https://api.frontendexpert.io/api/fe/wordle-words'

// this is for the tile grid
const board = document.getElementById('board');
for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile', 'w-16', 'h-16', 'border', 'border-gray-400', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'uppercase', 'bg-white');
    board.appendChild(tile);
}
const gridText = document.getElementById('board');

const tiles = document.querySelectorAll('.tile');
let currentTile = 0;

document.addEventListener('keydown', (event) => {
    const key = event.key;

    // If key is a single letter, place it in the current tile
    if (/^[a-zA-Z]$/.test(key)) {
        if (currentTile < tiles.length) {
            tiles[currentTile].textContent = key.toUpperCase();
            currentTile++;
        }

    // Handle Backspace: remove previous letter
    } else if (key === 'Backspace') {
        if (currentTile > 0) {
            currentTile--;
            tiles[currentTile].textContent = '';
        }

    // Enter can be used later for submission
    } else if (key === 'Enter') {
        console.log('Enter pressed');
    }
});

const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;

function getTile(row, col) {
    return tiles[row * COLS + col];
}

function updateActiveTile() {
    tiles.forEach(t => t.classList.remove('active'));
    if (currentRow < ROWS && currentCol < COLS) {
        getTile(currentRow, currentCol).classList.add('active');
    }
}

updateActiveTile();

document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Ignore input if we've used all rows
    if (currentRow >= ROWS) return;

    // If key is a single letter, place it in the current row/col
    if (/^[a-zA-Z]$/.test(key)) {
        if (currentCol < COLS) {
            getTile(currentRow, currentCol).textContent = key.toUpperCase();
            currentCol++;
            updateActiveTile();
        }

    // Handle Backspace: remove previous letter in the same row
    } else if (key === 'Backspace') {
        if (currentCol > 0) {
            currentCol--;
            getTile(currentRow, currentCol).textContent = '';
            updateActiveTile();
        }

    // Enter: submit current row if full, then move to next row
    } else if (key === 'Enter') {
        if (currentCol === COLS) {
            let word = '';
            for (let i = 0; i < COLS; i++) {
                word += getTile(currentRow, i).textContent || '';
            }
            console.log('Submitted:', word);
            if (currentRow < ROWS - 1) {
                currentRow++;
                currentCol = 0;
                updateActiveTile();
            } else {
                console.log('All rows completed');
            }
        } else {
            console.log('Not enough letters to submit');
        }
    }
});





