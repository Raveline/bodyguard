ACTION_SCENE = 0;
CUT_SCENE = 1;
TEXT_SCENE = 2;

TILE_SIZE = 16;
GRID_WIDTH = 12;
GRID_HEIGHT = 12;
SCALE_FACTOR = 4;
SCREEN_REAL_WIDTH = GRID_WIDTH * TILE_SIZE;
SCREEN_REAL_HEIGHT = GRID_HEIGHT * TILE_SIZE;
SCREEN_WIDTH = SCREEN_REAL_WIDTH * SCALE_FACTOR;
SCREEN_HEIGHT = SCREEN_REAL_HEIGHT * SCALE_FACTOR;

SCENE_NOT_FINISHED = 0;
REPLAY_SCENE = 1;
NEXT_SCENE = 2;

// TODO : Eventually, put this in a config file
var stack = [{ type : CUT_SCENE, file : "intro" },
            { type : ACTION_SCENE, file : "docks1"},
            { type : TEXT_SCENE, text : "Aaaaand...  that's it for now :), thanks for playing !" } ];

function Main() {
    this.initRenderer(); 
    this.loadAssets();  
    // TODO : put this on the StateScene
    this.big_text = new PIXI.Text("", {font : "50px Arial", fill:"white", stroke:"black", strokeThickness:6});
    this.stage.addChild(this.big_text);
    // Where do we stand in the general game ? TOPONDER : Maybe this should be in a savable GameState class or something.
    this.stackIndex = 0;
}

Main.prototype.initTiming = function() {
    // Timing utilities
    this.lastTime = Date.now();
    this.timeSinceLastFrame = 0;
}

/**
 * Prepare the PIXI renderer.
 */
Main.prototype.initRenderer = function() {
    this.stage = new PIXI.Stage(0x000000);
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
    var assets = ["img/character.json", "img/bullet.png", "img/level1.json",  "img/bodyguard.png", "img/bigears.png", "img/telephone.png", "img/replay.png", "img/caramia.png"];
    loader = new PIXI.AssetLoader(assets);
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.load();
};

/**
 * Once we have everything on the client, we are
 * ready to move on the stack of scenes.
 ** */
Main.prototype.assetsLoaded = function() {
    this.popTheSceneStack();
    requestAnimFrame(this.update.bind(this));
};

Main.prototype.popTheSceneStack = function() {
    var current = stack[this.stackIndex];
    if (current.type == CUT_SCENE) {
        this.state = new CutSceneState(current.file, this.stage, this.magnifier);
    } else if (current.type == ACTION_SCENE) {
        this.state = new SceneState(current.file, this.stage, this.grid, this.magnifier);
    } else if (current.type == TEXT_SCENE) {
        this.magnifier.visible = false;
        this.state = new TextStage(this.stage, current.text);
    }
}

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
       if (this.state.isFinished()) {
           if (this.state.destination != REPLAY_SCENE) {
               this.stackIndex++;
           }
           this.popTheSceneStack();
       }
    }
    this.renderer.render(this.stage);
};

Main.prototype.infoText = function(content) {
    this.big_text.setText(content);
    this.big_text.updateText();
    this.big_text.x = (SCREEN_WIDTH - this.big_text.width)/2;
    this.big_text.y = SCREEN_HEIGHT/2;
}

/** TODO : extract this to a class, a util file, or under
a carpet. **/
function getTextureArray(prefixe, quantity) {
    var textures = [];
    for (var i = 1; i <= quantity; i++) {
        textures.push(PIXI.Texture.fromFrame(prefixe + i)); // Ugly as fuck
    }
    return textures;
}


/** TODO : extract this to a class, a util file, or under
 * a carpet **/
function removeFromArray(array, elem) {
    array.splice(array.indexOf(elem), 1);
}
