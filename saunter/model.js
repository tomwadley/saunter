define('saunter/model', [],
function () {

  return {
    Position: function(x, y, direction) {
      this.x = x;
      this.y = y;
      this.direction = direction;
    },
    Map: function(cellMap) {
      this.getCell = function(x, y) {
        if (!cellMap[x]) return false;
        if (!cellMap[x][y]) return false;
        return cellMap[x][y];
      };
      this.isStatic = function(cell) {
        return !cell.hasOwnProperty('pano');
      };
      this.isPano = function(cell) {
        return cell.hasOwnProperty('pano');
      };
    }
  }
});
