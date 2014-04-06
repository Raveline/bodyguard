/**
 * Note : Though the grid is a DisplayObjectContainer, the grid itself SHOULD NOT
 * be added to the stage. It is only a container in order to be rendered into an
 * output sprite. This output sprite is what need to be added on the stage.
 * TODO : create a method to get the output sprite.
 **/
function Grid(width, height) {
    PIXI.DisplayObjectContainer.call(this);
    this.x = 0;
    this.y = 0;
    this.width = width; // In tiles !
    this.height = height; // In tiles !
    this.camera = new Camera(0,0,width*TILE_SIZE, height*TILE_SIZE);
    this.needRendering = true;
    this.outputSprite = [];
    this.layers = [];
}
Grid.constructor = Grid;
Grid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

/**
 * Set the level displayed.
 * Will associate the level variable, calibrate the camera
 * and store the tileset. 
**/
Grid.prototype.setLevel = function(textures, level) {
    this.level = level;
    this.camera.setWorldMaximums(this.level.width * TILE_SIZE, this.level.height * TILE_SIZE);
    for (var i = 0; i < this.level.tiles.length; i++) {
        var layer = new GridLayer(this.width, this.height, this.level, i, textures, false);
        this.layers.push(layer);
        this.outputSprite.push(this.buildOutputSprite(this.camera.width, this.camera.height, layer.renderTexture));
    }
}

Grid.prototype.set_camera = function(center) {
    this.needRendering= this.camera.move(center);
}

Grid.prototype.buildOutputSprite = function(width, height, texture) {
    var outputSprite = new PIXI.Sprite(texture);
    outputSprite.width = width;
    outputSprite.height = height;
    return outputSprite;
}

/**
 * Draw the grid on the stored canvas, and print the canvas on the grid.
 **/
Grid.prototype.update = function() {
    for (var i = 0; i < this.layers.length; i++) {
        if (this.needRendering || this.layers[i].needRendering) {
            this.layers[i].drawMapOnTexture(this.camera);
        }
    }
}
