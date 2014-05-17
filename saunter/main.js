define('saunter/main', [
  'jquery',
  'saunter/core'
],
function ($, core) {

  return {
    init: function () {
      core.init('map.json', [
        { x: 1, y: 0, direction: "north", func: function(u) { u.leftActive = false; } }
      ]);
    }
  };

});