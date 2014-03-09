
PIXI.Point.prototype.add = function(p) {
    this.x += p.x;
    this.y += p.y;
}

/** Vector functionalities for PIXI.Point **/
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

function Direction(obj) {
    this.obj = obj;
    this.velocity = new PIXI.Point(0,0);
}

Direction.prototype.moveTowards = function(dest) {
    this.destination = dest.clone();
    var moveVect = dest.substract(this.obj.position);
    this.velocity = moveVect.normalize();
    this.velocity.scale(this.obj.speed);
}

Direction.prototype.orientateTowards = function(dest) {
    var vect = dest.substract(this.obj.position);
    var angle = Math.atan2(vect.y, vect.x);
    this.obj.rotation = angle + 1.57079633;
}

Direction.prototype.step = function() {
    this.obj.position.add(this.velocity);
}

Direction.prototype.hasReachedDestination = function() {
    return this.destination.substract(this.obj.position).length() <= this.velocity.length();
}

Direction.prototype.reached = function() {
    this.obj.position = this.destination;
    this.velocity.x = 0;
    this.velocity.y = 0;
}
