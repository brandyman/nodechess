// helpers

var engine_log  = $('#engine_log')

var print = function(m, p) {
    p = (p === undefined) ? '' : JSON.stringify(p);
    engine_log.append($("<code>").text(m + ' ' + p));
    engine_log.append($("<br>"));
    engine_log.scrollTop(engine_log.scrollTop()+10000);
};


// configure sockjs

var sockjs_url = '/engine';
var sockjs = new SockJS(sockjs_url);

sockjs.onopen    = function()  {
  print('[*] open', sockjs.protocol);
};
sockjs.onmessage = function(e) {
  var engineMove = JSON.parse(e.data);
  if(engineMove.type == "log"){
    print('', engineMove.data);
  }else if (engineMove.type == "move"){
    //print('Engines Move: ', engineMove.data);
    makeEngineMove(engineMove.data.from,engineMove.data.to);
  }
};
sockjs.onclose   = function() {
  print('[*] close');
};

// configure board

var board, game = new Chess();

statusEl = $('#status'),
fenEl = $('#fen'),
pgnEl = $('#pgn');

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);
  
  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};


var makeEngineMove = function(_from,_to){
    game.move({from:_from,to:_to});
    board.position(game.fen());
    updateStatus();
}

var resetGame = function(){
  location.reload(); 
}

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};


var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {

  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();

  sockjs.send(JSON.stringify({fen : game.fen(), from: move.from, to: move.to}));

};

var onSnapEnd = function() {
  board.position(game.fen());
};


var onMouseoverSquare = function(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};


$('#flipOrientationBtn').click(function(){
  board.flip();
});

var onMouseoutSquare = function(square, piece) {
  removeGreySquares();
};

var cfg = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
  pieceTheme : "/images/pieces/{piece}.png"
};
board = new ChessBoard('board', cfg);