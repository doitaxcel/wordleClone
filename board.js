const wordAPI = 'https://api.frontendexpert.io/api/fe/wordle-words'

// this is for the tile grid
const board = document.getElementById('board');
for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile', 'w-16', 'h-16', 'border', 'border-gray-400', 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold', 'uppercase', 'bg-white');
    board.appendChild(tile);
}
