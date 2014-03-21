function Bullet() {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage("img/bullet.png"));
    this.speed = 4;
    this.firing = false;
}
Bullet.constructor = Bullet;
Bullet.prototype = Object.create(PIXI.Sprite.prototype);

Bullet.prototype.fire = function(shooter, to) {
    var dist = 17; // constant hypotenuse length for a (-4, -1) vector.
    var x = dist * Math.cos(shooter.rotation - 1.57079633);
    var y = dist * Math.sin(shooter.rotation - 1.57079633);
    x+= shooter.absolute_position.x;
    y+= shooter.absolute_position.y;
    console.log(x,y);
    this.absolute_position = new PIXI.Point(x,y);
    this.direction = new Direction(this);
    this.direction.moveTowards(to);
    this.direction.orientateTowards(to);
    this.firing = true;
}

Bullet.prototype.update = function(camera, lvl) {
    this.position.x = this.absolute_position.x - camera.x;
    this.position.y = this.absolute_position.y - camera.y;
    this.direction.step(lvl);
    if (this.direction.hasReachedDestination()) {
        this.firing = false;
    }
}

Bullet.prototype.checkCollision = function(people) {
    for (i in people) {
        if (people[i].testHit(this)) {
            people[i].hurt();
            this.firing = false;
        }
    }
}

Bullet.prototype.stopMoving = function() {
    this.firing = false;
}
