define('saunter/model', [],
function () {

  return {
    Position: function(x, y, angleOrDirection) {
      this.x = x;
      this.y = y;
      if (typeof(angleOrDirection) === "number") {
        this.angle = angleOrDirection;
        this.direction = "north"; // TODO: calculate this for better pano->static jump
      }
      if (typeof(angleOrDirection) === "string") {
        this.direction = angleOrDirection;
        this.angle = 0; // TODO: calculate this for better static->pano jump
      }
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
