define('saunter/core', [
  'jquery'
],
function ($) {

  return {
    init: function(mapUrl, callbacks) {
      loadMap(mapUrl, function(init, map, getImageUrl) {
        attachCallbacks(map, callbacks);
        $(function() {
          setPosition(init, map, getImageUrl);
        });
      });
    }
  }

  function loadMap(mapUrl, successFunc) {
    console.log('Loading map: ' + mapUrl);
    $.get(mapUrl)
    .success(function(data) {
      var metadata = parseMetadata(data);
      var getImageUrl = function(imgName) {
        var prefix = metadata.imagePrefix || '';
        var suffix = metadata.imageSuffix || '.jpg';
        return prefix + imgName + suffix;
      };
      var init = parseInit(data);
      parseCells(data, getImageUrl, function(map) {
        successFunc(init, map, getImageUrl);
      });
    })
    .error(function() {
      alert('Failed to load map "' + mapUrl + '"');
    });

    function parseMetadata(data) {
      var metadata = data.metadata || {};
      console.log('Map name: ' + metadata.name);
      console.log('Map version: ' + metadata.version);
      console.log('Map description: ' + metadata.description);
      return metadata;
    }

    function parseInit(data) {
      var init = data.init || {};
      if (init.x === undefined) console.log('Error: No init x co-ord defined');
      if (init.y === undefined) console.log('Error: No init y co-ord defined');
      if (init.direction == undefined) console.log('Error: No init direction defined');
      var pos = new Position(init.x, init.y, init.direction);
      console.log('Init position:', pos);
      return pos;
    }

    function parseCells(data, getImageUrl, successFunc) {
      var map = [];
      var cells = data.cells || [];
      var imgNames = [];
      console.log('Cells: ' + cells.length);
      if (cells.length == 0) {
        console.log('Error: No cells found!');
      }
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (!map[cell.x]) map[cell.x] = [];
        if (map[cell.x][cell.y]) {
          console.log('Warning: Duplicate cell co-ord: ' + cell.x + ', ' + cell.y);
        }
        map[cell.x][cell.y] = cell;

        if (cell.north) imgNames.push(cell.north);
        if (cell.east) imgNames.push(cell.east);
        if (cell.south) imgNames.push(cell.south);
        if (cell.west) imgNames.push(cell.west);
      }
      $(function() {
        preloadImages(imgNames, getImageUrl, function() {
          successFunc(map);
        });
      });
    }

    function preloadImages(imgNames, getImageUrl, successFunc) {
      var gets = []
      $.each(imgNames, function(i, imgName) {
        var imgUrl = getImageUrl(imgName);
        gets.push($.get(imgUrl));
      });
      $.when(gets).then(function() {
        console.log('Preloaded ' + gets.length + ' images');
        successFunc();
      });
    }
  }

  function attachCallbacks(map, callbacks) {
    console.log('Callbacks: ' + callbacks.length);
    for (var i = 0; i < callbacks.length; i++) {
      var callback = callbacks[i];
      var cell = getCell(map, callback.x, callback.y);
      if (cell && cell[callback.direction]) {
        cell[callback.direction + '_callback'] = callback.func;
      } else {
        var pos = new Position(callback.x, callback.y, callback.direction);
        console.log('Warning: Callback specified for non-existant pos: ', pos);
      }
    }
  }

  function tryCallback(pos, map, uiState) {
    var cell = getCell(map, pos.x, pos.y);
    if (cell) {
      var callback = cell[pos.direction + '_callback'];
      if (callback) {
        callback(uiState);
      }
    }
  }

  function setPosition(pos, map, getImageUrl) {
    console.log(pos);
    var uiState = new UiState(pos, map);
    tryCallback(pos, map, uiState);
    render(uiState, map, getImageUrl);
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
    this.leftPos = getTurnPosition(pos, "left", 2);
    this.rightPos = getTurnPosition(pos, "right", 2);

    this.forwardsActive = positionExists(this.forwardsPos);
    this.leftActive = positionExists(this.leftPos);
    this.rightActive = positionExists(this.rightPos);

    this.surroundingImages = getSurroundingImages(this, map);

    function getTurnPosition(pos, turn, tries) {
      for (var i = 0; i < tries; i++) {
        var turnDirection = getTurnDirection(pos.direction, turn);
        pos = new Position(pos.x, pos.y, turnDirection);
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
      return new Position(pos.x + deltas.x, pos.y + deltas.y, pos.direction);
    }

    function positionExists(pos) {
      if (!pos) return false;
      var cell = getCell(map, pos.x, pos.y);
      if (!cell) return false;
      return typeof cell[pos.direction] !== 'undefined';
    }

    function getSurroundingImages(uiState, map) {
      var imgs = [ uiState.img ];
      if (uiState.forwardsActive) addPos(uiState.forwardsPos);
      if (uiState.leftActive) addPos(uiState.leftPos);
      if (uiState.rightActive) addPos(uiState.rightPos);
      function addPos(pos) {
        var cell = getCell(map, pos.x, pos.y);
        imgs.push(cell[pos.direction]);
      }
      return imgs;
    }
  }

  function getCell(map, x, y) {
    if (!map[x]) return false;
    if (!map[x][y]) return false;
    return map[x][y];
  }

  function render(uiState, map, getImageUrl) {
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

});
