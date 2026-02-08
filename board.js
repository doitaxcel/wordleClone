const wordAPI = '/words.json'
const fallbackWords = ['APPLE', 'GRAPE', 'LEMON', 'PEACH', 'BERRY', 'PLUMB', 'ORANGE', 'MELON', 'BANANA'];

// this is for the tile grid
const board = document.getElementById('board');
for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile', 'w-8', 'h-8', 'border', 'border-black/90', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'uppercase', 'bg-white', 'xxs:w-10', 'xxs:h-10', 'xs:w-12', 'xs:h-12', 'sm:w-14','sm:h-14');
    board.appendChild(tile);
}
const gridText = document.getElementById('board');
const tiles = document.querySelectorAll('.tile');

async function fetchWord() {
    try {
        const response = await fetch(wordAPI);
        if (!response.ok){
            throw new Error(`HTTP Error!, Status: ${response.status}`);
        }

        const word = await response.json();

        if (Array.isArray(word) && word.length > 0){
            targetWord = word[Math.floor(Math.random() * word.length)].toUpperCase();
            console.log(targetWord)
        } else {
            throw new Error(`API Returned Invalid Data!`);
        }
    } catch (e){
        console.error(`Fail to Fetch a Word from the API, ${e}`);

        targetWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
        console.log(targetWord)
    }
}
fetchWord(); // function that gets a random word from the json
// TODO : words should come from an API

const ROWS = 6
const COLS = 5
let currentRow = 0;
let currentCol = 0;
let targetWord = ''; // Storage of Fetched Word

function getTile(row, col){
    return tiles[row * COLS + col]; 
}

function updateActiveTile(){ // highlights the active || current Tile
    tiles.forEach(t => t.classList.remove('active'));
    if (currentRow < ROWS && currentCol < COLS){
        getTile(currentRow, currentCol).classList.add('active');
    }
}
updateActiveTile();

// TODO: Proper use of dictorinary API

async function isValidWord(word){
    if (word.length !== COLS || !/^[A-Z]+$/.test(word)){
        return false;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);

        if (!response.ok){ 
            if (response.status === 404){
                console.log(`${word} is not a valid word!`)
                return false; 
            }
            else {
                console.error(`API Error: ${response.status} ${response.statusText}`);
                return true;
            }   
        } 

        const data = await response.json();
        return Array.isArray(data) && data.length > 0;
        
    } catch (e){
        console.error(`Network or API Error: ${e.message}`)
        return false;
    }
    
}

function wordChecker(word){ // used for color evaluation
    const feedback = Array(COLS).fill('gray') // 
    const targetLetters = targetWord.split('');
    const wordLetters = word.split('');

    for (let i = 0; i < COLS; i++){ // GREEN EVALUATION
        if (wordLetters[i] === targetLetters[i]){
            feedback[i] = 'green';
            targetLetters[i] = null;
        }
    }

    for (let i = 0; i < COLS; i++){
        if (targetLetters.includes(wordLetters[i]) && feedback[i] === "gray"){
            feedback[i] = "yellow";
            targetLetters[targetLetters.indexOf(wordLetters[i])] = null; 
        }
    }

    for (let i = 0; i < COLS; i++){
        const tile = getTile(currentRow, i)
        tile.classList.add(feedback[i])
    }

    if (word === targetWord){
        currentRow = ROWS // ends the game
        alert("You won!")
    }
    else if (currentRow === ROWS - 1){ // starts in 0 - 5, rows = 6 thats why rows -1
        alert(`Game Over! Word is ${targetWord}`)
    }
}

async function inputChecker(key){
    if (currentRow >= ROWS) return;

    if (/^[a-zA-Z]$/.test(key)){
        if (currentCol < COLS){
            getTile(currentRow, currentCol).textContent = key.toUpperCase();
            currentCol++;
            updateActiveTile();
        }
    }

    else if (key === "Backspace"){
        if (currentCol > 0){
            currentCol--;
            getTile(currentRow, currentCol).textContent = '';
            updateActiveTile();
        }
    }

    else if (key === "Enter"){
        if (currentCol === COLS){
            // const guess = Array.from({ length: COLS }, (_, i) => getTile(currentRow, i).textContent).join('');
            let guess = "";
            for (let i = 0; i < COLS; i++){
                guess += getTile(currentRow, i).textContent || '';
            }

            if (await isValidWord(guess)){
                wordChecker(guess)
                if (currentRow < ROWS - 1){
                    currentRow++;
                    currentCol = 0;
                    updateActiveTile()
                }
                // alert(`${guess} is valid`)
            }
            else {
                alert(`${guess} is not valid word!`)
                // clears the tiles in that row if the guess is not a valid word
                // TODO: else: Word is not valid, screen will shake and the tiles in the current row will turn to red?
            }
            
        }
        else {
            alert("Word most consist of 5 letters!")
        }
        // TODO: Proper Handling of tiles after "Enter"
    }
}

document.addEventListener('keydown', async (e) => {
   await inputChecker(e.key)
})

const keyboard = document.querySelector('.keyboard');

keyboard.addEventListener('click', async (e) =>{
    const keySpan = e.target.closest('span[data-key]');

    if (!keySpan) return;

    const key = keySpan.dataset.key;

    await inputChecker(key);
})





