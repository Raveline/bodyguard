// Note : width and height are computed in tile size
function Grid(width, height) {
    PIXI.DisplayObjectContainer.call(this);
    this.x = 0;
    this.y = 0;
    this.tilesNumX = width;
    this.tilesNumY = height;
}
Grid.constructor = Grid;
Grid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

Grid.prototype.setLevel = function(textures, lvl) {
    this.lvl = lvl;
    this.build(textures);
}

Grid.prototype.build = function(textures) {
    this.grid = [];
    for (i = 0; i < this.tilesNumY; i++) {
        this.grid.push([]);
        for (j = 0; j < this.tilesNumX; j++) {
            var tile = new PIXI.MovieClip(textures);
            tile.gotoAndStop(this.lvl[i][j].tile);
            tile.y = i * TILE_SIZE;
            tile.x = j * TILE_SIZE; 
            this.addChild(tile);
            this.grid[i].push(tile);
        }
    }
}

