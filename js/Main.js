SCALE_FACTOR = 4;
TILE_SIZE = 16;


function Main() {
    this.initRenderer(); // PIXI rendering
    this.loadAssets();  
    this.projectiles = [];
}

/**
 * Prepare the PIXI renderer.
 */
Main.prototype.initRenderer = function() {
    this.stage = new PIXI.Stage(0xFFFFFF);
    this.renderer = PIXI.autoDetectRenderer(768, 768);
    document.body.appendChild(this.renderer.view);
    this.prepareScaling();
}

/**
 * Scaling is done through a "magnifier" object set one the
 * stage. **/
Main.prototype.prepareScaling = function() {
    this.magnifier = new PIXI.DisplayObjectContainer();
    this.magnifier.scale.x = this.magnifier.scale.y = SCALE_FACTOR;
    this.stage.addChild(this.magnifier);
    // Can I haz bioutifoul scale, plz ?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
}

/**
 * Load assets for the game.
 * TODO : when we leave the prototyping phase, add a real
 * loading screen.
 */
Main.prototype.loadAssets = function() {
    var assets = ["img/character.json", "img/bullet.png", "img/level1.json"];
    loader = new PIXI.AssetLoader(assets);
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.load();
};

/**
 * Adding an object to the stage means adding it
 * to the magnifier, to ensure everything is
 * well scaled.
**/
Main.prototype.addToDisplayList = function(object) {
    this.magnifier.addChild(object);
}

/**
 * Once we have everything on the client, we
 * add a grid, make sure clicking on the stage is
 * handled, we create our hero (TODO : absurd, move that)
 * and we load a level.
 * This whole function should be refactored when we're not
 * in prototype anymore.
 ** */
Main.prototype.assetsLoaded = function() {
    this.addGrid();
    this.setClickEvents();
    this.loadLevel("docks1");
};

/**
 * Handling click on the stage.
 **/
Main.prototype.setClickEvents = function() {
    this.stage.mousemove = this.mouseMoved.bind(this);
    this.stage.click = this.mouseClicked.bind(this);
}

/**
 * Handling the tile grid.
 **/
Main.prototype.addGrid = function() {
    this.grid = new Grid(12,12);
}

/**
 * Now we're all done, we can start the animframe (main loop).
 **/
Main.prototype.allSet = function() {
    this.bodyguard = this.aHeroIsBorn(); 
    this.addToDisplayList(this.bodyguard);
    requestAnimFrame(this.update.bind(this));
}

/**
 * Orientation of the bodyguard when mouse is moving.
 * TODO : Put this in a GameState, this has nothing
 * to do in a Main class.*/
Main.prototype.mouseMoved = function(mouseData) {
    var mouseCoords = this.repositionMouse(mouseData.global);
    this.bodyguard.orientationTowards(mouseCoords);
};

/**
 * Handling movement and firing for our hero.
 * TODO : Put this in a GameState, this has nothing
 * to do in a Main class.*/
Main.prototype.mouseClicked = function(mouseData) {
    // Relocate the mouse
    var mouseCoords = this.repositionMouse(mouseData.global);

    // Identify left or right click
    event = mouseData.originalEvent;
    if(event.which === 3 || event.button === 2) {
        this.addBulletTowards(this.bodyguard.absolute_position, mouseCoords);
    } else {
        this.bodyguard.moveTowards(mouseCoords);
    }
}

/**
 * Compute the absolute position of the mouse, taking
 * care of scrolling & scaling issue.
 **/
Main.prototype.repositionMouse = function(coords) {
    var locals = coords.clone();
    locals.scale(1/SCALE_FACTOR);
    locals.add(this.grid.camera);
    return locals;
}

/**
 * Fire a bullet from X to Y. TODO : this has nothing to
 * do in the Main.
 **/
Main.prototype.addBulletTowards = function(from, to) {
    var projectile = new Bullet(from, to);
    this.projectiles.push(projectile);
    this.addToDisplayList(projectile);
}

/**
 * Generate a Hero.
 * TODO : Move this in a GameState object.
 **/
Main.prototype.aHeroIsBorn = function() {
    var textures = getTextureArray("character", 4);
    var hero = new Mover(textures, 16, 10
                        , new PIXI.Point(this.level.heroStartingPoint.x,this.level.heroStartingPoint.y)
                        , new PIXI.Point(0,0)
                        , new PIXI.Point(0,0));
    return hero;
};

/**
 * Main rendering.
 * Most of this should be outfleshed to a GameState.
 **/
Main.prototype.update = function() {
    requestAnimFrame(this.update.bind(this));
    this.bodyguard.update(this.grid.camera, this.level);
    this.grid.set_camera(this.bodyguard, this.level);
    this.grid.update();
    for (i in this.projectiles) {
        this.projectiles[i].update(this.grid.camera, this.level);
    }
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

/**
 * Load a level and make sure that we shall parse it and be
 * ready to launc our game.
 **/
Main.prototype.loadLevel = function(lvlName) {
    var loader = new PIXI.JsonLoader("data/" + lvlName + ".json");
    loader.on('loaded', function(evt) {
        var data = evt.content.json;
        this.parseLevel(data);
        this.allSet();
    }.bind(this));
    loader.load();
}

/**
 * Once a level file has been loaded, we create a Level
 * object and set the Grid to its proper state.
 **/
Main.prototype.parseLevel = function(data) {
    this.level = new Level(data);
    var textures = getTextureArray("dock", data.tileset_size);
    this.grid.setLevel(textures, this.level);
    // TODO : Change this so we can switch easily levels
    this.addToDisplayList(this.grid.outputSprite);
}
