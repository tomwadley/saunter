define('mead/core', [
  'jquery'
],
function ($) {

  return {
    init: function(map, x, y, direction) {
      setPosition(new Position(x, y, direction), map);
    }
  }

  function setPosition(pos, map) {
    console.log(pos);
    var uiState = new UiState(pos, map);
    render(uiState, map);
  }

  function Position(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  function UiState(pos, map) {
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

  function render(uiState, map) {
    var $mainImg = $('#mainImg');
    var $forwards = $('#forwards');
    var $left = $('#left');
    var $right = $('#right');

    setImg(uiState.img);

    $forwards.off();
    $left.off();
    $right.off();

    if (uiState.forwardsActive) {
      $forwards.on('click', function() {
        setPosition(uiState.forwardsPos, map);
      });
    }
    if (uiState.leftActive) {
      $left.on('click', function() {
        setPosition(uiState.leftPos, map);
      });
    }
    if (uiState.rightActive) {
      $right.off().on('click', function() {
        setPosition(uiState.rightPos, map);
      });
    }

    toggleActive($forwards, uiState.forwardsActive);
    toggleActive($left, uiState.leftActive);
    toggleActive($right, uiState.rightActive);

    function setImg(imgName) {
      var $img = $mainImg.find('.img#img_' + imgName);
      if ($img.length == 0) {
        $img = $('<div id="img_' + imgName + '" class="img"></div>');
        var imgUrl = 'url(' + uiState.img + '.jpg)';
        $img.css('background-image', imgUrl);
        $mainImg.append($img);
      }
      $img.addClass('active');
      $mainImg.find('.img:not(#img_' + imgName + ')').removeClass('active');
    }

    function toggleActive($elem, active) {
      $elem.toggleClass('active', active);
    }
  }

});
