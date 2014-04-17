define('mead/main', [
  'jquery',
  'mead/core'
],
function ($, core) {

  return {
    init: function () {
      var map = [];
      map[0] = [];
      map[0][0] = { north: 'img1', east: 'img1', south: 'img1' };
      map[1] = [];
      map[1][0] = { north: 'img1', east: 'img1', south: 'img1', west: 'img1' };

      $(function() {
        core.init(map, 0, 0, "north");
      });
    }
  };

});
