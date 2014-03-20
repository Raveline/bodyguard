function Mover(textures, width, height, position, coloring) {
    PIXI.MovieClip.call(this, textures);
    this.width = width;
    this.height = height;
    this.anchor.x = .5;
    this.anchor.y = .5;

    this.speed = 3; // CONSTANT

    this.animationSpeed = .05;

    this.position = position;
    this.absolute_position = position.clone();

    this.direction = new Direction(this);
    this.setColor(coloring);
    this.behaviour = 0;
    this.alive = true;
}
Mover.constructor = Mover;
Mover.prototype = Object.create(PIXI.MovieClip.prototype);

Mover.prototype.attachBehaviour = function(behaviour) {
    this.behaviour = behaviour;
}

Mover.prototype.setColor = function(matrix) {
    var colorMatrix = new PIXI.ColorMatrixFilter();
    colorMatrix.matrix = matrix;

    this.filters = [colorMatrix];
}

Mover.prototype.orientationTowards = function(lookingAt) {
    this.direction.orientateTowards(lookingAt);
}

Mover.prototype.moveTo = function(moveTo) {
    this.direction.moveTo(moveTo);
    this.gotoAndPlay(1);
}

Mover.prototype.update = function(camera, tick, lvl) {
    if (this.behaviour != 0 && this.alive) {
        this.behaviour.tick(tick);
    }
    if (this.currentFrame > 0 && this.alive) {
        if (this.direction.hasReachedDestination()) {
            this.stopMoving();
        }
        else {
            this.direction.step(lvl);
            this.updateImage();
        }
    }
    this.position.x = this.absolute_position.x - camera.x;
    this.position.y = this.absolute_position.y - camera.y;
}

Mover.prototype.updateImage = function() {
    if (this.currentFrame > 2) {
        this.gotoAndPlay(1);
    }
}

Mover.prototype.stopMoving = function() {
    this.direction.reached();
    this.gotoAndStop(0);
}

Mover.prototype.mustBeRendered = function(camera) {
    return this.absolute_position.isInside(camera);
}

Mover.prototype.testHit = function (projectile) {
    return projectile.absolute_position.x >= this.direction.realX()
        && projectile.absolute_position.x <= this.direction.realX2()
        && projectile.absolute_position.y >= this.direction.realY()
        && projectile.absolute_position.y <= this.direction.realY2();
}

Mover.prototype.hurt = function() {
    this.gotoAndStop(5);
    this.direction.stop();
    this.alive = false;
}

Mover.prototype.computeTilePosition = function() {
    return computeTilePosition(this.absolute_position.x, this.absolute_position.y);
}
