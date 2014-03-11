// Note : width and height are computed in tile size
function Grid(width, height) {
    PIXI.DisplayObjectContainer.call(this);
    this.x = 0;
    this.y = 0;
    this.tilesNumX = width;
    this.tilesNumY = height;
    this.camera = new Camera(0,0,width*TILE_SIZE, height*TILE_SIZE);
}
Grid.constructor = Grid;
Grid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

Grid.prototype.setLevel = function(textures, lvl) {
    this.lvl = lvl;
    this.camera.setWorldMaximums(this.lvl[0].length, this.lvl.length);
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

Grid.prototype.move_camera = function(velocity) {
    if (velocity.x != 0 || velocity.y != 0) {
        this.camera.move(velocity);
    }
}

Grid.prototype.update = function() {
    var startX = ~~ (this.camera.x / TILE_SIZE);
    var startY = ~~ (this.camera.y / TILE_SIZE);
    var endX = ~~ ((this.camera.x + this.camera.width) / TILE_SIZE);
    var endY = ~~ ((this.camera.y + this.camera.height) / TILE_SIZE);
    //console.log(endX, endY);

    for (var x = startX; x < endX; x++) {
        for (var y = startY; y < endX; y++) {
            this.grid[y-startY][x-startX].gotoAndStop(this.lvl[y][x].tile);
        }
    }
}
