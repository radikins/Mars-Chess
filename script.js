import { Chess } from './node_modules/chess.js/dist/esm/chess.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const pieceSymbols = {
  w: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  b: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
};

const game = new Chess();
let selectedSquare = null;
let legalMoves = [];

function getSquareColor(fileIndex, rankIndex) {
  return (fileIndex + rankIndex) % 2 === 0 ? 'light' : 'dark';
}

function getMoveTargets(square) {
  return legalMoves.filter((move) => move.from === square).map((move) => move.to);
}

function updateStatus() {
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'Black' : 'White';
    statusEl.textContent = `${winner} wins by checkmate`;
    return;
  }

  if (game.isStalemate()) {
    statusEl.textContent = 'Draw by stalemate';
    return;
  }

  if (game.isThreefoldRepetition()) {
    statusEl.textContent = 'Draw by repetition';
    return;
  }

  if (game.isInsufficientMaterial()) {
    statusEl.textContent = 'Draw by insufficient material';
    return;
  }

  if (game.isCheck()) {
    statusEl.textContent = `${game.turn() === 'w' ? 'White' : 'Black'} is in check`;
    return;
  }

  statusEl.textContent = `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
}

function renderBoard() {
  boardEl.innerHTML = '';

  for (let rank = 8; rank >= 1; rank -= 1) {
    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const squareName = `${files[fileIndex]}${rank}`;
      const piece = game.get(squareName);
      const square = document.createElement('button');
      square.type = 'button';
      square.className = `square ${getSquareColor(fileIndex, rank - 1)}`;
      square.dataset.square = squareName;
      square.setAttribute('aria-label', squareName);

      if (selectedSquare === squareName) {
        square.classList.add('selected');
      }

      const moveTargets = getMoveTargets(selectedSquare || '');
      const isLegalTarget = moveTargets.includes(squareName);
      if (isLegalTarget) {
        const targetMove = legalMoves.find((move) => move.from === selectedSquare && move.to === squareName);
        if (targetMove && targetMove.captured) {
          square.classList.add('capture');
        } else {
          square.classList.add('target');
        }
      }

      if (piece) {
        const pieceSymbol = pieceSymbols[piece.color][piece.type.toUpperCase()];
        const pieceEl = document.createElement('span');
        pieceEl.className = 'piece';
        pieceEl.textContent = pieceSymbol;
        square.appendChild(pieceEl);
      }

      if (squareName.endsWith('1') || squareName.endsWith('8')) {
        const coords = document.createElement('span');
        coords.className = 'coords';
        coords.textContent = squareName[0];
        square.appendChild(coords);
      }

      if (squareName.startsWith('a') && (rank === 1 || rank === 8)) {
        const fileText = document.createElement('span');
        fileText.className = 'coords';
        fileText.textContent = rank;
        square.appendChild(fileText);
      }

      square.addEventListener('click', () => handleSquareClick(squareName));
      boardEl.appendChild(square);
    }
  }
}

function getLegalMovesForSquare(square) {
  return game.moves({ square, verbose: true });
}

function handleSquareClick(squareName) {
  const piece = game.get(squareName);

  if (selectedSquare && legalMoves.some((move) => move.from === selectedSquare && move.to === squareName)) {
    const move = legalMoves.find((move) => move.from === selectedSquare && move.to === squareName);
    const result = game.move({
      from: move.from,
      to: move.to,
      promotion: 'q'
    });

    if (result) {
      selectedSquare = null;
      legalMoves = [];
      renderBoard();
      updateStatus();
      return;
    }
  }

  if (piece && piece.color === game.turn()) {
    selectedSquare = squareName;
    legalMoves = getLegalMovesForSquare(squareName);
  } else {
    selectedSquare = null;
    legalMoves = [];
  }

  renderBoard();
  updateStatus();
}

function resetGame() {
  game.reset();
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
  updateStatus();
}

function undoMove() {
  game.undo();
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
  updateStatus();
}

resetBtn.addEventListener('click', resetGame);
undoBtn.addEventListener('click', undoMove);

renderBoard();
updateStatus();
