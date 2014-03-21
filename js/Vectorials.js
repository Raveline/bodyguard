MARGIN = 5;
/**
 * This module :
 * - Extends PIXI.Point so it gives us vectorial utilities.
 * - Gives the Direction class, that handles any moving object
 *   moves, direction and positions related issues.
 * - Provide local-to-global, global-to-local, tile-related
 *   utils.
 **/

// **** PIXI POINT ADD-ON ****


PIXI.Point.prototype.add = function(p) {
    this.x += p.x;
    this.y += p.y;
}

// Vector substraction. (BEWARE : return new object)
// TODO: (Must have been high on coffee when I did that,
// fix and modify current point.)
PIXI.Point.prototype.substract = function(p) {
    var x = this.x - p.x;
    var y = this.y - p.y;
    return new PIXI.Point(x,y);
};

PIXI.Point.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

PIXI.Point.prototype.normalize = function(p) {
    var len = this.length();
    if (len == 0) {
        return new PIXI.Point(0,0);
    }
    else {
        return new PIXI.Point(this.x / len, this.y / len);
    }
};

PIXI.Point.prototype.scale = function(s) {
    this.x *= s;
    this.y *= s;
}

// Check if a point is inside a rectangle.
// TODO : "w" ? Shouldn't this be width ? Test.
PIXI.Point.prototype.isInside = function(r) {
    return this.x >= r.x 
    && this.x <= r.x+r.w
    && this.y >= r.y 
    && this.y <= r.y+r.h;
}

// **** DIRECTION CLASS ****
function Direction(obj) {
    // The object whowe direction we will manage.
    this.obj = obj;
    // Velocity of movement.
    this.velocity = new PIXI.Point(0,0);
    // Number of steps till end of current move.
    this.step_numbers = 0;
}

// Make a moving object move to a given destination
Direction.prototype.moveTo = function(dest) {
    this.destination = dest.clone();
    var moveVect = dest.substract(this.obj.absolute_position);
    var lengthMove = moveVect.length();
    this.velocity = moveVect.normalize();
    this.velocity.scale(this.obj.speed);
    this.step_numbers = ~~(lengthMove / this.velocity.length());
}

// Make a moving object take a hike towards somewhere.
Direction.prototype.moveTowards = function(dest) {
    this.destination = dest.clone();
    var moveVect = dest.substract(this.obj.absolute_position);
    this.velocity = moveVect.normalize();
    this.velocity.scale(this.obj.speed);
    this.step_number = 10000; // Ugly hack so move won't stop. TODO : find a cleaner way to do this.
}

// Rotate an object towards a given direction.
Direction.prototype.orientateTowards = function(dest) {
    var vect = dest.substract(this.obj.absolute_position);
    var angle = Math.atan2(vect.y, vect.x);
    // Caveat : objects are "by default" drawn facing "north",
    // but rotation starts at 1,1, so we need to correct thusly.
    this.obj.rotation = angle + 1.57079633;
}

Direction.prototype.update = function(level) {
    if (!this.hasReachedDestination()) {
        this.step(level);
    }
}

// Make a step in the current direction.
// Check if the step is legal.
// Check if we're done with movement.
Direction.prototype.step = function(level) {
    this.obj.absolute_position.add(this.velocity);
    if (this.test_new_position(level)) {
        this.step_numbers--;
        if (this.step_numbers == 0) {
            this.stop();
        }
    } else {
        this.obj.absolute_position = this.obj.absolute_position.substract(this.velocity);
        this.stop();
    }
}

Direction.prototype.stop = function() {
    this.destination = this.obj.absolute_position;
    this.reached();
}

// Check if position is "legal".
// 4-sides collision checking.
Direction.prototype.test_new_position = function(level) {
    var x = ~~ ( (this.realX() + MARGIN) / TILE_SIZE);
    var y = ~~ ( (this.realY() + MARGIN) / TILE_SIZE);

    var x2 = ~~( (this.realX2() - MARGIN) / TILE_SIZE);
    var y2 = ~~( (this.realY() + MARGIN) / TILE_SIZE);

    var x3 = ~~( (this.realX() + MARGIN) / TILE_SIZE);
    var y3 = ~~( (this.realY2() - MARGIN) / TILE_SIZE);

    var x4 = ~~( (this.realX2() - MARGIN) / TILE_SIZE);
    var y4 = ~~( (this.realY2() - MARGIN) / TILE_SIZE);

    return this.is_position_valid(level, x, y)
        && this.is_position_valid(level, x2,y2)
        && this.is_position_valid(level, x3,y3)
        && this.is_position_valid(level, x4,y4);
}

// Check if a given position (in tile) is walkable.
Direction.prototype.is_position_valid = function(level,x,y) {
    if (x >= 0 && y >= 0 && y < level.height && x < level.width) {
        return level.isWalkable(x,y);
    }
    return false;
}

// Check if we've accomplished all necessary steps.
Direction.prototype.hasReachedDestination = function() {
    return this.step_numbers == 0;
}

// When destination has been reached :
// - Position should be equal to destination.
// - Velocity should be reduced to 0.
// - Step count should be reduced to 0.
Direction.prototype.reached = function() {
    this.obj.absolute_position = this.destination;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.step_numbers = 0;
    this.obj.stopMoving();
}

Direction.prototype.realX = function() {
    return this.obj.absolute_position.x - this.obj.width/2;
}

Direction.prototype.realY = function() {
    return this.obj.absolute_position.y - this.obj.height/2;
}

Direction.prototype.realX2 = function() {
    return this.obj.absolute_position.x + this.obj.width/2;
}

Direction.prototype.realY2 = function() {
    return this.obj.absolute_position.y + this.obj.height/2;
}

/**
 * Given the related object absolute position, compute its
 * current tile.
 **/
function computeTilePosition(x,y) {
    return new PIXI.Point(numberToTile(x),
                        numberToTile(y));
}

/**
 * Given a position in tiles, compute the corresponding
 * absolute position.
 **/
function computeAbsolutePosition(x,y) {
    return new PIXI.Point((x * TILE_SIZE) + TILE_SIZE/2, (y * TILE_SIZE) + TILE_SIZE/2);
}

function numberToTile(n) {
    return ~~(n / TILE_SIZE);
}
