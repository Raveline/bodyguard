var ANIM_MOVE = { animation : true, first : 1, last : 2, speedRatio : 0.025, loop : true, fire_event : false }
var ANIM_SHOOT = { animation : true, first : 3, last : 4, speedRatio : 0.075, loop : false, fire_event : true }
var STOPPED = { animation : false, first : 0, loop : true, fire_event : false }
var DEAD = { animation : false, first : 5, loop : true, fire_event : false }

function Mover(textures, width, height, speed, position, coloring) {
    PIXI.MovieClip.call(this, textures);
    this.width = width;
    this.height = height;
    this.anchor.x = .5;
    this.anchor.y = .5;

    this.speed = speed;

    this.position = position;
    this.absolute_position = position.clone();

    this.direction = new Direction(this);
    this.setColor(coloring);
    this.behaviour = 0;
    this.alive = true;
    this.animation = STOPPED;
    this.current_event = 0;
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
    this.setAnimatedFrame(ANIM_MOVE);
}

Mover.prototype.tickBehaviour = function(tick) {
    if (this.behaviour != 0) {
        this.behaviour.tick(tick);
    }
}

Mover.prototype.update = function(tick, lvl, events) {
    if (this.alive) {
        this.tickBehaviour(tick);
        this.direction.update(lvl);
        this.updateImage(events);
    }
}

Mover.prototype.display = function(camera) {
    this.position.x = this.absolute_position.x - camera.x;
    this.position.y = this.absolute_position.y - camera.y;
}

Mover.prototype.updateImage = function(events) {
    if (this.animation.animation) {
        if (this.currentFrame > this.animation.last) {
            if (this.animation.loop) {
                this.setAnimatedFrame(this.animation);
            } else {
                if (this.animation.fire_event) {
                    events.addEvent(this.current_event);
                }
                this.setFixedFrame(STOPPED);
            }
        }
    }
}

Mover.prototype.setFixedFrame = function(frame) {
    this.animation = frame;
    this.gotoAndStop(frame.first);
}

Mover.prototype.setAnimatedFrame = function(frame) {
    this.animation = frame;
    this.animationSpeed = this.speed * frame.speedRatio;
    this.gotoAndPlay(frame.first);
}

/**
 * Please note : target should be absolute coordinates.
 **/
Mover.prototype.shoot = function(target) {
    this.current_event = {type : SHOOTING_EVENT, subject : this };
    this.setAnimatedFrame(ANIM_SHOOT);
}

/**
 * Give the directional vector of the mover according to its position.
 */
Mover.prototype.getOrientationVector = function(target) {
    var real_angle = this.rotation - NINETY_DEGREES;
    return new PIXI.Point(Math.cos(real_angle), Math.sin(real_angle));
}

Mover.prototype.stopMoving = function() {
    this.setFixedFrame(STOPPED);
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
    this.direction.stop();
    this.setFixedFrame(DEAD);
    this.alive = false;
}

Mover.prototype.computeTilePosition = function() {
    return computeTilePosition(this.absolute_position.x, this.absolute_position.y);
}

Mover.prototype.isShooting = function() {
    return this.animation == ANIM_SHOOT;
}

/** Get the next position of this moving object,
 * used to help the IA aiming. **/
Mover.prototype.prospectivePosition = function() {
    if (this.direction.hasReachedDestination()) {
        return this.absolute_position;
    } else {
        var velo = this.direction.velocity.clone();
        velo.scale(6);
        var prospective = this.absolute_position.clone();
        prospective.add(velo);
        return prospective;
    }
}
