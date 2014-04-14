
$(function() {

  var map = [];
  map[0] = [];
  map[0][0] = { north: 'img1', east: 'img1', south: 'img1' };
  map[1] = [];
  map[1][0] = { north: 'img1', east: 'img1', south: 'img1', west: 'img1' };
  
  setPosition(0, 0, "north");

  function setPosition(x, y, direction) {
    var state = new State(x, y, direction);
    render(state);
  }

  function State(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;

    var cell = map[x][y];
    this.img = cell[direction];

    var forwardsCoords = getForwardsCoords(x, y, direction);
    this.forwardsX = forwardsCoords.x;
    this.forwardsY = forwardsCoords.y;
    this.forwardsActive = cellExists(forwardsCoords.x, forwardsCoords.y);

    this.leftDirection = getTurnDirection(direction, "left");
    this.leftActive = typeof cell[this.leftDirection] !== 'undefined';
    this.rightDirection = getTurnDirection(direction, "right");
    this.rightActive = typeof cell[this.rightDirection] !== 'undefined';

    function getTurnDirection(direction, turn) {
      var turns = {
        "north": { "left": "west", "right": "east" },
        "east": { "left": "north", "right": "south" },
        "south": { "left": "east", "right": "west" },
        "west": { "left": "south", "right": "north" }
      };
      return turns[direction][turn];
    }

    function getForwardsCoords(x, y, direction) {
      var forwardDeltas = {
        "north": { x: 0, y: 1 },
        "east": { x: 1, y: 0 },
        "south": { x: 0, y: -1 },
        "west": { x: -1, y: 0 },
      }
      var deltas = forwardDeltas[direction];
      return { x: x + deltas.x, y: y + deltas.y }
    }

    function cellExists(x, y) {
      if (!map[x]) return false;
      if (!map[x][y]) return false;
      return true;
    }
  }

  function render(state) {
    console.log("Position: " + state.x + ", " + state.y + " " + state.direction);

    var $mainImg = $('#mainImg');
    var $forwards = $('#forwards');
    var $left = $('#left');
    var $right = $('#right');

    var imgUrl = 'url(' + state.img + '.jpg)';
    $mainImg.css('background-image', imgUrl);

    $forwards.off();
    $left.off();
    $right.off();

    if (state.forwardsActive) {
      $forwards.on('click', function() {
        setPosition(state.forwardsX, state.forwardsY, state.direction);
      });
    }
    if (state.leftActive) {
      $left.on('click', function() {
        setPosition(state.x, state.y, state.leftDirection);
      });
    }
    if (state.rightActive) {
      $right.off().on('click', function() {
        setPosition(state.x, state.y, state.rightDirection);
      });
    }

    toggleActive($forwards, state.forwardsActive);
    toggleActive($left, state.leftActive);
    toggleActive($right, state.rightActive);

    function toggleActive($elem, active) {
      $elem.toggleClass('active', active);
    }
  }


});
