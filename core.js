
$(function() {

  var map = [];
  map[0] = [];
  map[0][0] = { north: 'img1', east: 'img1', south: 'img1' };
  map[1] = [];
  map[1][0] = { north: 'img1', east: 'img1', south: 'img1', west: 'img1' };
  
  setPosition(new Position(0, 0, "north"));

  function setPosition(pos) {
    console.log(pos);
    var uiState = new UiState(pos);
    render(uiState);
  }

  function Position(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  function UiState(pos) {
    this.pos = pos;

    var cell = map[pos.x][pos.y];
    this.img = cell[pos.direction];

    this.forwardsPos = getForwardsPosition(pos);
    this.leftPos = getTurnPosition(pos, "left");
    this.rightPos = getTurnPosition(pos, "right");

    this.forwardsActive = positionExists(this.forwardsPos);
    this.leftActive = positionExists(this.leftPos);
    this.rightActive = positionExists(this.rightPos);

    function getTurnPosition(pos, turn) {
      var turnDirection = getTurnDirection(pos.direction, turn);
      return new Position(pos.x, pos.y, turnDirection);
    }

    function getTurnDirection(direction, turn) {
      var turns = {
        "north": { "left": "west", "right": "east" },
        "east": { "left": "north", "right": "south" },
        "south": { "left": "east", "right": "west" },
        "west": { "left": "south", "right": "north" }
      };
      return turns[direction][turn];
    }

    function getForwardsPosition(pos) {
      var forwardDeltas = {
        "north": { x: 0, y: 1 },
        "east": { x: 1, y: 0 },
        "south": { x: 0, y: -1 },
        "west": { x: -1, y: 0 },
      }
      var deltas = forwardDeltas[pos.direction];
      return new Position(pos.x + deltas.x, pos.y + deltas.y, pos.direction);
    }

    function positionExists(pos) {
      if (!cellExists(pos.x, pos.y)) return false;
      return typeof map[pos.x][pos.y][pos.direction] !== 'undefined';
    }

    function cellExists(x, y) {
      if (!map[x]) return false;
      if (!map[x][y]) return false;
      return true;
    }
  }

  function render(uiState) {
    var $mainImg = $('#mainImg');
    var $forwards = $('#forwards');
    var $left = $('#left');
    var $right = $('#right');

    var imgUrl = 'url(' + uiState.img + '.jpg)';
    $mainImg.css('background-image', imgUrl);

    $forwards.off();
    $left.off();
    $right.off();

    if (uiState.forwardsActive) {
      $forwards.on('click', function() {
        setPosition(uiState.forwardsPos);
      });
    }
    if (uiState.leftActive) {
      $left.on('click', function() {
        setPosition(uiState.leftPos);
      });
    }
    if (uiState.rightActive) {
      $right.off().on('click', function() {
        setPosition(uiState.rightPos);
      });
    }

    toggleActive($forwards, uiState.forwardsActive);
    toggleActive($left, uiState.leftActive);
    toggleActive($right, uiState.rightActive);

    function toggleActive($elem, active) {
      $elem.toggleClass('active', active);
    }
  }

});
