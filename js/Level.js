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
