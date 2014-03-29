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
    this.current_dialog = 0; // I hate "undefined"
    this.ready = false;
    this.lastWording = false;
    this.loadLevel(levelName);
    this.preparePools();
    this.events = new EventPool();
    this.character_textures = getTextureArray("character", 6);
    this.villainGenerationCounter = 0;
    this.destination = SCENE_NOT_FINISHED;
}

SceneState.prototype.showLastWords = function(sub_string, main_string) {
    var windo = new GUIWindow(~~(SCREEN_REAL_WIDTH/1.2), SCREEN_REAL_HEIGHT/2, 0x000000, 0xFFFFFF);
    windo.add(new TextComponent(sub_string, { font :"10px Arial", fill:"white", stroke:"black", strokeThickness: 4}), POS_TOP, 1,1);
    windo.add(new TextComponent(main_string, {font : "14px Arial", fill:"white", stroke:"black", strokeThickness: 7}), POS_CENTER, 1,1);
    windo.add(new ButtonComponent(PIXI.Texture.fromFrame("img/replay.png"), 
                function (e) { 
                    this.destination = REPLAY_SCENE 
                }.bind(this))
            , POS_BOTTOM, 1,1);
    windo.x = (SCREEN_REAL_WIDTH - windo.width) / 2;
    windo.y = (SCREEN_REAL_HEIGHT - windo.height) / 2;
    this.magnifier.addChild(windo);
    this.unsetMouseEvents();
    this.lastWording = true;
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
    this.boss = this.addBoss();
    this.addToDisplayList(this.bodyguard);
    this.addToDisplayList(this.target);
    if (this.level.bossIsAlwaysHere) {
        this.addToDisplayList(this.boss);
    }
    this.setMouseEvents();
    this.enterDialog(this.level.initial);
    this.ready = true;
}

SceneState.prototype.enterDialog = function(dialog) {
    for (i in this.livingBeings) {
        this.livingBeings[i].freeze();
    }
    this.unsetMouseEvents();
    this.current_dialog = new ActionSceneDialog(dialog, this.stage);
    this.current_dialog.takeMouseEvents(this.stage);
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

/**
 * Update and display the current scene. For now, we don't really treat those on different
 * clocks, but that might be a better way of handling it.
 * This function deals with 3 situation :
 * - "Last words" : do nothing but display.
 * - Normal, "in game" situation : update the action.
 * - Dialogs, "scenario" situation : only update camera to follow dialog.
 * This could have been handled via yet another state automaton, but if we have no other case
 * to handle, that would be a bit of over-engineering.
 * However, let's make sure this function stays simple to read - hence the no-bracket style
 * for the if. */
SceneState.prototype.update = function(elapsedTime) {
    if (!this.lastWording && this.current_dialog == 0) 
        this.updateAction(elapsedTime);
    else if (this.current_dialog != 0)
        this.handleDialog(elapsedTime);
    // Whatever happens, run the display
    this.display();
}

/**
 * Make sure we center in case of dialog.
 */
SceneState.prototype.handleDialog = function(elapsedTime) {
    var center = 0;
    switch (this.current_dialog.getCenter()) {
        case CENTER_TARGET:
            center = this.target;
            break;

        case CENTER_BODYGUARD:
            center = this.bodyguard;
            break;

        case CENTER_BOSS:
            center = this.boss;
            break;
    }
    // Update the grid to follow camera
    this.grid.set_camera(center, elapsedTime, this.level);
    this.grid.needRendering = true; // Manual override for this, since we normally work on movement from the center.
    this.grid.update();
    // And finally, check if we're still in dialog mode
    if (this.current_dialog.finished) {
        this.setMouseEvents(); // Take back the mouse
        this.current_dialog = 0;
        for (var i in this.livingBeings[i]) {
            this.livingBeings[i].unfreeze();
        }
    }
}

SceneState.prototype.display = function() {
    for (i in this.livingBeings) {
        this.livingBeings[i].display(this.grid.camera);
    }
    for (i in this.bodyBags) {
        this.bodyBags[i].display(this.grid.camera);
    }
}

SceneState.prototype.updateAction = function(elapsedTime) {
    this.checkIfNeedBaddies(elapsedTime);
    this.bodyguard.update(elapsedTime, this.level, this.events);
    this.target.update(elapsedTime, this.level, this.events);
    this.boss.update(elapsedTime, this.level, this.events);
    this.grid.set_camera(this.bodyguard, elapsedTime, this.level);
    this.eventsReading();
    this.baddiesManagement(elapsedTime);
    this.leadManagement();
    this.checkEndConditions();
    this.grid.update();
}

SceneState.prototype.checkEndConditions = function() {
    if (!this.target.alive || !this.bodyguard.alive) {
        this.clean();
        if (!this.target.alive) {
            this.showLastWords("Target died !", "YOU LOST !");
        } else {
            this.showLastWords("You died !", "YOU LOST !");
        }
    }
    if (this.target.behaviour.current_status == ARRIVED) {
        this.clean();
        this.showLastWords("Target reached destination !", "YOU WON !");
    }
}

SceneState.prototype.eventsReading = function() {
    while (this.events.hasEvent()) {
        var current_event = this.events.readEvent();
        if (current_event.type == SHOOTING_EVENT) {
            this.addBulletTowards(current_event.subject, current_event.subject.getOrientationVector());
        }
    }
}

SceneState.prototype.checkIfNeedBaddies = function(elapsedTime) {
    this.villainGenerationCounter += elapsedTime;
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
        this.villains[i].update(elapsedTime, this.level, this.events);
        if (!this.villains[i].alive) {
            toRemove.push(this.villains[i]);
        }
    }
    for (i in this.bodyBags) {
        this.bodyBags[i].update(elapsedTime, this.level, this.events);
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

// When delegating to a sub-state, deregister events.
SceneState.prototype.unsetMouseEvents = function() {
    this.stage.mousemove = function() {};
    this.stage.click = function() {};
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

SceneState.prototype.isFinished = function() {
    return this.destination != SCENE_NOT_FINISHED;
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

SceneState.prototype.addBoss = function() {
    // Deep Purple
    var colorMatrix = [ .8,.8,.8,0,
                        .2,.2,.2,0,
                        .8,.8,.8,0,
                        .2,.2,1,1];
    var boss = new Mover(this.character_textures, 16, 10, 2.3, new PIXI.Point(this.level.bossPosition.x, this.level.bossPosition.y), colorMatrix);
    var behaviour = new BossBehaviour(boss, this.level, this.target);
    boss.attachBehaviour(behaviour);
    this.livingBeings.push(boss);
    return boss;
}
