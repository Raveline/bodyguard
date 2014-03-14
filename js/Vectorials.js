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

Direction.prototype.step = function() {
    this.obj.absolute_position.add(this.velocity);
    this.step_numbers--;
}

Direction.prototype.hasReachedDestination = function() {
    return this.step_numbers == 0;
}

Direction.prototype.reached = function() {
    this.obj.absolute_position = this.destination;
    this.velocity.x = 0;
    this.velocity.y = 0;
}
