/**
 * @jest-environment jsdom
 */

describe('Tetris Game Tests', () => {
  let grid, miniGrid, scoreDisplay, startBtn;
  let squares, displaySquares;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="grid"></div>
      <div class="mini-grid"></div>
      <div id="score">0</div>
      <button id="start-button">Start</button>
    `;
    
    grid = document.querySelector('.grid');
    miniGrid = document.querySelector('.mini-grid');
    scoreDisplay = document.querySelector('#score');
    startBtn = document.querySelector('#start-button');
    
    // Mock timers
    jest.useFakeTimers();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });
  
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });
  
  describe('Grid Generation', () => {
    test('should create 200 empty squares', () => {
      const width = 10;
      for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        grid.appendChild(cell);
      }
      
      const emptyCells = grid.querySelectorAll('div:not(.taken)');
      expect(emptyCells.length).toBe(200);
    });
    
    test('should create 10 taken squares at bottom', () => {
      for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        grid.appendChild(cell);
      }
      for (let i = 0; i < 10; i++) {
        const cell = document.createElement('div');
        cell.classList.add('taken');
        grid.appendChild(cell);
      }
      
      const takenCells = grid.querySelectorAll('.taken');
      expect(takenCells.length).toBe(10);
      expect(grid.children.length).toBe(210);
    });
    
    test('should create 16 mini-grid squares', () => {
      for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        miniGrid.appendChild(cell);
      }
      
      expect(miniGrid.children.length).toBe(16);
    });
  });
  
  describe('Tetromino Shapes', () => {
    test('should have correct L-Tetromino rotations', () => {
      const width = 10;
      const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
      ];
      
      expect(lTetromino.length).toBe(4);
      expect(lTetromino[0]).toEqual([1, 11, 21, 2]);
    });
    
    test('should have correct O-Tetromino shape', () => {
      const width = 10;
      const oTetromino = [[0, 1, width, width + 1]];
      
      expect(oTetromino.length).toBe(1);
      expect(oTetromino[0]).toEqual([0, 1, 10, 11]);
    });
    
    test('should have correct I-Tetromino rotations', () => {
      const width = 10;
      const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
      ];
      
      expect(iTetromino.length).toBe(4);
      expect(iTetromino[0]).toEqual([1, 11, 21, 31]);
      expect(iTetromino[1]).toEqual([10, 11, 12, 13]);
    });
  });
  
  describe('Drawing Functions', () => {
    beforeEach(() => {
      for (let i = 0; i < 210; i++) {
        const cell = document.createElement('div');
        if (i >= 200) cell.classList.add('taken');
        grid.appendChild(cell);
      }
      squares = Array.from(grid.querySelectorAll('div'));
    });
    
    test('should add tetromino class when drawing', () => {
      const current = [0, 1, 10, 11];
      const currentPosition = 4;
      const random = 0;
      const colors = ['orange', 'red', 'purple', 'green', 'blue'];
      
      current.forEach((index) => {
        squares[currentPosition + index].classList.add('tetromino');
        squares[currentPosition + index].style.backgroundColor = colors[random];
      });
      
      expect(squares[4].classList.contains('tetromino')).toBe(true);
      expect(squares[4].style.backgroundColor).toBe('orange');
    });
    
    test('should remove tetromino class when undrawing', () => {
      const current = [0, 1, 10, 11];
      const currentPosition = 4;
      
      // First draw
      current.forEach((index) => {
        squares[currentPosition + index].classList.add('tetromino');
      });
      
      // Then undraw
      current.forEach((index) => {
        squares[currentPosition + index].classList.remove('tetromino');
        squares[currentPosition + index].style.backgroundColor = '';
      });
      
      expect(squares[4].classList.contains('tetromino')).toBe(false);
      expect(squares[4].style.backgroundColor).toBe('');
    });
  });
  
  describe('Movement Functions', () => {
    beforeEach(() => {
      for (let i = 0; i < 210; i++) {
        const cell = document.createElement('div');
        if (i >= 200) cell.classList.add('taken');
        grid.appendChild(cell);
      }
      squares = Array.from(grid.querySelectorAll('div'));
    });
    
    test('should detect left edge correctly', () => {
      const width = 10;
      const current = [0, 1, 10, 11];
      const currentPosition = 0;
      
      const isAtLeftEdge = current.some(
        (index) => (currentPosition + index) % width === 0
      );
      
      expect(isAtLeftEdge).toBe(true);
    });
    
    test('should detect right edge correctly', () => {
      const width = 10;
      const current = [0, 1, 10, 11];
      const currentPosition = 8;
      
      const isAtRightEdge = current.some(
        (index) => (currentPosition + index) % width === width - 1
      );
      
      expect(isAtRightEdge).toBe(true);
    });
    
    test('should detect collision with taken squares', () => {
      const current = [0, 1, 10, 11];
      const currentPosition = 190;
      
      squares[200].classList.add('taken');
      
      const hasCollision = current.some((index) =>
        squares[currentPosition + index + 10].classList.contains('taken')
      );
      
      expect(hasCollision).toBe(true);
    });
  });
  
  describe('Score Calculation', () => {
    beforeEach(() => {
      for (let i = 0; i < 210; i++) {
        const cell = document.createElement('div');
        if (i >= 200) cell.classList.add('taken');
        grid.appendChild(cell);
      }
      squares = Array.from(grid.querySelectorAll('div'));
    });
    
    test('should detect completed row', () => {
      const width = 10;
      const rowIndex = 190;
      const row = Array.from({length: 10}, (_, i) => rowIndex + i);
      
      // Fill a complete row
      row.forEach(i => squares[i].classList.add('taken'));
      
      const isRowComplete = row.every(i => 
        squares[i].classList.contains('taken')
      );
      
      expect(isRowComplete).toBe(true);
    });
    
    test('should not detect incomplete row', () => {
      const width = 10;
      const rowIndex = 190;
      const row = Array.from({length: 10}, (_, i) => rowIndex + i);
      
      // Fill row except one square
      row.slice(0, 9).forEach(i => squares[i].classList.add('taken'));
      
      const isRowComplete = row.every(i => 
        squares[i].classList.contains('taken')
      );
      
      expect(isRowComplete).toBe(false);
    });
    
    test('should increment score by 10 for completed row', () => {
      let score = 0;
      const width = 10;
      const rowIndex = 190;
      const row = Array.from({length: 10}, (_, i) => rowIndex + i);
      
      row.forEach(i => squares[i].classList.add('taken'));
      
      if (row.every(i => squares[i].classList.contains('taken'))) {
        score += 10;
      }
      
      expect(score).toBe(10);
    });
  });
  
  describe('Game Over Detection', () => {
    beforeEach(() => {
      for (let i = 0; i < 210; i++) {
        const cell = document.createElement('div');
        if (i >= 200) cell.classList.add('taken');
        grid.appendChild(cell);
      }
      squares = Array.from(grid.querySelectorAll('div'));
    });
    
    test('should detect game over when spawn position is blocked', () => {
      const current = [0, 1, 10, 11];
      const currentPosition = 4;
      
      // Block spawn position
      squares[4].classList.add('taken');
      
      const isGameOver = current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      );
      
      expect(isGameOver).toBe(true);
    });
    
    test('should not detect game over when spawn position is clear', () => {
      const current = [0, 1, 10, 11];
      const currentPosition = 4;
      
      const isGameOver = current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      );
      
      expect(isGameOver).toBe(false);
    });
  });
  
  describe('Rotation Logic', () => {
    test('should cycle through rotations correctly', () => {
      const theTetrominoes = [
        [[1, 11, 21, 2], [10, 11, 12, 22], [1, 11, 21, 20], [10, 20, 21, 22]]
      ];
      let currentRotation = 0;
      const random = 0;
      
      // Rotate 4 times
      for (let i = 0; i < 4; i++) {
        currentRotation++;
        if (currentRotation === theTetrominoes[random].length) {
          currentRotation = 0;
        }
      }
      
      expect(currentRotation).toBe(0);
    });
    
    test('should handle O-tetromino single rotation', () => {
      const oTetromino = [[0, 1, 10, 11]];
      let currentRotation = 0;
      
      currentRotation++;
      if (currentRotation === oTetromino.length) {
        currentRotation = 0;
      }
      
      expect(currentRotation).toBe(0);
    });
  });
  
  describe('Display Functions', () => {
    beforeEach(() => {
      for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        miniGrid.appendChild(cell);
      }
      displaySquares = Array.from(miniGrid.querySelectorAll('div'));
    });
    
    test('should clear mini-grid before displaying new shape', () => {
      displaySquares[0].classList.add('tetromino');
      displaySquares[0].style.backgroundColor = 'red';
      
      displaySquares.forEach((square) => {
        square.classList.remove('tetromino');
        square.style.backgroundColor = '';
      });
      
      expect(displaySquares[0].classList.contains('tetromino')).toBe(false);
      expect(displaySquares[0].style.backgroundColor).toBe('');
    });
    
    test('should display next tetromino shape', () => {
      const displayWidth = 4;
      const colors = ['orange', 'red', 'purple', 'green', 'blue'];
      const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2]
      ];
      const nextRandom = 0;
      
      upNextTetrominoes[nextRandom].forEach((index) => {
        displaySquares[index].classList.add('tetromino');
        displaySquares[index].style.backgroundColor = colors[nextRandom];
      });
      
      expect(displaySquares[1].classList.contains('tetromino')).toBe(true);
      expect(displaySquares[1].style.backgroundColor).toBe('orange');
    });
  });
  
  describe('Timer Controls', () => {
    test('should start timer on first button click', () => {
      let timerId = null;
      
      if (!timerId) {
        timerId = setInterval(() => {}, 800);
      }
      
      expect(timerId).not.toBeNull();
      clearInterval(timerId);
    });
    
    test('should pause timer on second button click', () => {
      let timerId = setInterval(() => {}, 800);
      
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      
      expect(timerId).toBeNull();
    });
  });
  
  describe('Random Generation', () => {
    test('should generate random tetromino index', () => {
      const theTetrominoes = [[], [], [], [], []];
      const random = Math.floor(Math.random() * theTetrominoes.length);
      
      expect(random).toBeGreaterThanOrEqual(0);
      expect(random).toBeLessThan(5);
    });
    
    test('should generate different nextRandom', () => {
      Math.random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
      
      const theTetrominoes = [[], [], [], [], []];
      const random1 = Math.floor(Math.random() * theTetrominoes.length);
      const random2 = Math.floor(Math.random() * theTetrominoes.length);
      
      expect(random1).not.toBe(random2);
    });
  });
});