requirejs.config({
  paths: {
    jquery: 'node_modules/jquery/dist/jquery.min'
  }
});

require([
  'saunter/core'
],
function (core) {
  core.init('map.json', []);
});
