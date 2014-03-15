// This sucks.
// Look at https://github.com/GoodBoyDigital/pixi.js/blob/master/examples/example%2011%20-%20RenderTexture/index.html
// Note : width and height are computed in tile size
function Grid(width, height) {
    PIXI.DisplayObjectContainer.call(this);
    this.x = 0;
    this.y = 0;
    this.tilesNumX = width;
    this.tilesNumY = height;
    this.camera = new Camera(0,0,width*TILE_SIZE, height*TILE_SIZE);
    this.needRendering = true;
}
Grid.constructor = Grid;
Grid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Set the level displayed.
 * Will associate the lvl variable, calibrate the camera
 * and store the tileset. 
**/
Grid.prototype.setLevel = function(textures, lvl) {
    this.lvl = lvl;
    this.camera.setWorldMaximums((this.lvl[0].length) * TILE_SIZE, (this.lvl.length) * TILE_SIZE);
    this.textures = textures;
    this.buildRenderTexture(this.tilesNumX*TILE_SIZE, this.tilesNumY*TILE_SIZE);
    this.outputSprite = this.sprite || this.build_outputSprite(this.camera.width, this.camera.height);
}

Grid.prototype.set_camera = function(center) {
    this.needRendering= this.camera.move(center);
}

Grid.prototype.buildRenderTexture = function(width, height) {
    this.grid = [];
    this.renderTexture = new PIXI.RenderTexture(width, height);
    for (var y = 0; y < height/TILE_SIZE + 1; y++) {
        this.grid.push([]);
        for (var x = 0; x < width/TILE_SIZE + 1; x++) {
            var clip = new PIXI.MovieClip(this.textures);
            this.addChild(clip);
            this.grid[y].push(clip);
        }
    }
    this.drawMapOnTexture();
}

Grid.prototype.build_outputSprite = function(width, height) {
    var outputSprite = new PIXI.Sprite(this.renderTexture);
    outputSprite.width = width;
    outputSprite.height = height;
    return outputSprite;
}

/**
 * Draw the grid on the stored canvas, and print the canvas on the grid.
 **/
Grid.prototype.update = function() {
    if (this.needRendering) {
        this.drawMapOnTexture();
    }
}

Grid.prototype.drawMapOnTexture = function() {
    var startX = ~~ (this.camera.x / TILE_SIZE);
    var startY = ~~ (this.camera.y / TILE_SIZE);
    var endX = startX + this.tilesNumX +1;
    var endY = startY + this.tilesNumY + 1;

    for (var y = startY; y < endY; y++) {
        var line = [];
        if (y < this.lvl.length) {
            line = this.lvl[y];
        }
        for (var x = startX; x < endX; x++) {
            var tileValue = 0;
            if (x < line.length) {
                tileValue = this.lvl[y][x].tile;
            }
            var clip = this.grid[x-startX][y-startY];
            clip.gotoAndStop(tileValue);
            clip.x = (x - startX) * TILE_SIZE - (this.camera.x % TILE_SIZE);
            clip.y = (y- startY) * TILE_SIZE - (this.camera.y % TILE_SIZE); 
        }
    }
    this.needRendering = false; 
    this.renderTexture.render(this, new PIXI.Point(0,0), true);
}
