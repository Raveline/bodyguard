function Bullet() {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage("img/bullet.png"));
    this.speed = 4;
    this.firing = false;
}
Bullet.constructor = Bullet;
Bullet.prototype = Object.create(PIXI.Sprite.prototype);

Bullet.prototype.fire = function(from, to) {
    this.absolute_position = new PIXI.Point(from.x, from.y);
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
