define('saunter/staticMode', [
  'jquery',
  'saunter/model'
],
function ($, model) {

  return {
      getUiState: function(pos, map) {
          return new UiState(pos, map);
      },
      render: render
  };

  function UiState(pos, map) {
    this.pos = pos;

    var cell = map.getCell(pos.x, pos.y);
    this.img = cell[pos.direction];

    this.forwardsPos = getForwardsPosition(pos);
    this.leftPos = getTurnPosition(pos, "left", 2);
    this.rightPos = getTurnPosition(pos, "right", 2);

    this.forwardsActive = positionExists(this.forwardsPos);
    this.leftActive = positionExists(this.leftPos);
    this.rightActive = positionExists(this.rightPos);

    this.surroundingImages = getSurroundingImages(this, map);

    function getTurnPosition(pos, turn, tries) {
      for (var i = 0; i < tries; i++) {
        var turnDirection = getTurnDirection(pos.direction, turn);
        pos = new model.Position(pos.x, pos.y, turnDirection);
        if (positionExists(pos)) {
          return pos;
        }
      }
      return false;
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
      return new model.Position(pos.x + deltas.x, pos.y + deltas.y, pos.direction);
    }

    function positionExists(pos) {
      if (!pos) return false;
      var cell = map.getCell(pos.x, pos.y);
      if (!cell) return false;
      return typeof cell[pos.direction] !== 'undefined';
    }

    function getSurroundingImages(uiState, map) {
      var imgs = [ uiState.img ];
      if (uiState.forwardsActive) addPos(uiState.forwardsPos);
      if (uiState.leftActive) addPos(uiState.leftPos);
      if (uiState.rightActive) addPos(uiState.rightPos);
      function addPos(pos) {
        var cell = map.getCell(pos.x, pos.y);
        imgs.push(cell[pos.direction]);
      }
      return imgs;
    }
  }

  function render(uiState, map, setPosition, getImageUrl) {
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
        setPosition(uiState.forwardsPos, map, getImageUrl);
      });
    }
    if (uiState.leftActive) {
      $left.on('click', function() {
        setPosition(uiState.leftPos, map, getImageUrl);
      });
    }
    if (uiState.rightActive) {
      $right.on('click', function() {
        setPosition(uiState.rightPos, map, getImageUrl);
      });
    }

    toggleActive($forwards, uiState.forwardsActive);
    toggleActive($left, uiState.leftActive);
    toggleActive($right, uiState.rightActive);

    updateImageCache(uiState.surroundingImages);

    function setImg(imgName) {
      var $img = getImage(imgName, getImageUrl);
      $img.addClass('active');
      $mainImg.find('.img:not(#img_' + imgName + ')').removeClass('active');
    }

    function toggleActive($elem, active) {
      $elem.toggleClass('active', active);
    }

    function updateImageCache(imgs) {
      var $mainImg = $('#mainImg');
      $mainImg.find('.img').each(function(i, $img) {
        var imgName = $img.id.substring("img_".length);
        if ($.inArray(imgName, imgs) == -1) {
          $img.remove();
        }
      });
      $.each(imgs, function(i, img) {
        getImage(img, getImageUrl);
      });
    }

    function getImage(imgName, getImageUrl) {
      var $mainImg = $('#mainImg');
      var $img = $mainImg.find('.img#img_' + imgName);
      if ($img.length == 0) {
        $img = $('<div id="img_' + imgName + '" class="img"></div>');
        var imgUrl = 'url(' + getImageUrl(imgName) + ')';
        $img.css('background-image', imgUrl);
        $mainImg.append($img);
      }
      return $img;
    }
  }
});
