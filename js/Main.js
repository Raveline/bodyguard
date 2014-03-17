GRID_WIDTH = 12;
GRID_HEIGHT = 12;
SCALE_FACTOR = 4;
TILE_SIZE = 16;
SCREEN_WIDTH = GRID_WIDTH * TILE_SIZE * SCALE_FACTOR;
SCREEN_HEIGHT = GRID_HEIGHT * TILE_SIZE * SCALE_FACTOR;

function Main() {
    this.initRenderer(); // PIXI rendering
    this.loadAssets();  
    this.lastTime = Date.now();
    this.timeSinceLastFrame = 0;
}

/**
 * Prepare the PIXI renderer.
 */
Main.prototype.initRenderer = function() {
    this.stage = new PIXI.Stage(0xFFFFFF);
    this.renderer = PIXI.autoDetectRenderer(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(this.renderer.view);
    this.prepareScaling();
    this.grid = new Grid(GRID_WIDTH, GRID_HEIGHT);
    this.magnifier.addChild(this.grid);
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
    // TODO : add before that a "StateStack".
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.load();
};

/**
 * Once we have everything on the client, we
 * add a grid, make sure clicking on the stage is
 * handled, we create our hero (TODO : absurd, move that)
 * and we load a level.
 * This whole function should be refactored when we're not
 * in prototype anymore.
 ** */
Main.prototype.assetsLoaded = function() {
    this.state = new SceneState("docks1", this.stage, this.grid, this.magnifier);
    requestAnimFrame(this.update.bind(this));
};

/**
 * Main rendering.
 * Most of this should be outfleshed to a GameState.
 **/
Main.prototype.update = function() {
    requestAnimFrame(this.update.bind(this));
    var now = Date.now();
    this.timeSinceLastFrame = now - this.lastTime;
    this.lastTime = now;
    if (this.state.ready) {
       this.state.update(this.timeSinceLastFrame);
       this.grid.update();
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

