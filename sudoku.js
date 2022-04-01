////////////////////
//  BEGIN sudoku  //
////////////////////

var sudoku = {};

sudoku.start = function (difficulty)
{
    // 9x9 sudoku board
    this.board = new Array(9);
    this.solution = [];

    // list of all non-given coordinates
    this.coordinates = [];
    this.emptySpaces = difficulty * 8 + 32;

    // fill board with 0s
    for (let row = 0; row < 9; ++row)
    {
        this.board[row] = new Array(9);

        for (let col = 0; col < 9; ++col)
            this.board[row][col] = 0;
    }

    // generate random diagonal submatrices
    for (let box = 0; box < 7; box += 3)
    {
        for (let row = box; row < box + 3; ++row)
        {
            for (let col = box; col < box + 3; ++col)
            {
                let x;
                do
                {
                    x = Math.floor(Math.random() * 9) + 1;
                }
                while (!this.isValid(row, col, x));
                this.board[row][col] = x;
            }
        }
    }

    // generate the rest of the grid
    this.solve();

    // save the solution
    this.solution = JSON.parse(JSON.stringify(this.board));

    // remove elements
    for (let i = 0; i < this.emptySpaces; ++i)
    {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (this.board[row][col] === 0)
            --i;
        else
        {
            this.coordinates.push([row, col]);
            this.board[row][col] = 0;
            const userCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            userCell.style.color = "#FF6961";
        }
    }

    this.updateHTML();
}; // start()

sudoku.updateHTML = function ()
{
    const boxes = document.getElementsByClassName("subgrid");

    for (let box = 0; box < 9; ++box)
    {
        const row = 3 * Math.floor(box / 3);
        const col = box % 3 * 3;
        for (let cell = 0; cell < 9; ++cell)
        {
            const cells = boxes[box].getElementsByClassName("cell");
            const n = this.board[row + Math.floor(cell / 3)][col + cell % 3];
            
            if (n > 0)
                cells[cell].innerHTML = n;
        }
    }
}; // updateHTML

// finds solution and returns true if successful
sudoku.solve = function () 
{
    for (let row = 0; row < 9; ++row) 
    {
        for (let col = 0; col < 9; ++col) 
        {
            // find empty space
            if (this.board[row][col] === 0)
            {
                // test all values from 1 to 9
                for (let n = 1; n < 10; ++n)
                {
                    if (this.isValid(row, col, n))
                    {
                        this.board[row][col] = n;

                        if (this.solve())
                            return true;
                        else
                            this.board[row][col] = 0;
                    } // if (valid)
                } // for (n)
                return false;
            } // if (empty)
        } // for (col)
    } // for (row)
    return true;
}; // solve()


sudoku.isValid = function (row, col, n)
{
    if (n === 0)
        return true;
    
    // check rows
    for (let i = 0; i < 9; ++i)
    {
        if (this.board[row][i] === n)
        {
            if (selectedCell)
            {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
                selectedCell.flashRed(cell);
            }

            return false;
        }
    }

    // check columns
    for (let i = 0; i < 9; ++i)
    {
        if (this.board[i][col] === n)
        {
            if (selectedCell)
            {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
                selectedCell.flashRed(cell);
            }

            return false;
        }
    }

    // check boxes
    for (let boxRow = 3 * Math.floor(row / 3), r = boxRow; r < boxRow + 3; ++r)
    {
        for (let boxCol = 3 * Math.floor(col / 3), c = boxCol; c < boxCol + 3; ++c)
        {
            if (this.board[r][c] === n)
            {
                if (selectedCell)
                {
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    selectedCell.flashRed(cell);
                }

                return false;
            }
        }
    }

    //passes all the tests
    return true;
}; // isValid()

sudoku.isGiven = function (row, col)
{
    for (const pair of this.coordinates)
    {
        if (pair[0] === row && pair[1] === col)
            return false;
    }

    return true;
}; // isGiven()

sudoku.setValue = function (row, col, n)
{
    if (this.board[row][col] === n || !this.isValid(row, col, n))
        return false;

    if (this.board[row][col] === 0 && n > 0)
        --this.emptySpaces;
    else if (this.board[row][col] > 0 && n === 0)
        ++this.emptySpaces;

    this.board[row][col] = n;

    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

    if (n === 0)
        cell.innerHTML = "";
    else
        cell.innerHTML = n;

    return true;
};

sudoku.checkWin = function ()
{
    return this.emptySpaces === 0;
};

////////////////////
//   END sudoku   //
////////////////////

var difficulty = window.location.href.charAt(window.location.href.length-1);

if (isNaN(difficulty))
    sudoku.start(1);
else
    sudoku.start(Number(difficulty));

//////////////////////////
//  BEGIN selectedCell  //
//////////////////////////

var selectedCell = {};

selectedCell.cell = {};
selectedCell.row = -1;
selectedCell.col = -1;

selectedCell.select = function (selected)
{
    if (this.row !== -1)
        this.cell.style.backgroundColor = "#121212";

    const cellRow = Number(selected.dataset.row);
    const cellCol = Number(selected.dataset.col);

    // cell was clicked a second time
    if (this.row === cellRow && this.col === cellCol)
    {
        this.cell = {};
        this.row = -1;
        this.col = -1;
    }
    // cell is modifiable by the user
    else if (!sudoku.isGiven(cellRow, cellCol))
    {
        this.row = cellRow;
        this.col = cellCol;
        this.cell = selected;
        this.cell.style.backgroundColor = "#616161";
    }
};

selectedCell.deselect = function ()
{
    this.cell.style.backgroundColor = "#121212";
    this.cell = {};
    this.row = -1;
    this.col = -1;
}

selectedCell.flashInID = 0;
selectedCell.flashOutID = 0;
selectedCell.flashingCells = [];

selectedCell.flashRed = function (other)
{
    this.cell.style.backgroundColor = "red";
    other.style.backgroundColor = "red";

    clearTimeout(this.flashInID);
    clearTimeout(this.flashOutID);
    clearTimeout(other.flashInID);
    clearTimeout(other.flashOutID);

    let thisCell = this.cell;

    this.flashInID = setTimeout(() =>
    {
        thisCell.style.transition = "background-color 0.5s";
        thisCell.style.backgroundColor = "#616161";
    }, 100);

    other.flashInID = setTimeout(() =>
    {
        other.style.transition = "background-color 0.5s";
        other.style.backgroundColor = "#121212";
    }, 100);

    this.flashOutID = setTimeout(() => { thisCell.style.transition = "none"; }, 500);

    other.flashOutID = setTimeout(() => { other.style.transition = "none"; }, 500);
}

//////////////////////////
//   END selectedCell   //
//////////////////////////

///////////////////////////
//  BEGIN eventListener  //
///////////////////////////

var keyRepeat = false;

document.addEventListener("keypress", (event) =>
{
    if (keyRepeat || isNaN(event.key) || selectedCell.row === -1)
        return;

    keyRepeat = true;

    if (sudoku.setValue(selectedCell.row, selectedCell.col, Number(event.key)))
    {
        selectedCell.deselect();

        if (sudoku.checkWin())
            document.getElementById("win-text").style.opacity = 1;
    }
});

document.addEventListener("keyup", (event) =>
{
    keyRepeat = false;
});

///////////////////////////
//   END eventListener   //
///////////////////////////

document.querySelector()