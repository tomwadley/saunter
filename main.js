
$(function() {
  var $mainImg = $('#mainImg');
  var $forwards = $('#forwards');
  var $left = $('#left');
  var $right = $('#right');

  $forwards.click(forwards);
  $left.click(left);
  $right.click(right);

  var Direction = { NORTH: 'north', EAST: 'east', SOUTH: 'south', WEST: 'west' };
  var Turn = { LEFT: 'left', RIGHT: 'right' };

  var map = [];
  map[0] = [];
  map[0][0] = { north: 'img1', east: 'img1', south: 'img1' };
  map[1] = [];
  map[1][0] = { north: 'img1', east: 'img1', south: 'img1', west: 'img1' };
  
  setPosition(0, 0, "north");

  function setPosition(x, y, direction) {
    console.log("Position: " + x + ", " + y + " " + direction);

    var cell = map[x][y];
    var img = 'url(' + cell[direction] + '.jpg)';

    $mainImg.css('background-image', img);

    var forwardsCoords = getForwardsCoords(x, y, direction);
    var forwardsActive = cellExists(forwardsCoords.x, forwardsCoords.y);

    toggleActive($forwards, forwardsActive);

    var leftDirection = getTurnDirection(direction, "left");
    var leftActive = typeof cell[leftDirection] !== 'undefined';
    var rightDirection = getTurnDirection(direction, "right");
    var rightActive = typeof cell[rightDirection] !== 'undefined';

    toggleActive($left, leftActive);
    toggleActive($right, rightActive);

    $forwards.off();
    $left.off();
    $right.off();

    if (forwardsActive) {
      $forwards.on('click', function() {
        setPosition(forwardsCoords.x, forwardsCoords.y, direction);
      });
    }
    if (leftActive) {
      $left.on('click', function() {
        setPosition(x, y, leftDirection);
      });
    }
    if (rightActive) {
      $right.off().on('click', function() {
        setPosition(x, y, rightDirection);
      });
    }

    function toggleActive($elem, active) {
      $elem.toggleClass('active', active);
    }
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

});
