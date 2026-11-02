/* Game catalog. To add a game: drop its file in games/, add an entry here. */
const CATALOG = [
 {
  "id": "blocks",
  "name": "Blocks",
  "cat": "arcade",
  "emoji": "🧩",
  "color": "#6a4fd1",
  "tagline": "Stack falling pieces and clear lines.",
  "desc": "Rotate and drop falling blocks to complete rows. The pieces fall faster the higher your level climbs.",
  "controls": [
   [
    "Left / Right",
    "Move"
   ],
   [
    "Up / A",
    "Rotate"
   ],
   [
    "Down",
    "Soft drop"
   ],
   [
    "X",
    "Hard drop"
   ],
   [
    "Touch",
    "Drag, tap, swipe down"
   ]
  ],
  "file": "games/blocks.js",
  "fnName": "blocks",
  "kb": 5
 },
 {
  "id": "mines",
  "name": "Mines",
  "cat": "puzzle",
  "emoji": "💣",
  "color": "#4a5a8a",
  "tagline": "Clear the field without hitting a mine.",
  "desc": "Dig out every safe square using the numbers as clues, and flag the mines. Bigger boards and more mines on higher difficulties.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Dig / chord"
   ],
   [
    "X",
    "Flag"
   ],
   [
    "Y",
    "Dig / Flag mode"
   ],
   [
    "Touch",
    "Tap dig, hold flag"
   ]
  ],
  "file": "games/mines.js",
  "fnName": "mines",
  "kb": 5
 },
 {
  "id": "sudoku",
  "name": "Sudoku",
  "cat": "puzzle",
  "emoji": "🔢",
  "color": "#2a6f97",
  "tagline": "Fill the grid so every row, column and box has 1 to 9.",
  "desc": "Every puzzle has exactly one solution. Harder levels give you fewer starting numbers, and hints are there if you get stuck.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Next number"
   ],
   [
    "X",
    "Erase"
   ],
   [
    "Y",
    "Hint"
   ],
   [
    "Touch",
    "Tap cell, tap number"
   ]
  ],
  "file": "games/sudoku.js",
  "fnName": "sudoku",
  "kb": 5
 },
 {
  "id": "chess",
  "name": "Chess",
  "cat": "board",
  "emoji": "♟️",
  "color": "#5a4a8a",
  "tagline": "The classic, against a computer that thinks back.",
  "desc": "Full rules including castling, en passant and promotion. Three strengths of computer opponent, plus undo and hints.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Select / move"
   ],
   [
    "X",
    "Undo"
   ],
   [
    "Y",
    "Hint"
   ],
   [
    "Touch",
    "Tap piece, tap square"
   ]
  ],
  "file": "games/chess.js",
  "fnName": "chess",
  "kb": 19
 },
 {
  "id": "checkers",
  "name": "Checkers",
  "cat": "board",
  "emoji": "⚫",
  "color": "#8a3a3a",
  "tagline": "Jump your way across the board.",
  "desc": "Mandatory captures, multi-jumps and kings. Play black against a computer opponent that searches several moves ahead.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Select / move"
   ],
   [
    "X",
    "Deselect"
   ],
   [
    "Touch",
    "Tap piece, tap square"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/checkers.js",
  "fnName": "checkers",
  "kb": 9
 },
 {
  "id": "connect4",
  "name": "Connect 4",
  "cat": "board",
  "emoji": "🔴",
  "color": "#2b3a9a",
  "tagline": "Line up four before the computer does.",
  "desc": "Drop discs into the grid and connect four in a row. Easy plays loosely, Hard looks seven moves ahead.",
  "controls": [
   [
    "Left / Right",
    "Pick column"
   ],
   [
    "A / Down",
    "Drop disc"
   ],
   [
    "Touch",
    "Tap a column"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/connect4.js",
  "fnName": "connect4",
  "kb": 5
 },
 {
  "id": "tictactoe",
  "name": "Tic-Tac-Toe",
  "cat": "board",
  "emoji": "❌",
  "color": "#3a6a8a",
  "tagline": "Noughts and crosses, with a computer that learns nothing.",
  "desc": "A quick game against the computer. On Hard it never loses, so a draw is a good result.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Place mark"
   ],
   [
    "Touch",
    "Tap a square"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/tictactoe.js",
  "fnName": "tictactoe",
  "kb": 4
 },
 {
  "id": "mancala",
  "name": "Mancala",
  "cat": "board",
  "emoji": "🥜",
  "color": "#8a6a2e",
  "tagline": "Sow seeds, steal captures, take extra turns.",
  "desc": "Classic Kalah rules: pick a pit, sow around the board, capture opposite pits and chain extra turns.",
  "controls": [
   [
    "Left / Right",
    "Pick pit"
   ],
   [
    "A",
    "Sow seeds"
   ],
   [
    "Touch",
    "Tap a pit"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/mancala.js",
  "fnName": "mancala",
  "kb": 7
 },
 {
  "id": "solitaire",
  "name": "Solitaire",
  "cat": "board",
  "emoji": "🂡",
  "color": "#2a7a4a",
  "tagline": "Klondike with undo and auto-finish.",
  "desc": "Build the four foundations from ace to king. Easy draws one card at a time, Normal draws three, and Hard limits how often you can recycle.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Pick up / place / draw"
   ],
   [
    "Y",
    "Send to foundation"
   ],
   [
    "X",
    "Undo"
   ],
   [
    "Touch",
    "Tap card, tap target"
   ]
  ],
  "file": "games/solitaire.js",
  "fnName": "solitaire",
  "kb": 11
 },
 {
  "id": "snakesladders",
  "name": "Snakes & Ladders",
  "cat": "board",
  "emoji": "🎲",
  "color": "#b8683a",
  "tagline": "Roll, climb ladders, dodge snakes.",
  "desc": "A race to 100 against the computer. Easy slightly favours you with luckier dice, and Hard slightly favours the computer.",
  "controls": [
   [
    "A / Down",
    "Roll dice"
   ],
   [
    "Touch",
    "Tap Roll dice"
   ]
  ],
  "file": "games/snakesladders.js",
  "fnName": "snakesladders",
  "kb": 6
 },
 {
  "id": "memory",
  "name": "Memory",
  "cat": "puzzle",
  "emoji": "🃏",
  "color": "#b5527a",
  "tagline": "Flip cards and find the pairs.",
  "desc": "Match every pair in as few moves as you can. More cards and less peeking on higher difficulties.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Flip card"
   ],
   [
    "Touch",
    "Tap a card"
   ]
  ],
  "file": "games/memory.js",
  "fnName": "memory",
  "kb": 2
 },
 {
  "id": "2048",
  "name": "2048",
  "cat": "puzzle",
  "emoji": "🔟",
  "color": "#c27a3d",
  "tagline": "Slide and merge tiles up to 2048 and beyond.",
  "desc": "Swipe or use the D-pad to slide the whole board. Equal tiles merge into one, so plan your moves.",
  "controls": [
   [
    "D-pad",
    "Slide tiles"
   ],
   [
    "Left stick",
    "Slide tiles"
   ],
   [
    "Swipe",
    "Slide (touch)"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/2048.js",
  "fnName": "g2048",
  "kb": 2
 },
 {
  "id": "2248",
  "name": "Link 2248",
  "cat": "puzzle",
  "emoji": "🔗",
  "color": "#a83a8a",
  "tagline": "Link equal tiles into bigger ones.",
  "desc": "Draw a chain through touching tiles of the same value, or a tile that matches the running total, and merge them into a power of two.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "Hold A",
    "Start chain, then move"
   ],
   [
    "Release A",
    "Merge chain"
   ],
   [
    "Touch",
    "Drag across tiles"
   ]
  ],
  "file": "games/2248.js",
  "fnName": "g2248",
  "kb": 5
 },
 {
  "id": "tapmatch",
  "name": "Tap Match",
  "cat": "puzzle",
  "emoji": "🟦",
  "color": "#2a7ab8",
  "tagline": "Pop groups of matching colours.",
  "desc": "Tap any group of two or more touching blocks to clear it. Bigger groups score far more, and clearing the board earns a bonus.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Pop group"
   ],
   [
    "Touch",
    "Tap a group"
   ]
  ],
  "file": "games/tapmatch.js",
  "fnName": "tapmatch",
  "kb": 4
 },
 {
  "id": "flood",
  "name": "Flood Fill",
  "cat": "puzzle",
  "emoji": "🎨",
  "color": "#2f8f8f",
  "tagline": "Fill the whole board from one corner.",
  "desc": "Pick colours to grow your region until the board is a single colour, using as few moves as possible.",
  "controls": [
   [
    "Left / Right",
    "Pick colour"
   ],
   [
    "A",
    "Fill"
   ],
   [
    "Touch",
    "Tap a colour"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/flood.js",
  "fnName": "flood",
  "kb": 3
 },
 {
  "id": "numbermatch",
  "name": "Number Match",
  "cat": "puzzle",
  "emoji": "🔣",
  "color": "#5a5ab8",
  "tagline": "Pair numbers that match or add up to ten.",
  "desc": "Clear pairs that are equal or sum to 10, across rows, columns or diagonals. Add more numbers when you run out of moves.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Select number"
   ],
   [
    "X",
    "Add numbers"
   ],
   [
    "Y",
    "Hint"
   ],
   [
    "Touch",
    "Tap two numbers"
   ]
  ],
  "file": "games/numbermatch.js",
  "fnName": "numbermatch",
  "kb": 5
 },
 {
  "id": "sortnuts",
  "name": "Nuts & Bolts",
  "cat": "puzzle",
  "emoji": "🔩",
  "color": "#7a7a8a",
  "tagline": "Sort the colours into their own bolts.",
  "desc": "Move nuts between bolts until each bolt holds one colour. Every board is checked to be solvable.",
  "controls": [
   [
    "Left / Right",
    "Pick bolt"
   ],
   [
    "A",
    "Lift / drop"
   ],
   [
    "X",
    "Undo"
   ],
   [
    "Y",
    "Restart"
   ],
   [
    "Touch",
    "Tap a bolt"
   ]
  ],
  "file": "games/sortnuts.js",
  "fnName": "sortnuts",
  "kb": 6
 },
 {
  "id": "slidepuzzle",
  "name": "Slide Puzzle",
  "cat": "puzzle",
  "emoji": "🔳",
  "color": "#3a8a6a",
  "tagline": "Slide the tiles back into order.",
  "desc": "Put the numbers in order using the single gap. Bigger grids on harder levels.",
  "controls": [
   [
    "D-pad",
    "Slide a tile"
   ],
   [
    "Touch",
    "Tap a tile"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/slidepuzzle.js",
  "fnName": "slidepuzzle",
  "kb": 3
 },
 {
  "id": "wordle",
  "name": "Wordle",
  "cat": "word",
  "emoji": "🔤",
  "color": "#3a8a5a",
  "tagline": "Guess the hidden five-letter word.",
  "desc": "Six tries to find the word. Green is right, yellow is in the word but misplaced. Hard makes you reuse what you’ve found.",
  "controls": [
   [
    "Type",
    "Letters, Enter, Backspace"
   ],
   [
    "D-pad",
    "Move on keyboard"
   ],
   [
    "A",
    "Press key"
   ],
   [
    "X",
    "Delete"
   ],
   [
    "Y",
    "Submit guess"
   ],
   [
    "Touch",
    "Tap the keys"
   ]
  ],
  "file": "games/wordle.js",
  "fnName": "wordle",
  "kb": 5,
  "needs": [
   "data/words.js"
  ]
 },
 {
  "id": "hangman",
  "name": "Hangman",
  "cat": "word",
  "emoji": "🪢",
  "color": "#8a4a3a",
  "tagline": "Guess the word before the drawing is complete.",
  "desc": "Pick letters to uncover the word. Solve it to move straight to the next one, and see how long your streak lasts.",
  "controls": [
   [
    "Type",
    "Pick a letter"
   ],
   [
    "D-pad",
    "Move on keyboard"
   ],
   [
    "A",
    "Guess letter"
   ],
   [
    "Touch",
    "Tap a letter"
   ]
  ],
  "file": "games/hangman.js",
  "fnName": "hangman",
  "kb": 5,
  "needs": [
   "data/words.js"
  ]
 },
 {
  "id": "wordconnect",
  "name": "Word Connect",
  "cat": "word",
  "emoji": "🔠",
  "color": "#c2603d",
  "tagline": "Connect letters to spell hidden words.",
  "desc": "Drag across the ring to spell the words in the grid. Extra real words earn bonus points, and a hint reveals a letter.",
  "controls": [
   [
    "Left / Right",
    "Move around the circle"
   ],
   [
    "A",
    "Add / remove letter"
   ],
   [
    "X",
    "Submit word"
   ],
   [
    "Y",
    "Shuffle"
   ],
   [
    "Up",
    "Hint"
   ],
   [
    "Down",
    "Clear"
   ],
   [
    "Touch",
    "Drag across letters"
   ]
  ],
  "file": "games/wordconnect.js",
  "fnName": "wordconnect",
  "kb": 8,
  "needs": [
   "data/words.js"
  ]
 },
 {
  "id": "pattern",
  "name": "Pattern",
  "cat": "puzzle",
  "emoji": "🎵",
  "color": "#7a3fa8",
  "tagline": "Watch the pattern and repeat it.",
  "desc": "The sequence gets one step longer every round. How far can your memory go?",
  "controls": [
   [
    "D-pad",
    "Repeat the pattern"
   ],
   [
    "Touch",
    "Tap the pads"
   ]
  ],
  "file": "games/pattern.js",
  "fnName": "pattern",
  "kb": 2
 },
 {
  "id": "snake",
  "name": "Snake",
  "cat": "arcade",
  "emoji": "🐍",
  "color": "#1c8f63",
  "tagline": "Eat, grow, and don’t bite yourself.",
  "desc": "The classic. Hard speeds things up and adds rocks to steer around.",
  "controls": [
   [
    "D-pad",
    "Turn"
   ],
   [
    "Left stick",
    "Turn"
   ],
   [
    "Swipe",
    "Turn (touch)"
   ]
  ],
  "file": "games/snake.js",
  "fnName": "snake",
  "kb": 2
 },
 {
  "id": "breakout",
  "name": "Breakout",
  "cat": "arcade",
  "emoji": "🧱",
  "color": "#5a4fd1",
  "tagline": "Bounce the ball and break every brick.",
  "desc": "Move the paddle, angle the ball and clear the wall. Don’t run out of lives.",
  "controls": [
   [
    "D-pad",
    "Move paddle"
   ],
   [
    "Left stick",
    "Move paddle"
   ],
   [
    "A",
    "Launch ball"
   ],
   [
    "Drag",
    "Paddle (touch)"
   ],
   [
    "Power-ups",
    "Catch falling W, 3, S and heart capsules"
   ]
  ],
  "file": "games/breakout.js",
  "fnName": "breakout",
  "kb": 3
 },
 {
  "id": "flap",
  "name": "Flap",
  "cat": "arcade",
  "emoji": "🐤",
  "color": "#2a82b8",
  "tagline": "Tap to flap through the gaps.",
  "desc": "One button, endless pipes. Easy has wider gaps; Hard is a test of nerve.",
  "controls": [
   [
    "A",
    "Flap"
   ],
   [
    "Tap",
    "Flap (touch)"
   ]
  ],
  "file": "games/flap.js",
  "fnName": "flap",
  "kb": 1
 },
 {
  "id": "stack",
  "name": "Stack",
  "cat": "arcade",
  "emoji": "🏗️",
  "color": "#c2603d",
  "tagline": "Drop blocks and build the tallest tower.",
  "desc": "Time each drop to line the blocks up. Anything that overhangs gets sliced off, and perfect drops keep your width.",
  "controls": [
   [
    "A",
    "Drop block"
   ],
   [
    "Tap",
    "Drop (touch)"
   ]
  ],
  "file": "games/stack.js",
  "fnName": "stack",
  "kb": 2
 },
 {
  "id": "dash",
  "name": "Dash",
  "cat": "arcade",
  "emoji": "🏃",
  "color": "#2f8f8f",
  "tagline": "Run, jump and duck as far as you can.",
  "desc": "An endless runner with cacti to jump and birds to duck. The pace keeps climbing.",
  "controls": [
   [
    "A / Up",
    "Jump (hold = higher)"
   ],
   [
    "Down",
    "Duck"
   ],
   [
    "Touch",
    "Tap jump, hold low = duck"
   ]
  ],
  "file": "games/dash.js",
  "fnName": "dash",
  "kb": 3
 },
 {
  "id": "defense",
  "name": "Star Defense",
  "cat": "arcade",
  "emoji": "🚀",
  "color": "#3a3f9a",
  "tagline": "Defend your base from falling invaders.",
  "desc": "Fly your ship, auto-fire at each wave and keep your lives. Harder levels bring tougher waves.",
  "controls": [
   [
    "Stick / D-pad",
    "Move (auto-fire)"
   ],
   [
    "Touch",
    "Drag to move"
   ]
  ],
  "file": "games/defense.js",
  "fnName": "defense",
  "kb": 4
 },
 {
  "id": "ping",
  "name": "Ping",
  "cat": "arcade",
  "emoji": "🏓",
  "color": "#3d7a5a",
  "tagline": "Pong against a computer paddle.",
  "desc": "Keep the ball in play and out-rally the computer. Harder levels give it quicker reactions.",
  "controls": [
   [
    "Stick / D-pad",
    "Move paddle"
   ],
   [
    "Touch",
    "Drag to move"
   ]
  ],
  "file": "games/ping.js",
  "fnName": "ping",
  "kb": 3
 },
 {
  "id": "whack",
  "name": "Whack",
  "cat": "arcade",
  "emoji": "🔨",
  "color": "#8a5a2e",
  "tagline": "Whack the moles, skip the bombs.",
  "desc": "Tap moles as they pop up for points. Hit a bomb and you lose time.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Whack"
   ],
   [
    "Touch",
    "Tap moles, skip bombs"
   ]
  ],
  "file": "games/whack.js",
  "fnName": "whack",
  "kb": 4
 },
 {
  "id": "pool",
  "name": "Pool",
  "cat": "sports",
  "emoji": "🎱",
  "color": "#1f6f4a",
  "tagline": "8-ball against the computer.",
  "desc": "Pocket your group, then the 8 ball. Fouls give your opponent the cue ball in hand. Pull back to shoot, or aim and charge with the controller.",
  "controls": [
   [
    "Left / Right",
    "Aim"
   ],
   [
    "Hold A",
    "Charge power"
   ],
   [
    "Release A",
    "Shoot"
   ],
   [
    "X",
    "Fine aim"
   ],
   [
    "Pull back",
    "Aim + shoot (touch)"
   ],
   [
    "Drag",
    "Place cue ball (touch)"
   ]
  ],
  "file": "games/pool.js",
  "fnName": "pool",
  "kb": 18
 },
 {
  "id": "hoops",
  "name": "Hoops",
  "cat": "sports",
  "emoji": "🏀",
  "color": "#d2692b",
  "tagline": "Shoot baskets before the clock runs out.",
  "desc": "Aim the angle, charge the power and sink as many shots as you can. The rim gets tighter on harder levels.",
  "controls": [
   [
    "Up / Down",
    "Adjust angle"
   ],
   [
    "Hold A",
    "Charge power"
   ],
   [
    "Release A",
    "Shoot"
   ],
   [
    "Drag back",
    "Aim + shoot (touch)"
   ]
  ],
  "file": "games/hoops.js",
  "fnName": "hoops",
  "kb": 5
 },
 {
  "id": "golf",
  "name": "Mini Golf",
  "cat": "sports",
  "emoji": "⛳",
  "color": "#2f8f5b",
  "tagline": "Nine holes of tricky mini golf.",
  "desc": "Aim, charge and putt through a set of holes, each with its own par and layout of walls.",
  "controls": [
   [
    "Left / Right",
    "Aim"
   ],
   [
    "Hold A",
    "Charge power"
   ],
   [
    "Release A",
    "Putt"
   ],
   [
    "Drag back",
    "Aim + putt (touch)"
   ]
  ],
  "file": "games/golf.js",
  "fnName": "golf",
  "kb": 6
 },
 {
  "id": "darts",
  "name": "Darts",
  "cat": "sports",
  "emoji": "🎯",
  "color": "#a8324a",
  "tagline": "Throw darts at the board.",
  "desc": "Move the aim, fight the sway and go for the bullseye.",
  "controls": [
   [
    "Stick / D-pad",
    "Move aim"
   ],
   [
    "A",
    "Throw"
   ],
   [
    "Drag",
    "Move aim (touch)"
   ],
   [
    "Throw btn",
    "Throw (touch)"
   ]
  ],
  "file": "games/darts.js",
  "fnName": "darts",
  "kb": 3
 },
 {
  "id": "archery",
  "name": "Archery",
  "cat": "sports",
  "emoji": "🏹",
  "color": "#7a5c2e",
  "tagline": "Hit the target from a distance.",
  "desc": "Steady your aim against the sway and the wind, then loose the arrow.",
  "controls": [
   [
    "Stick / D-pad",
    "Move aim"
   ],
   [
    "A",
    "Fire"
   ],
   [
    "Drag",
    "Move aim (touch)"
   ],
   [
    "Fire btn",
    "Fire (touch)"
   ]
  ],
  "file": "games/archery.js",
  "fnName": "archery",
  "kb": 3
 },
 {
  "id": "spaceRocks",
  "name": "Space Rocks",
  "cat": "arcade",
  "emoji": "☄️",
  "color": "#2f3b8f",
  "tagline": "Blast drifting rocks before they hit you.",
  "desc": "Fly your ship through a field of drifting rocks and shoot them into smaller pieces. Clear a wave and a bigger one arrives.",
  "controls": [
   [
    "Left / Right",
    "Turn"
   ],
   [
    "Up",
    "Thrust"
   ],
   [
    "A",
    "Fire"
   ],
   [
    "Touch",
    "Hold to fly toward your finger, auto-fires"
   ],
   [
    "Power-ups",
    "Pick up S, R, 3 and heart orbs"
   ]
  ],
  "file": "games/spaceRocks.js",
  "fnName": "spaceRocks",
  "kb": 5
 },
 {
  "id": "roadHop",
  "name": "Road Hop",
  "cat": "arcade",
  "emoji": "🐥",
  "color": "#2e7d4f",
  "tagline": "Hop across busy roads and keep going.",
  "desc": "Dodge the cars, hop around trees and see how far you can get. The screen keeps creeping forward, so you cannot stop.",
  "controls": [
   [
    "D-pad",
    "Hop"
   ],
   [
    "A",
    "Hop forward"
   ],
   [
    "Touch",
    "Swipe to hop, tap for forward"
   ]
  ],
  "file": "games/roadHop.js",
  "fnName": "roadHop",
  "kb": 4
 },
 {
  "id": "fruitCatch",
  "name": "Fruit Catch",
  "cat": "arcade",
  "emoji": "🧺",
  "color": "#b5651d",
  "tagline": "Catch the fruit and dodge the bombs.",
  "desc": "Slide your basket under falling fruit. Missing fruit or catching a bomb costs a heart, and a streak of catches scores more.",
  "controls": [
   [
    "Left / Right",
    "Move basket"
   ],
   [
    "Touch",
    "Drag to move"
   ],
   [
    "Power-ups",
    "Catch star, snowflake and heart fruit"
   ]
  ],
  "file": "games/fruitCatch.js",
  "fnName": "fruitCatch",
  "kb": 3
 },
 {
  "id": "lightsOut",
  "name": "Lights Out",
  "cat": "puzzle",
  "emoji": "💡",
  "color": "#8a6d1f",
  "tagline": "Turn every light off, as many times as you can.",
  "desc": "Flipping a light also flips the four around it. Solve puzzles against the clock; fewer moves earn a bonus.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Flip light"
   ],
   [
    "Touch",
    "Tap a light"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/lightsOut.js",
  "fnName": "lightsOut",
  "kb": 2
 },
 {
  "id": "skyHop",
  "name": "Sky Hop",
  "cat": "arcade",
  "emoji": "🪐",
  "color": "#3a6ea5",
  "tagline": "Bounce up from platform to platform.",
  "desc": "You jump on your own. Steer left and right to land on platforms and climb as high as you can. Orange platforms slide.",
  "controls": [
   [
    "Left / Right",
    "Steer"
   ],
   [
    "Touch",
    "Drag to steer"
   ],
   [
    "Power-ups",
    "Springs and propeller hats boost you"
   ]
  ],
  "file": "games/skyHop.js",
  "fnName": "skyHop",
  "kb": 3
 },
 {
  "id": "laneRacer",
  "name": "Lane Racer",
  "cat": "arcade",
  "emoji": "🏎️",
  "color": "#a83246",
  "tagline": "Weave through traffic and grab coins.",
  "desc": "Race down a four-lane road. Traffic gets faster the longer you last. Coins add to your score.",
  "controls": [
   [
    "Left / Right",
    "Steer"
   ],
   [
    "Touch",
    "Drag to steer"
   ],
   [
    "Power-ups",
    "Collect S, M and clock power-ups"
   ]
  ],
  "file": "games/laneRacer.js",
  "fnName": "laneRacer",
  "kb": 3
 },
 {
  "id": "reversi",
  "name": "Reversi",
  "cat": "board",
  "emoji": "⚫",
  "color": "#1f6f4a",
  "tagline": "Flip the board to your colour against the computer.",
  "desc": "Place a disc so it traps a line of opposing discs and flips them. Whoever has more discs at the end wins.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Place disc"
   ],
   [
    "Touch",
    "Tap a square"
   ],
   [
    "Select / Z",
    "Undo"
   ]
  ],
  "file": "games/reversi.js",
  "fnName": "reversi",
  "kb": 5
 },
 {
  "id": "fruitSlice",
  "name": "Fruit Slice",
  "cat": "arcade",
  "emoji": "🍉",
  "color": "#c0392b",
  "tagline": "Slice flying fruit. Never slice a bomb.",
  "desc": "Swipe through fruit as it flies up to slice it. Chain slices for bonus points. Let three fruits fall and the round ends.",
  "controls": [
   [
    "Stick",
    "Move blade"
   ],
   [
    "Hold A",
    "Slice"
   ],
   [
    "Touch",
    "Swipe"
   ]
  ],
  "file": "games/fruitSlice.js",
  "fnName": "fruitSlice",
  "kb": 5
 },
 {
  "id": "balloons",
  "name": "Balloon Pop",
  "cat": "arcade",
  "emoji": "🎈",
  "color": "#7a4fb5",
  "tagline": "Pop the balloons before they escape.",
  "desc": "Balloons float up from the bottom. Pop them for points, gold ones are worth more, and skip the spiky grey ones.",
  "controls": [
   [
    "Stick",
    "Move cursor"
   ],
   [
    "A",
    "Pop"
   ],
   [
    "Touch",
    "Tap balloons"
   ],
   [
    "Power-ups",
    "Special balloons: freeze, burst, heart"
   ]
  ],
  "file": "games/balloons.js",
  "fnName": "balloons",
  "kb": 4
 },
 {
  "id": "pegJump",
  "name": "Peg Jump",
  "cat": "puzzle",
  "emoji": "📍",
  "color": "#7a5a3a",
  "tagline": "Jump pegs until only one is left.",
  "desc": "Jump a peg over a neighbour into an empty hole to remove the one you jumped. Clear the board down to a single peg.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Pick peg / jump"
   ],
   [
    "X",
    "Undo (not on Hard)"
   ],
   [
    "Touch",
    "Tap peg, tap hole"
   ]
  ],
  "file": "games/pegJump.js",
  "fnName": "pegJump",
  "kb": 3
 },
 {
  "id": "gemSwap",
  "name": "Gem Swap",
  "cat": "puzzle",
  "emoji": "💎",
  "color": "#6a3fa0",
  "tagline": "Swap neighbouring gems to match three or more.",
  "desc": "Swap two neighbouring gems to line up three or more of a colour. Matches clear, new gems drop in, and chains score big. You have a limited number of moves.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Pick gem, then press a direction to swap"
   ],
   [
    "Touch",
    "Tap two gems or swipe"
   ]
  ],
  "file": "games/gemSwap.js",
  "fnName": "gemSwap",
  "kb": 6
 },
 {
  "id": "mazeHeist",
  "name": "Maze Heist",
  "cat": "arcade",
  "emoji": "🕵️",
  "color": "#2a4a6a",
  "tagline": "Grab every gem and slip past the guards.",
  "desc": "Sneak through a maze, collect all the gems and avoid the guards. Power cells let you stun them for a short time.",
  "controls": [
   [
    "D-pad",
    "Move"
   ],
   [
    "Touch",
    "Swipe to move"
   ]
  ],
  "file": "games/mazeHeist.js",
  "fnName": "mazeHeist",
  "kb": 6
 },
 {
  "id": "bubbleShot",
  "name": "Bubble Shot",
  "cat": "puzzle",
  "emoji": "🫧",
  "color": "#2a7fb0",
  "tagline": "Aim and pop clusters of matching bubbles.",
  "desc": "Shoot bubbles to join three or more of a colour. Pop them and anything hanging below falls. The ceiling keeps dropping.",
  "controls": [
   [
    "Left / Right",
    "Aim"
   ],
   [
    "A",
    "Shoot"
   ],
   [
    "Touch",
    "Drag to aim, release to shoot"
   ]
  ],
  "file": "games/bubbleShot.js",
  "fnName": "bubbleShot",
  "kb": 7
 },
 {
  "id": "blackjack",
  "name": "Blackjack",
  "cat": "board",
  "emoji": "🃏",
  "color": "#1f6f4a",
  "tagline": "Beat the dealer over 20 hands.",
  "desc": "Get closer to 21 than the dealer without going over. Place your bet, then hit, stand or double down. Your score is your bank at the end.",
  "controls": [
   [
    "Left / Right",
    "Change bet"
   ],
   [
    "A",
    "Deal / Hit"
   ],
   [
    "X",
    "Stand"
   ],
   [
    "Y",
    "Double down"
   ],
   [
    "Touch",
    "Tap the buttons"
   ]
  ],
  "file": "games/blackjack.js",
  "fnName": "blackjack",
  "kb": 5
 },
 {
  "id": "airHockey",
  "name": "Air Hockey",
  "cat": "sports",
  "emoji": "🏒",
  "color": "#2a5a9a",
  "tagline": "First to seven beats the computer.",
  "desc": "Slide your mallet to hit the puck into the goal at the far end. Defend your own goal.",
  "controls": [
   [
    "Stick / D-pad",
    "Move mallet"
   ],
   [
    "Touch",
    "Drag to move"
   ]
  ],
  "file": "games/airHockey.js",
  "fnName": "airHockey",
  "kb": 5
 },
 {
  "id": "dotsBoxes",
  "name": "Dots and Boxes",
  "cat": "board",
  "emoji": "🔲",
  "color": "#7a4a2a",
  "tagline": "Close the most boxes against the computer.",
  "desc": "Take turns drawing a line between dots. Finish the fourth side of a box to claim it and go again.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Draw line"
   ],
   [
    "Touch",
    "Tap a line"
   ]
  ],
  "file": "games/dotsBoxes.js",
  "fnName": "dotsBoxes",
  "kb": 6
 },
 {
  "id": "mastermind",
  "name": "Code Lock",
  "cat": "puzzle",
  "emoji": "🔐",
  "color": "#6a5a2a",
  "tagline": "Crack the secret colour code.",
  "desc": "Guess the hidden row of colours. After each guess you learn how many are right and how many are in the wrong place.",
  "controls": [
   [
    "D-pad",
    "Move / change colour"
   ],
   [
    "A",
    "Next peg"
   ],
   [
    "X",
    "Submit guess"
   ],
   [
    "Touch",
    "Tap pegs, tap Submit"
   ]
  ],
  "file": "games/mastermind.js",
  "fnName": "mastermind",
  "kb": 4
 },
 {
  "id": "pigDice",
  "name": "Pig Dice",
  "cat": "board",
  "emoji": "🎲",
  "color": "#a0502a",
  "tagline": "Roll your luck, but bank it before a one.",
  "desc": "Roll as many times as you dare to build a turn total. Roll a one and you lose it. First to 100 wins.",
  "controls": [
   [
    "A",
    "Roll"
   ],
   [
    "X",
    "Hold (bank points)"
   ],
   [
    "Touch",
    "Tap the buttons"
   ]
  ],
  "file": "games/pigDice.js",
  "fnName": "pigDice",
  "kb": 3
 },
 {
  "id": "cannonShot",
  "name": "Cannon Shot",
  "cat": "arcade",
  "emoji": "💥",
  "color": "#4a6a3a",
  "tagline": "Fire over the hills and hit the target.",
  "desc": "Set your angle and power, allow for the wind and hit the red target. Each target gets a new landscape and stronger wind.",
  "controls": [
   [
    "Up / Down",
    "Angle"
   ],
   [
    "Left / Right",
    "Power"
   ],
   [
    "Hold A",
    "Charge, release to fire"
   ],
   [
    "Touch",
    "Drag back and release"
   ]
  ],
  "file": "games/cannonShot.js",
  "fnName": "cannonShot",
  "kb": 5
 },
 {
  "id": "beatTap",
  "name": "Beat Tap",
  "cat": "arcade",
  "emoji": "🎵",
  "color": "#a03a6a",
  "tagline": "Tap the notes as they hit the circles.",
  "desc": "Notes fall down four lanes. Tap the matching lane when a note reaches its circle. Perfect timing scores more and builds your streak.",
  "controls": [
   [
    "D-pad",
    "Lanes (left, up, down, right)"
   ],
   [
    "A / X / Y",
    "Lanes 2, 1, 4"
   ],
   [
    "Touch",
    "Tap a lane"
   ]
  ],
  "file": "games/beatTap.js",
  "fnName": "beatTap",
  "kb": 4
 },
 {
  "id": "orbitDash",
  "name": "Orbit Dash",
  "cat": "arcade",
  "emoji": "🌀",
  "color": "#3a3a8a",
  "tagline": "Hop between rings and dodge the red blocks.",
  "desc": "You circle the centre automatically. Hop to a different ring to dodge blocks and grab coins. It gets faster.",
  "controls": [
   [
    "A / Up / Right",
    "Hop outward"
   ],
   [
    "Down / Left",
    "Hop inward"
   ],
   [
    "Touch",
    "Tap to hop"
   ]
  ],
  "file": "games/orbitDash.js",
  "fnName": "orbitDash",
  "kb": 4
 },
 {
  "id": "nonogram",
  "name": "Nonogram",
  "cat": "puzzle",
  "emoji": "🧩",
  "color": "#3a6a7a",
  "tagline": "Fill the grid using the number clues.",
  "desc": "The numbers show how many filled squares are in a row or column. Work out the picture. Solve three puzzles.",
  "controls": [
   [
    "D-pad",
    "Move cursor"
   ],
   [
    "A",
    "Fill"
   ],
   [
    "X",
    "Mark empty"
   ],
   [
    "Select",
    "Undo"
   ],
   [
    "Touch",
    "Tap squares, switch Fill / Mark"
   ]
  ],
  "file": "games/nonogram.js",
  "fnName": "nonogram",
  "kb": 4
 },
 {
  "id": "sokoban",
  "name": "Crate Push",
  "cat": "puzzle",
  "emoji": "📦",
  "color": "#8a5a2a",
  "tagline": "Push every crate onto a goal.",
  "desc": "Push crates onto the yellow dots. You can push but not pull, so plan ahead. Undo any move.",
  "controls": [
   [
    "D-pad",
    "Move"
   ],
   [
    "A",
    "Restart level"
   ],
   [
    "Select / Z",
    "Undo"
   ],
   [
    "Touch",
    "Swipe to move"
   ]
  ],
  "file": "games/sokoban.js",
  "fnName": "sokoban",
  "kb": 5
 },
 {
  "id": "doughEmpire",
  "name": "Dough Empire",
  "cat": "arcade",
  "emoji": "🍪",
  "color": "#8a5a2a",
  "tagline": "Bake, upgrade and ascend across five worlds.",
  "desc": "An idle cookie clicker with depth. Tap the cookie, buy buildings, unlock over 270 upgrades, open new worlds that boost each other, catch golden cookies and ascend for permanent bonuses. Your progress saves and keeps earning while you are away.",
  "controls": [
   [
    "A",
    "Bake (and grab golden cookies)"
   ],
   [
    "Left / Right",
    "Switch tab"
   ],
   [
    "Up / Down",
    "Choose item"
   ],
   [
    "X",
    "Buy selected item"
   ],
   [
    "Y",
    "Go to next world"
   ],
   [
    "Touch",
    "Tap the cookie, tap items to buy, drag to scroll"
   ]
  ],
  "file": "games/doughEmpire.js",
  "fnName": "doughEmpire",
  "kb": 18
 },
 {
  "id": "deepRoots",
  "name": "Deep Roots",
  "cat": "arcade",
  "emoji": "🌳",
  "color": "#2f7a4a",
  "tagline": "Grow a 3D tree up, dig its roots down, then bloom.",
  "desc": "An incremental tree you can spin around in 3D. Tap to grow sap, buy leaves, branches and a taller trunk, then dig the roots through nine soil layers from topsoil to the void. Bloom for seeds and permanent bonuses. Progress saves and keeps growing while you are away.",
  "controls": [
   [
    "A",
    "Grow (tap)"
   ],
   [
    "Left / Right",
    "Switch tab"
   ],
   [
    "Up / Down",
    "Choose item"
   ],
   [
    "X",
    "Buy selected item"
   ],
   [
    "Y",
    "Change buy amount"
   ],
   [
    "Touch",
    "Tap the tree to grow, drag it to spin, tap items to buy"
   ]
  ],
  "file": "games/deepRoots.js",
  "fnName": "deepRoots",
  "kb": 16
 },
 {
  "id": "pitDescent",
  "name": "Pit Descent",
  "cat": "arcade",
  "emoji": "🕳️",
  "color": "#5a3b24",
  "tagline": "Buy steps, descend a 3D pit, dig fossils and beat bosses.",
  "desc": "Look down a real 3D shaft as you buy steps and descend through nine layers. Dig up fossils and rare shinies, beat the boss waiting at the end of each layer, build three upgrade trees, then rebirth to dive deeper. Progress saves and keeps earning while you are away.",
  "controls": [
   [
    "A",
    "Stomp and dig"
   ],
   [
    "Left / Right",
    "Switch tab"
   ],
   [
    "Up / Down",
    "Choose item"
   ],
   [
    "X",
    "Buy selected item"
   ],
   [
    "Y",
    "Change buy amount"
   ],
   [
    "Touch",
    "Tap the pit to stomp and dig, drag to look around, tap items to buy"
   ]
  ],
  "file": "games/pitDescent.js",
  "fnName": "pitDescent",
  "kb": 19
 }
];
const FEATURED = ["fruitSlice", "pool", "spaceRocks", "chess", "wordconnect", "roadHop"];
const STARTER = ["blocks", "snake", "2048", "tictactoe", "memory", "wordle", "flap", "connect4"];
const SHARED_KB = {"data/words.js": 326};
