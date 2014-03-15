/** Extending PIXI.Point so it gives us vectorial utils **/
PIXI.Point.prototype.add = function(p) {
    this.x += p.x;
    this.y += p.y;
}

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

PIXI.Point.prototype.isInside = function(r) {
    return this.x >= r.x 
    && this.x <= r.x+r.w
    && this.y >= r.y 
    && this.y <= r.y+r.h;
}

function Direction(obj) {
    this.obj = obj;
    this.velocity = new PIXI.Point(0,0);
    this.step_numbers = 0;
}

Direction.prototype.moveTowards = function(dest) {
    this.destination = dest.clone();
    var moveVect = dest.substract(this.obj.absolute_position);
    var lengthMove = moveVect.length();
    this.velocity = moveVect.normalize();
    this.velocity.scale(this.obj.speed);
    this.step_numbers = ~~(lengthMove / this.velocity.length());
}

Direction.prototype.orientateTowards = function(dest) {
    var vect = dest.substract(this.obj.absolute_position);
    var angle = Math.atan2(vect.y, vect.x);
    this.obj.rotation = angle + 1.57079633;
}

Direction.prototype.step = function(lvl) {
    this.obj.absolute_position.add(this.velocity);
    if (this.test_new_position(lvl)) {
        this.step_numbers--;
    } else {
        this.obj.absolute_position = this.obj.absolute_position.substract(this.velocity);
        this.destination = this.obj.absolute_position;
        this.reached();
    }
}

Direction.prototype.test_new_position = function(lvl) {
    var x = ~~(this.obj.absolute_position.x / TILE_SIZE);
    var y = ~~(this.obj.absolute_position.y / TILE_SIZE);

    var x2 = ~~((this.obj.absolute_position.x + (this.obj.width/2)) / TILE_SIZE);
    var y2 = ~~(this.obj.absolute_position.y / TILE_SIZE);

    var x3 = ~~(this.obj.absolute_position.x / TILE_SIZE);
    var y3 = ~~((this.obj.absolute_position.y + (this.obj.height/2)) / TILE_SIZE);

    var x4 = ~~((this.obj.absolute_position.x + (this.obj.width/2)) / TILE_SIZE);
    var y4 = ~~((this.obj.absolute_position.y + (this.obj.height/2)) / TILE_SIZE);

    return this.is_position_valid(lvl, x, y)
        && this.is_position_valid(lvl, x2,y2)
        && this.is_position_valid(lvl, x3,y3)
        && this.is_position_valid(lvl, x4,y4);
}

Direction.prototype.is_position_valid = function(lvl,x,y) {
    if (x >= 0 && y >= 0 && y < lvl.length && x < lvl[0].length) {
        return lvl[y][x].block == 0;
    }
    return false;
}

Direction.prototype.hasReachedDestination = function() {
    return this.step_numbers == 0;
}

Direction.prototype.reached = function() {
    this.obj.absolute_position = this.destination;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.step_numbers = 0;
}

Direction.prototype.computeTilePosition = function() {
    return new PIXI.Point(~~(this.obj.absolute_position.x / TILE_SIZE),
                        ~~(this.obj.absolute_position.y / TILE_SIZE));
}
