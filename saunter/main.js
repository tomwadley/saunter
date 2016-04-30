define('saunter/main', [
  'jquery',
  'saunter/core'
],
function ($, core) {

  return {
    init: function () {
      core.init('map.json', []);
    }
  };

});
