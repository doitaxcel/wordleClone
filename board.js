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

document.addEventListener("keydown", event => {{
    const key = event.key;

    if(/^[a-zA-Z]$/.test(key)){
        if(currentTile < tiles.length){
            tiles[currentTile].textContent = key.toUpperCase();
            currentTile++;
        }
    }
    else if (key === "backspace"){
        if(currentTile > 0){
            currentTile--;
            tiles[currentTile].textContent = "";
        }
    }
    else if (key === "enter"){
        console.log("Enter is Pressed");
    }
}}
);
