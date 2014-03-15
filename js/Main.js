SCALE_FACTOR = 4;
TILE_SIZE = 16;

function Main() {
    this.initRenderer(); // PIXI rendering
    this.loadAssets();  
    this.projectiles = [];
    this.debug_1 = new PIXI.Text("", { font : "12pt arial", fill: "black" });
    this.debug_2 = new PIXI.Text("", { font : "12pt arial", fill: "black" });
    this.debug_3 = new PIXI.Text("", { font : "12pt arial", fill: "black" });
}

Main.prototype.initRenderer = function() {
    // Stage creation and appendage
    this.stage = new PIXI.Stage(0xFFFFFF);
    this.renderer = PIXI.autoDetectRenderer(768, 768);
    this.mousePosition = new PIXI.Point(0,0)
    document.body.appendChild(this.renderer.view);

    this.magnifier = new PIXI.DisplayObjectContainer();
    this.magnifier.scale.x = this.magnifier.scale.y = SCALE_FACTOR;
    this.stage.addChild(this.magnifier);

    // Can I haz beautiful scaling ?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; 
}

Main.prototype.loadAssets = function() {
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    var assets = ["img/character.json", "img/bullet.png", "img/level1.json"];
    loader = new PIXI.AssetLoader(assets);
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.load();
};

Main.prototype.addToDisplayList = function(object) {
    this.magnifier.addChild(object);
}

Main.prototype.assetsLoaded = function() {
    this.addGrid();
    this.setClickEvents();
    // TODO : move this after level loading when hero position info are loaded.
    this.bodyguard = this.aHeroIsBorn(); 
    this.loadLevel("docks1");
};

Main.prototype.setClickEvents = function() {
    this.stage.mousemove = this.mouseMoved.bind(this);
    this.stage.click = this.mouseClicked.bind(this);
}

Main.prototype.addGrid = function() {
    this.grid = new Grid(12,12);
}

Main.prototype.allSet = function() {
    this.stage.addChild(this.debug_1);
    this.debug_1.x = 0;
    this.debug_1.y = 0;
    this.debug_2.x = 0;
    this.debug_2.y = 20;
    this.debug_3.x = 0;
    this.debug_3.y = 40;
    this.stage.addChild(this.debug_2);
    this.stage.addChild(this.debug_3);
    requestAnimFrame(this.update.bind(this));
}

Main.prototype.mouseMoved = function(mouseData) {
    var mouseCoords = this.repositionMouse(mouseData.global);
    this.bodyguard.orientationTowards(mouseCoords);
};

Main.prototype.mouseClicked = function(mouseData) {
    var mouseCoords = this.repositionMouse(mouseData.global);
    this.debug_3.setText("Mouse at : " + mouseCoords.x + "," + mouseCoords.y);
    event = mouseData.originalEvent;
    if(event.which === 3 || event.button === 2) {
        this.addBulletTowards(this.bodyguard.absolute_position, mouseCoords);
        return false;
    } else {
        this.bodyguard.moveTowards(mouseCoords);
    }
}

Main.prototype.repositionMouse = function(coords) {
    var locals = coords.clone();
    locals.scale(1/SCALE_FACTOR);
    locals.add(this.grid.camera);
    return locals;
}

Main.prototype.addBulletTowards = function(from, to) {
    var projectile = new Bullet(from, to);
    this.projectiles.push(projectile);
    this.addToDisplayList(projectile);
}

Main.prototype.aHeroIsBorn = function() {
    var textures = getTextureArray("character", 4);
    var hero = new Mover(textures, 16, 10, new PIXI.Point(96,96), new PIXI.Point(0,0), new PIXI.Point(0,0));
    return hero;
};

Main.prototype.update = function() {
    requestAnimFrame(this.update.bind(this));
    this.bodyguard.update(this.grid.camera, this.level);
    this.grid.set_camera(this.bodyguard, this.level);
    this.grid.update();
    for (i in this.projectiles) {
        this.projectiles[i].update(this.grid.camera, this.level);
    }
    var hero_tile_pos = this.bodyguard.direction.computeTilePosition();
    this.debug_1.setText("Hero position : " + this.bodyguard.absolute_position.x + "," + this.bodyguard.absolute_position.y);
    this.debug_2.setText("Hero position : " + hero_tile_pos.x  + "," + hero_tile_pos.y);
    this.renderer.render(this.stage);
    
};

/** TODO : extract this to a class, a util file, or under
a carpet. **/
function getTextureArray(prefixe, quantity) {
    var textures = [];
    for (var i = 1; i <= quantity; i++) {
        textures.push(PIXI.Texture.fromFrame(prefixe + i)); // Ugly as fuck
    }
    return textures;
}

Main.prototype.loadLevel = function(lvlName) {
    var loader = new PIXI.JsonLoader("data/" + lvlName + ".json");
    loader.on('loaded', function(evt) {
        var data = evt.content.json;
        this.parseLevel(data);
        this.allSet();
    }.bind(this));
    loader.load();
}

Main.prototype.parseLevel = function(data) {
    this.level = data.tiles;
    var textures = getTextureArray("dock", data.tileset_size);
    this.grid.setLevel(textures, this.level);
    // TODO : Change this so we can switch easily levels
    this.addToDisplayList(this.grid.outputSprite);
    this.addToDisplayList(this.bodyguard);
}
