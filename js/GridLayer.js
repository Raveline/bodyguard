var layer_static_position = new PIXI.Point(0,0); // Layer will always be at 0,0, no need to recreate this constantly

function GridLayer(width, height, level, layer, textures, constantRendering) {
    PIXI.DisplayObjectContainer.call(this);
    this.tilesNumX = width;
    this.tilesNumY = height;
    this.needRendering = constantRendering;
    this.textures = textures;
    this.level = level;
    this.layer = layer; // Layer id
    this.grid = [];
    this.buildRenderTexture();
}
GridLayer.constructor = GridLayer;
GridLayer.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

GridLayer.prototype.buildRenderTexture = function() {
    this.renderTexture = new PIXI.RenderTexture(this.tilesNumX * TILE_SIZE, this.tilesNumY * TILE_SIZE);
    for (var y = 0; y < this.tilesNumY + 1; y++) {
        this.grid.push([]);
        for (var x = 0; x < this.tilesNumX + 1; x++) {
            var clip = new PIXI.MovieClip(this.textures);
            this.addChild(clip);
            this.grid[y].push(clip);
        }
    }
}

GridLayer.prototype.drawMapOnTexture = function(camera) {
    var startX = ~~ (camera.x / TILE_SIZE);
    var startY = ~~ (camera.y / TILE_SIZE);
    var endX = startX + this.tilesNumX +1;
    var endY = startY + this.tilesNumY + 1;

    for (var y = startY; y < endY; y++) {
        var line = [];
        var real_line = y < this.level.height;
        for (var x = startX; x < endX; x++) {
            // Get the tileValue
            var tileValue = -1;
            if (real_line && x < this.level.width) {
                tileValue = this.level.getTileValue(this.layer,x,y);
            }
            var clip = this.grid[x-startX][y-startY];
            if (tileValue > -1) {
                clip.visible = true;
                clip.gotoAndStop(tileValue);
            } else {
                clip.visible = false;
            }
            // Position the tile
            clip.x = (x - startX) * TILE_SIZE - (camera.x % TILE_SIZE);
            clip.y = (y- startY) * TILE_SIZE - (camera.y % TILE_SIZE); 
        }
    }
    this.needRendering = false; 
    this.renderTexture.render(this, layer_static_position, true);
}
