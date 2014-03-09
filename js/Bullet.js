function Bullet(from, to) {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage("img/bullet.png"));
    this.position.x = from.x;
    this.position.y = from.y;
    this.speed = 4;
    this.fire(to);
}
Bullet.constructor = Bullet;
Bullet.prototype = Object.create(PIXI.Sprite.prototype);

Bullet.prototype.fire = function(to) {
    this.direction = new Direction(this);
    this.direction.moveTowards(to.clone());
    this.direction.orientateTowards(to);
}

Bullet.prototype.update = function() {
    this.direction.step();
}
