define('saunter/core', [
  'jquery',
  'saunter/model',
  'saunter/staticMode',
  'saunter/panoMode'
],
function ($, model, staticMode, panoMode) {

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
      parseCells(data, getImageUrl, function(cellMap) {
        successFunc(init, new model.Map(cellMap), getImageUrl);
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
      var pos = new model.Position(init.x, init.y, init.direction);
      console.log('Init position:', pos);
      return pos;
    }

    function parseCells(data, getImageUrl, successFunc) {
      var cellMap = [];
      var cells = data.cells || [];
      var imgNames = [];
      console.log('Cells: ' + cells.length);
      if (cells.length == 0) {
        console.log('Error: No cells found!');
      }
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (!cellMap[cell.x]) cellMap[cell.x] = [];
        if (cellMap[cell.x][cell.y]) {
          console.log('Warning: Duplicate cell co-ord: ' + cell.x + ', ' + cell.y);
        }
        cellMap[cell.x][cell.y] = cell;

        // TODO: make staticMode and panoMode responsible for the following:
        if (cell.pano) imgNames.push(cell.pano);
        if (cell.north) imgNames.push(cell.north);
        if (cell.east) imgNames.push(cell.east);
        if (cell.south) imgNames.push(cell.south);
        if (cell.west) imgNames.push(cell.west);
      }
      $(function() {
        preloadImages(imgNames, getImageUrl, function() {
          successFunc(cellMap);
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
      var cell = map.getCell(callback.x, callback.y);
      if (cell && cell[callback.direction]) {
        cell[callback.direction + '_callback'] = callback.func;
      } else {
        var pos = new model.Position(callback.x, callback.y, callback.direction);
        console.log('Warning: Callback specified for non-existant pos: ', pos);
      }
    }
  }

  function tryCallback(pos, map, uiState) {
    var cell = map.getCell(pos.x, pos.y);
    if (cell) {
      var callback = cell[pos.direction + '_callback'];
      if (callback) {
        callback(uiState);
      }
    }
  }

  function setPosition(pos, map, getImageUrl) {
    console.log(pos);
    var cell = map.getCell(pos.x, pos.y);
    if (map.isStatic(cell)) {
      var uiState = staticMode.getUiState(pos, map);
      tryCallback(pos, map, uiState);
      staticMode.render(uiState, map, setPosition, getImageUrl);
    } else if (map.isPano(cell)) {
      var uiState = panoMode.getUiState(pos, map);
      tryCallback(pos, map, uiState);
      panoMode.render(uiState, map, setPosition, getImageUrl);
    }
  }

});
