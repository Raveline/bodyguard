BADDIES_NEED_MAX = 3;
/**
 * Main "game" state. The hero is a bodyguard
 * protecting his targets from baddies coming
 * from everywhere.
 **/
function SceneState(levelName, stage, grid, magnifier) {
    this.projectiles = [];
    this.villains = [];
    this.generatedBaddies = 0;
    this.stage = stage;
    this.grid = grid;
    this.magnifier = magnifier;
    this.ready = false;
    
    this.loadLevel(levelName);
    this.preparePools();
}

SceneState.prototype.preparePools = function() {   
    var createBullet = function() {
        return new Bullet();
    }
    this.bulletPool = new ObjectPool(createBullet, 10);
    // TODO : add villain pool.
}

SceneState.prototype.allSet = function() {
    this.bodyguard = this.aHeroIsBorn(); 
    this.target = this.addTarget();
    // Test code : adding a villain
    this.generateVillain(new PIXI.Point(250,64));
    this.addToDisplayList(this.bodyguard);
    this.addToDisplayList(this.target);
    this.setMouseEvents();
    this.ready = true;
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

SceneState.prototype.update = function(elapsedTime) {
    this.bodyguard.update(this.grid.camera, elapsedTime, this.level);
    this.target.update(this.grid.camera, elapsedTime, this.level);
    this.grid.set_camera(this.bodyguard, elapsedTime, this.level);
    this.leadManagement();
    for (i in this.villains) {
        this.villains[i].update(this.grid.camera, elapsedTime, this.level);
    }
}

SceneState.prototype.checkIfNeedBaddies = function() {
    if (!this.needBaddies 
            && this.villains.length < BADDIES_NEED_MAX
            && this.generatedBaddies < this.generableBaddies ) {
        this.needBaddies = true;
    }
}

SceneState.prototype.leadManagement = function() {
    var toRemove = [];
    for (var i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].update(this.grid.camera, this.level);
        this.projectiles[i].checkCollision(this.villains);
        if (!this.projectiles[i].firing) { // This bird has flown
            toRemove.push(this.projectiles[i]);
        }
    }
    for (i in toRemove) {
        this.removeBullet(toRemove[i]);
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
        this.bodyguard.moveTo(mouseCoords);
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
    var projectile = this.bulletPool.borrow();
    projectile.fire(from, to);
    this.projectiles.push(projectile);
    this.addToDisplayList(projectile);
}

SceneState.prototype.removeBullet = function(bullet) {
    this.removeFromDisplayList(bullet);
    this.projectiles.splice(this.projectiles.indexOf(bullet), 1);
    this.bulletPool.giveBack(bullet);
}

/**
 * Generate a Hero.
 **/
SceneState.prototype.aHeroIsBorn = function() {
    var textures = getTextureArray("character", 6);
    // I'm blue, dabadee dabadoo
    var colorMatrix = [ .2,.2,0,0,
                        0,.2,1,0,
                        .5,0,0,1,
                        0,0,1,1];
    var hero = new Mover(textures, 16, 10
                        , new PIXI.Point(this.level.heroStartingPoint.x,this.level.heroStartingPoint.y), colorMatrix);
    return hero;
};

SceneState.prototype.addTarget = function() {
    var textures = getTextureArray("character", 6);
    // The reds are coming !
    var colorMatrix = [ .2,.2,.2,0,
                        .8,.8,.8,0,
                        .2,.2,.2,0,
                        .2,.2,1,1];
    var target = new Mover(textures, 16, 10
                        , new PIXI.Point(this.level.targetStartingPoint.x, this.level.targetStartingPoint.y), colorMatrix);
    return target;
}

SceneState.prototype.addToDisplayList = function(elem) {
    this.magnifier.addChild(elem);
}

SceneState.prototype.removeFromDisplayList = function(elem) {
    this.magnifier.removeChild(elem);
}

SceneState.prototype.generateVillain = function(position) {
    var textures = getTextureArray("character", 6);
    // The reds are coming !
    var colorMatrix = [ 1,1,1,0,
                        .2,.2,.2,0,
                        .2,.2,.2,0,
                        .2,.2,1,1];
    var villain = new Mover(textures, 16, 10, position, colorMatrix);
    var behaviour = new ShooterBehaviour(villain, this.level, this.target);
    villain.attachBehaviour(behaviour);
    this.villains.push(villain);
    this.addToDisplayList(villain);
}
