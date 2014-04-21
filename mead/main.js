define('mead/main', [
  'jquery',
  'mead/core'
],
function ($, core) {

  return {
    init: function () {
      core.init('map.json');
    }
  };

});
