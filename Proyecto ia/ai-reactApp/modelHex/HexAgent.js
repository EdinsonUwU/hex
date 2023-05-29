const Agent = require('ai-agents').Agent;
const Graph = require('node-dijkstra');
//const boardS = require('./boardScore');
//const transposeHex = require('./transposeHex');

class HexAgent extends Agent {
    constructor(value) {
        super(value);
        this.cache = {};
    }

    /**
     * return a new move. The move is an array of two integers, representing the
     * row and column number of the hex to play. If the given movement is not valid,
     * the Hex controller will perform a random valid movement for the player
     * Example: [1, 1]
     */
    send() {
        let board = this.perception;
        let size = board.length;
        let available = getEmptyHex(board);
        let nTurn = size * size - available.length;

        return moveGame(board, size, available, nTurn)

    }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}



class Arbol {
    constructor(id, padre = null, hijos = [], tablero) {
        this.id = id
        this.padre = padre
        this.hijos = hijos
        this.tablero = tablero
    }

    addChild(id, tablero) {
        const newChild = new Arbol(id)
        newChild.padre = this
        newChild.tablero = tablero
        this.hijos.push(newChild)
    }


}



function moveGame(board, size, available, nTurn) {
    if (nTurn == 0) {
        return [Math.floor(size / 2), Math.floor(size / 2) - 1];
    } else if (nTurn == 1) {
        return [Math.floor(size / 2), Math.floor(size / 2)];
    } else if (nTurn == 2) {
        if (board[5][3] == 0) {
            return [5, 3];
        }
    } else if (nTurn == 3) {
        if (board[5][2] == 0) {
            return [5, 2];
        }
    }


    let profundidad = 7;
    const arbol = new Arbol("root")


    if (nTurn % 2 == 0) {
        arbol.tablero = board
        crearArbol(arbol, 1, profundidad)
        let movimiento = minmax(arbol, profundidad, true, '1')
        return [Math.floor(movimiento / board.length), movimiento % board.length];
    } else {
        arbol.tablero = transposeHex(board)
        crearArbol(arbol, 2, profundidad)
        let movimiento = minmax(arbol, profundidad, true, '2')
        return [movimiento % board.length, Math.floor(movimiento / board.length)];
    }

}

function crearArbol(arbol, jugador, profundidad) {
    let tableroHijo = JSON.parse(JSON.stringify(arbol.tablero));
    let moValidos = boardPath(arbol.tablero);
    if (profundidad == 0) {
        for (let i = 1; i < moValidos.length - 1; i++) {
            let row = Math.floor(moValidos[i] / arbol.tablero.length)
            let col = moValidos[i] % arbol.tablero.length
            tableroHijo[row][col] = '1'
            arbol.addChild(moValidos[i], tableroHijo)
            tableroHijo = JSON.parse(JSON.stringify(arbol.tablero))
        }
    } else {
        if (moValidos.length > 2) {
            if (moValidos.length == 3) {
                let row = Math.floor(moValidos[1] / arbol.tablero.length)
                let col = moValidos[1] % arbol.tablero.length
                tableroHijo[row][col] = '1'
                arbol.addChild(moValidos[1], tableroHijo)
            } else {

                crearHijos(moValidos, tableroHijo, arbol)

                for (let i = 0; i < arbol.hijos.length; i++) {
                    const element = arbol.hijos[i];
                    crearArbol(element, jugador, profundidad - 1)
                }
            }
        }
    }
}

function crearHijos(hijos, tableroHijo, padre) {
    hijos.shift()
    hijos.pop()


    while (hijos.length != 0) {
        let row = Math.floor(hijos[0] / tableroHijo.length)
        let col = hijos[0] % tableroHijo.length
        tableroHijo[row][col] = '1'

        padre.addChild(hijos[0], tableroHijo)
        tableroHijo = JSON.parse(JSON.stringify(padre.tablero))
        hijos.shift()
    }
}

function minmax(arbol, profundidad, maxplayer, player, alfa = Number.MIN_SAFE_INTEGER, beta = Number.MAX_SAFE_INTEGER) {
    if (profundidad == 0 || arbol.hijos.length == 0) {

        return boardScore(arbol.tablero, player)
    }

    var bestHeur, valminmax

    if (maxplayer) {
        bestHeur = Number.NEGATIVE_INFINITY;
        let movimiento = arbol.id
        for (const hijo in arbol.hijos) {
            valminmax = minmax(arbol.hijos[hijo], profundidad - 1, false, player)
            if (valminmax >= bestHeur) {
                movimiento = arbol.hijos[hijo].id
            }
            if (valminmax > alfa) {
                alfa = valminmax;
            }
            if (beta <= alfa) {
                break;
            }
            bestHeur = Math.max(valminmax, bestHeur)
        }

        return movimiento
    } else {
        bestHeur = Number.POSITIVE_INFINITY;
        let movimiento = arbol.id

        for (const hijo in arbol.hijos) {
            valminmax = minmax(arbol.hijos[hijo], profundidad - 1, true, player)
            if (valminmax >= bestHeur) {
                movimiento = arbol.hijos[hijo].id
            }
            if (beta > valminmax) {
                beta = valminmax;
            }
            if (beta <= alfa) {
                break;
            }
            bestHeur = Math.max(valminmax, bestHeur)
        }

        return movimiento
    }
}

function transposeHex(board) {
    let size = board.length;
    let boardT = new Array(size);
    for (let j = 0; j < size; j++) {
        boardT[j] = new Array(size);
        for (let i = 0; i < size; i++) {
            boardT[j][i] = board[i][j];
            if (boardT[j][i] === '1') {
                boardT[j][i] = '2';
            } else if (boardT[j][i] === '2') {
                boardT[j][i] = '1';
            }
        }
    }
    return boardT;
}



let cache = {};

function boardScore(board, player) {
    let path0 = boardPath(board);
    let score = 0;
    if (!path0) {
        score = -999999999//(board.length * board.length);
    } else {
        if (path0.length === 2) {
            score = 999999999//(board.length * board.length);
        } else {
            let path1 = boardPath(transposeHex(board));
            if (!path1) {
                score = 999999999//(board.length * board.length)
            } else {
                score = path1.length - path0.length;
            }
        }
    }
    return player === '1' ? score : -score;
}

function boardPath(board) {
    let player = '1';
    let size = board.length;

    const route = new Graph();

    let neighborsT = {};
    let neighborsX = {};
    cache = {};
    // Build the graph out of the hex board
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let key = i * size + j;
            if (board[i][j] === 0 || board[i][j] === player) {
                let list = getNeighborhood(key, player, board);
                // Cache this result
                //cache[key] = list;
                list = removeIfAny(board, list, i, j);

                //if (key === 5) console.log(list)

                let neighbors = {};
                let sideX = false;
                let sideT = false;
                list.forEach(x => {
                    switch (x) {
                        case -1:
                            neighbors[player + 'X'] = 1;
                            neighborsX[key + ''] = 1;
                            sideX = sideX || board[i][j] === player;
                            break;
                        case -2:
                            neighbors[player + 'T'] = 1;
                            neighborsT[key + ''] = 1;
                            sideT = sideT || board[i][j] === player;
                            break;
                        default:
                            neighbors[x + ''] = 1;
                    }
                });
                // This case occurs when the game has finished
                if (sideT && sideX) {
                    neighborsX[player + 'T'] = 1;
                    neighborsT[player + 'X'] = 1;
                }
                route.addNode(key + '', neighbors);
            }
        }
    }

    route.addNode(player + 'T', neighborsT);
    route.addNode(player + 'X', neighborsX);

    //console.log(route)

    return route.path(player + 'T', player + 'X');
}

/**
 * Evita que se consideren las casillas donde el enemigo tiene 2 opciones para cerrar el camino
 * @param {*} board 
 * @param {*} list 
 * @param {*} row 
 * @param {*} col 
 * @returns 
 */
function removeIfAny(board, list, row, col) {
    let size = board.length;
    if (row > 0 && col > 0 && row < size - 1 && col < size - 1 && list.length > 0) {
        if (board[row - 1][col] === 0 && board[row - 1][col - 1] === '2' && board[row][col + 1] === '2') {
            let k = list.findIndex(key => key === (row - 1) * size + col);
            //console.log('x: ' + k + ' ' + ((row - 1) *  size + col));
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
        if (board[row][col + 1] === 0 && board[row - 1][col] === '2' && board[row + 1][col + 1] === '2') {
            let k = list.findIndex(key => key === row * size + col + 1);
            //console.log('x: ' + k + ' ' + (row *  size + col + 1) );
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
        if (board[row + 1][col + 1] === 0 && board[row][col + 1] === '2' && board[row + 1][col] === '2') {
            let k = list.findIndex(key => key === (row + 1) * size + col + 1);
            //console.log('x: ' + k + ' ' + ((row + 1) * size + col));
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
        if (board[row + 1][col] === 0 && board[row + 1][col + 1] === '2' && board[row + 1][col - 1] === '2') {
            let k = list.findIndex(key => key === (row + 1) * size + col);
            //console.log('x: ' + k+ ' ' + ((row + 1) * size + col));
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
        if (board[row][col - 1] === 0 && board[row + 1][col] === '2' && board[row - 1][col - 1] === '2') {
            let k = list.findIndex(key => key === row * size + col - 1);
            //console.log('x: ' + k + ' ' + (row * size + col - 1));
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
        if (board[row - 1][col - 1] === 0 && board[row - 1][col] === '2' && board[row][col - 1] === '2') {
            let k = list.findIndex(key => key === (row - 1) * size + col - 1);
            //console.log('x: ' + k + ' ' + ((row - 1) * size + col - 1));
            //console.log(list);
            if (k >= 0)
                list.splice(k, 1);
        }
    }
    return list;
}
/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
    let size = board.length;
    let row = Math.floor(currentHex / size);
    let col = currentHex % size;
    let result = [];
    let currentValue = board[row][col];

    board[row][col] = 'x';
    //Check if this value has been precalculated in this turn
    //if (cache[currentHex]) {
    //console.log("From cache")
    //  return cache[currentHex];
    //}

    // Check the six neighbours of the current hex
    pushIfAny(result, board, player, row - 1, col);
    pushIfAny(result, board, player, row - 1, col + 1);
    pushIfAny(result, board, player, row, col + 1);
    pushIfAny(result, board, player, row, col - 1);
    pushIfAny(result, board, player, row + 1, col);
    pushIfAny(result, board, player, row + 1, col - 1);

    // Add the edges if hex is at the border
    if (col === size - 1) {
        result.push(-1);
    } else if (col === 0) {
        result.push(-2);
    }

    board[row][col] = currentValue;

    return result;
}

function pushIfAny(result, board, player, row, col) {
    let size = board.length;
    if (row >= 0 && row < size && col >= 0 && col < size) {
        if (board[row][col] === player || board[row][col] === 0) {
            if (board[row][col] === player) {
                result.push(...getNeighborhood(col + row * size, player, board));
            } else {
                result.push(col + row * size);
            }
        }
    }
}