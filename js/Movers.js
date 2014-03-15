function Mover(textures, width, height, position, velocity, acceleration) {
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
}
Mover.constructor = Mover;
Mover.prototype = Object.create(PIXI.MovieClip.prototype);

Mover.prototype.setColor = function(matrix) {
    /* Exemple : blue color matrix 

    var colorMatrix = new PIXI.ColorMatrixFilter();
    colorMatrix.matrix = [ .2,.2,0,0,
                            0,.2,1,0,
                            .5,0,0,1,
                            0,0,1,1]; */

    this.filters = [matrix];
}

Mover.prototype.orientationTowards = function(lookingAt) {
    this.direction.orientateTowards(lookingAt);
}

Mover.prototype.moveTowards = function(moveTo) {
    this.direction.moveTowards(moveTo);
    this.gotoAndPlay(1);
}

Mover.prototype.update = function(camera, lvl) {
    if (this.currentFrame > 0) {
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
