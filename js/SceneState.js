/**
 * Main "game" state. The hero is a bodyguard
 * protecting his targets from baddies coming
 * from everywhere.
 **/
function SceneState(levelName, stage, grid, magnifier) {
    this.projectiles = [];
    this.villains = [];
    this.stage = stage;
    this.grid = grid;
    this.magnifier = magnifier;
    this.init(levelName);
}

SceneState.prototype.init = function(levelName) {
    this.setMouseEvents();
    this.loadLevel(levelName);
}

SceneState.prototype.allSet = function() {
    this.bodyguard = this.aHeroIsBorn(); 
    this.addToDisplayList(this.bodyguard);
    requestAnimFrame(this.update.bind(this));
}

SceneState.prototype.loadLevel = function(levelName) {
    var loader = new PIXI.JsonLoader("data/" + levelName + ".json");
    loader.on('loaded', function(evt) {
        var data = evt.content.json;
        this.parseLevel(data);
        this.allSet();
    }.bind(this));
    loader.load();
}

SceneState.prototype.parseLevel = function(data) {
    this.level = new Level(data);
    var textures = getTextureArray("dock", data.tileset_size);
    this.grid.setLevel(textures, this.level);
    // TODO : Change this so we can switch easily levels
    this.addToDisplayList(this.grid.outputSprite);
}

SceneState.prototype.update = function() {
    this.bodyguard.update(this.grid.camera, this.level);
    this.grid.set_camera(this.bodyguard, this.level);
    for (i in this.projectiles) {
        this.projectiles[i].update(this.grid.camera, this.level);
    }
    for (i in this.villains) {
        this.villains[i].update(this.grid.camera, this.level);
    }
}

// Handling mouse action in this State.
SceneState.prototype.setMouseEvents = function() {
    this.stage.mousemove = this.mouseMoved.bind(this);
    this.stage.click = this.mouseClicked.bind(this);
}

// Orientation of the bodyguard when mouse is moving.
SceneState.prototype.mouseMoved = function(mouseData) {
    var mouseCoords = this.repositionMouse(mouseData.global);
    this.bodyguard.orientationTowards(mouseCoords);
};

/** Compute the absolute position of the mouse, taking
 care of scrolling & scaling issue. **/
SceneState.prototype.mouseClicked = function(mouseData) {
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

// Reposition mouse, taking into account scaling and camera.
SceneState.prototype.repositionMouse = function(coords) {
    var locals = coords.clone();
    locals.scale(1/SCALE_FACTOR);
    locals.add(this.grid.camera);
    return locals;
}

/**
 * Fire a bullet from X to Y. 
 **/
SceneState.prototype.addBulletTowards = function(from, to) {
    var projectile = new Bullet(from, to);
    this.projectiles.push(projectile);
    this.addToDisplayList(projectile);
}

/**
 * Generate a Hero.
 * TODO : Move this in a GameState object.
 **/
SceneState.prototype.aHeroIsBorn = function() {
    var textures = getTextureArray("character", 4);
    var hero = new Mover(textures, 16, 10
                        , new PIXI.Point(this.level.heroStartingPoint.x,this.level.heroStartingPoint.y)
                        , new PIXI.Point(0,0)
                        , new PIXI.Point(0,0));
    return hero;
};

SceneState.prototype.addToDisplayList = function(elem) {
    this.magnifier.addChild(elem);
}
