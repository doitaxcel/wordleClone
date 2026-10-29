// Initialize from words.js if available, otherwise use fallback
let validWordList = typeof WORDS !== "undefined" && Array.isArray(WORDS) ? WORDS : [
  "APPLE", "GRAPE", "LEMON", "PEACH", "BERRY", "PLUMB", "ORANGE", "MELON", "WATER", "LIGHT"
];

let validWordSet = new Set(validWordList.map((w) => w.toUpperCase()));

function retryWindow() {
  const dialog = document.getElementById("retryDialogue");
  dialog.classList.remove("hidden");

  const confirmBtn = document.getElementById("confirmBtn");
  const declineBtn = document.getElementById("declineBtn");

  confirmBtn.onclick = () => {
    window.location.reload();
  };

  declineBtn.onclick = () => {
    dialog.classList.add("hidden");
  };
}

// this is for the tile grid
const board = document.getElementById("board");
for (let i = 0; i < 30; i++) {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  board.appendChild(tile);
}
const tiles = document.querySelectorAll(".tile");

const ROWS = 6;
const COLS = 5;
let currentRow = 0;
let currentCol = 0;
let targetWord = ""; // Storage of Fetched Word

function pickRandomWord() {
  targetWord =
    validWordList[Math.floor(Math.random() * validWordList.length)].toUpperCase();
  console.log("Target Word:", targetWord);
}
pickRandomWord();

function getTile(row, col) {
  return tiles[row * COLS + col];
}

function updateActiveTile() {
  // highlights the active || current Tile
  tiles.forEach((t) => t.classList.remove("active"));
  if (currentRow < ROWS && currentCol < COLS) {
    getTile(currentRow, currentCol).classList.add("active");
  }
}
updateActiveTile();

async function isValidWord(word) {
  if (word.length !== COLS || !/^[A-Z]+$/.test(word)) {
    return false;
  }

  const normalizedWord = word.toUpperCase();

  // 1. Fast check against our embedded word bank (Zero network latency, no CORS)
  if (validWordSet.has(normalizedWord)) {
    return true;
  }

  // 2. Query Datamuse API (fully supports CORS for web games and localhost)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const isValid =
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].word.toUpperCase() === normalizedWord;

      if (isValid) {
        // Cache the newly validated word in memory
        validWordSet.add(normalizedWord);
        return true;
      }
    }
  } catch (e) {
    console.warn(`External word check error: ${e.message}`);
  }

  return false;
}

function wordChecker(word) {
  // used for color evaluation
  const feedback = Array(COLS).fill("gray"); //
  const targetLetters = targetWord.split("");
  const wordLetters = word.split("");

  for (let i = 0; i < COLS; i++) {
    // GREEN EVALUATION
    if (wordLetters[i] === targetLetters[i]) {
      feedback[i] = "green";
      targetLetters[i] = null;
    }
  }

  for (let i = 0; i < COLS; i++) {
    if (targetLetters.includes(wordLetters[i]) && feedback[i] === "gray") {
      feedback[i] = "yellow";
      targetLetters[targetLetters.indexOf(wordLetters[i])] = null;
    }
  }

  for (let i = 0; i < COLS; i++) {
    const tile = getTile(currentRow, i);
    tile.classList.add(feedback[i]);

    // Also update virtual keyboard key colors (Green > Yellow > Gray)
    const letter = wordLetters[i];
    const keyEl = document.querySelector(`.key[data-key="${letter}"]`);
    if (keyEl) {
      if (feedback[i] === "green") {
        keyEl.classList.remove("yellow", "gray");
        keyEl.classList.add("green");
      } else if (feedback[i] === "yellow" && !keyEl.classList.contains("green")) {
        keyEl.classList.remove("gray");
        keyEl.classList.add("yellow");
      } else if (feedback[i] === "gray" && !keyEl.classList.contains("green") && !keyEl.classList.contains("yellow")) {
        keyEl.classList.add("gray");
      }
    }
  }

  if (word === targetWord) {
    currentRow = ROWS; // ends the game
    setTimeout(() => alert("Congratulations! You guessed the word!"), 300);
  } else if (currentRow === ROWS - 1) {
    // starts in 0 - 5, rows = 6 thats why rows -1
    setTimeout(() => alert(`Game Over! The word was: ${targetWord}`), 300);
  }
}

let isSubmitting = false;

async function inputChecker(key) {
  if (currentRow >= ROWS) return;

  if (/^[a-zA-Z]$/.test(key)) {
    if (currentCol < COLS) {
      const tile = getTile(currentRow, currentCol);
      tile.textContent = key.toUpperCase();
      tile.classList.add("has-letter");
      currentCol++;
      updateActiveTile();
    }
  } else if (key === "Backspace") {
    if (currentCol > 0) {
      currentCol--;
      const tile = getTile(currentRow, currentCol);
      tile.textContent = "";
      tile.classList.remove("has-letter");
      updateActiveTile();
    }
  } else if (key === "Enter") {
    if (currentCol === COLS) {
      if (isSubmitting) return; // prevents spam

      let guess = "";
      for (let i = 0; i < COLS; i++) {
        guess += getTile(currentRow, i).textContent || "";
      }

      isSubmitting = true; // locks spam

      if (await isValidWord(guess)) {
        wordChecker(guess);
        if (currentRow < ROWS - 1) {
          currentRow++;
          currentCol = 0;
          updateActiveTile();
        }
      } else {
        alert(`${guess} is not valid word!`);
        // TODO: else: Word is not valid, shake animation, border will be red line
      }

      isSubmitting = false; // unlocks
    } else {
      alert("Word must consist of 5 letters!");
    }
  }
}

document.addEventListener("keydown", async (e) => {
  await inputChecker(e.key);
});

const keyboard = document.querySelector(".keyboard");

keyboard.addEventListener("click", async (e) => {
  const keySpan = e.target.closest("span[data-key]");

  if (!keySpan) return;

  const key = keySpan.dataset.key;

  await inputChecker(key);
});
