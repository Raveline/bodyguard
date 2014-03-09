function Grid(lvl) {
    PIXI.DisplayObjectContainer.call(this);
    this.x = 0;
    this.y = 0;
    this.lvl = lvl;

    this.library = ["floor_01", "floor_02", "crate_01"];
    this.build();
}
Grid.constructor = Grid;
Grid.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

Grid.prototype.build = function() {
    this.grid = [];
    for (i in this.lvl) {
        for (j in this.lvl[i]) {
            var sprite = PIXI.Sprite.fromImage(this.library[this.lvl[i][j]]);
            sprite.x = i * 16;
            sprite.y = j * 16;
            this.grid.push(sprite);
            this.addChild(sprite);
        }
    }
}

