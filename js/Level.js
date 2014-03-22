/**
 * The level class is here to provide :
 * - Tilemap of the level.
 * - Important area of the level (where it starts, where it ends, etc.)
 * - Number of villains, there whereabouts, generating them, and so on.
 */

function Level(jsonData) {
    this.tiles = jsonData.tiles;
    this.height = this.tiles.length;
    this.width = this.tiles[0].length;
    this.heroStartingPoint = computeAbsolutePosition(jsonData.startHero.x, jsonData.startHero.y);
    this.targetStartingPoint = computeAbsolutePosition(jsonData.startTarget.x, jsonData.startTarget.y);
    this.targetEndingPoint = new PIXI.Point(jsonData.endTarget.x, jsonData.endTarget.y);
    this.levelLength = jsonData.targetTime;
    this.villainsSpawners = jsonData.villainsSpawners;
    this.preparePathComputing();
}

Level.prototype.getTileValue = function(x,y) {
    return this.tiles[y][x].tile;
}

Level.prototype.isWalkable = function(x,y) {
    return this.tiles[y][x].block == 0;
}

Level.prototype.preparePathComputing = function() {
    this.graph = new Graph(this.tiles);
}

Level.prototype.computePath = function(from, to) {
    var from = this.graph.nodes[from.y][from.x];
    var to = this.graph.nodes[to.y][to.x];
    return astar.search(this.graph.nodes, from, to, true);
}

Level.prototype.rayTrace = function(from, to) {
    var dx = Math.abs(from.x - to.x);
    var dy = Math.abs(from.y - to.y);
    var x = dx;
    var y = dy;
    var n = 1 + dx + dy;
    var x_inc = (from.x > to.x) ? 1 : -1
    var y_inc = (from.y > to.y) ? 1 : -1;
    var error = dx - dy;
    dx*=2;
    dy*=2;
    for (; n > 0; n--) {
        if (!this.isWalkable(from.x + x, from.y + y)) {
            return false;
        }
        if (error > 0) {
            x += x_inc;
            error -= dy;
        } else {
            y += y_inc;
            error += dx;
        }
    }
    return true;
}
