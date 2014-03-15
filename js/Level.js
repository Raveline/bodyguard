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
}

Level.prototype.getTileValue = function(x,y) {
    return this.tiles[y][x].tile;
}

Level.prototype.isWalkable = function(x,y) {
    return this.tiles[y][x].block == 0;
}
