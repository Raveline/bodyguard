BADDIES_NEED_MAX = 3;
TIME_BETWEEN_BADDIES = 1800;
/**
 * Main "game" state. The hero is a bodyguard
 * protecting his targets from baddies coming
 * from everywhere.
 **/
function SceneState(levelName, stage, grid, magnifier) {
    this.projectiles = [];
    this.villains = [];
    this.livingBeings = [];
    this.bodyBags = [];
    this.generatedBaddies = 0;
    this.generableBaddies = 10;
    this.stage = stage;
    this.grid = grid;
    this.magnifier = magnifier;
    this.ready = false;
    this.finished = false;
    this.lost = false;
    this.loadLevel(levelName);
    this.preparePools();
    this.events = new EventPool();
    this.character_textures = getTextureArray("character", 6);
    this.villainGenerationCounter = 0;
}

SceneState.prototype.preparePools = function() {   
    var createBullet = function() {
        return new Bullet();
    }
    this.bulletPool = new ObjectPool(createBullet, 10);
    var createVillain = function() {
        var textures = getTextureArray("character", 6);
        var colorMatrix = [ 1,1,1,0,
            .2,.2,.2,0,
            .2,.2,.2,0,
            .2,.2,1,1];
        var villain = new Mover(textures, 16, 10, 1.3, new PIXI.Point(0,0), colorMatrix);
        return villain;
    }
    this.villainPool = new ObjectPool(createVillain, 20); // OK, frankly, not sure it's helpful here.
}

SceneState.prototype.allSet = function() {
    this.bodyguard = this.aHeroIsBorn(); 
    this.target = this.addTarget();
    // Test code : adding a villain
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
    this.villainGenerationCounter += elapsedTime;
    this.checkIfNeedBaddies();
    this.bodyguard.update(this.grid.camera, elapsedTime, this.level, this.events);
    this.target.update(this.grid.camera, elapsedTime, this.level, this.events);
    this.grid.set_camera(this.bodyguard, elapsedTime, this.level);
    this.eventsReading();
    this.baddiesManagement(elapsedTime);
    this.leadManagement();
    if (!this.target.alive) {
        this.lost = true;
        this.clean();
    }
    if (this.target.behaviour.current_status == ARRIVED) {
        this.finished = true;
        this.clean();
    }
    this.grid.update();
}

SceneState.prototype.eventsReading = function() {
    while (this.events.hasEvent()) {
        var current_event = this.events.readEvent();
        if (current_event.type == SHOOTING_EVENT) {
            this.addBulletTowards(current_event.subject, current_event.object);
        }
    }
}

SceneState.prototype.checkIfNeedBaddies = function() {
    // TODO : add time conditions
    if (this.villains.length < BADDIES_NEED_MAX
            && this.generatedBaddies < this.generableBaddies 
            && this.villainGenerationCounter > TIME_BETWEEN_BADDIES) {
        var randomIndex = Math.floor(Math.random()*this.level.villainsSpawners.length);
        var randomPosition = this.level.villainsSpawners[randomIndex];
        this.villainGenerationCounter = 0;
        this.addVillain(computeAbsolutePosition(randomPosition.x, randomPosition.y));
    }
}

SceneState.prototype.clean = function() {
    for (var i = this.magnifier.children.length-1; i > 0; i--) {
        this.magnifier.removeChild(this.magnifier.children[i]);
    }
}

SceneState.prototype.baddiesManagement = function(elapsedTime) {
    var toRemove = [];
    for (i in this.villains) {
        this.villains[i].update(this.grid.camera, elapsedTime, this.level, this.events);
        if (!this.villains[i].alive) {
            toRemove.push(this.villains[i]);
        }
    }
    for (i in this.bodyBags) {
        this.bodyBags[i].update(this.grid.camera, elapsedTime, this.level, this.events);
    }
    for (i in toRemove) {
        removeFromArray(this.villains, toRemove[i]);
        removeFromArray(this.livingBeings, toRemove[i]);
        this.bodyBags.push(toRemove[i]);
    }
}

SceneState.prototype.leadManagement = function() {
    var toRemove = [];
    for (var i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].update(this.grid.camera, this.level);
        this.projectiles[i].checkCollision(this.livingBeings);
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
        this.bodyguard.shoot(mouseCoords);
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
SceneState.prototype.addBulletTowards = function(shooter, to) {
    var projectile = this.bulletPool.borrow();
    projectile.fire(shooter, to);
    this.projectiles.push(projectile);
    this.addToDisplayList(projectile);
}

SceneState.prototype.removeBullet = function(bullet) {
    this.removeFromDisplayList(bullet);
    removeFromArray(this.projectiles, bullet);
    this.bulletPool.giveBack(bullet);
}

/**
 * Generate a Hero.
 **/
SceneState.prototype.aHeroIsBorn = function() {
    // I'm blue, dabadee dabadoo
    var colorMatrix = [ .2,.2,0,0,
                        0,.2,1,0,
                        .5,0,0,1,
                        0,0,1,1];
    var hero = new Mover(this.character_textures, 16, 10, 2 
                        , new PIXI.Point(this.level.heroStartingPoint.x,this.level.heroStartingPoint.y), colorMatrix);
    this.livingBeings.push(hero);
    return hero;
};

SceneState.prototype.addTarget = function() {
    // The reds are coming !
    var colorMatrix = [ .2,.2,.2,0,
                        .8,.8,.8,0,
                        .2,.2,.2,0,
                        .2,.2,1,1];
    var target = new Mover(this.character_textures, 16, 10, .7
                        , new PIXI.Point(this.level.targetStartingPoint.x, this.level.targetStartingPoint.y), colorMatrix);
    var behaviour = new TargetBehaviour(target, this.level);
    target.attachBehaviour(behaviour);
    this.livingBeings.push(target);
    return target;
}

SceneState.prototype.addToDisplayList = function(elem) {
    this.magnifier.addChild(elem);
}

SceneState.prototype.removeFromDisplayList = function(elem) {
    this.magnifier.removeChild(elem);
}

SceneState.prototype.addVillain = function(position) {
    var villain = this.villainPool.borrow();
    // Let's add a behaviour for this dude.
    var behaviour = new ShooterBehaviour(villain, this.level, this.target);
    villain.attachBehaviour(behaviour);
    // Let's make sure he's at the proper place.
    villain.absolute_position = position;
    this.generatedBaddies++;
    this.villains.push(villain);
    this.livingBeings.push(villain);
    this.addToDisplayList(villain);
}

SceneState.prototype.removeVillain = function(villain) {
    villain.alive = true;
    removeFromArray(this.villains, villain);
    this.villainPool.giveBack(villain);
}
