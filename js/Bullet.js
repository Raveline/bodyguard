function Bullet(from, to) {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage("img/bullet.png"));
    this.absolute_position = new PIXI.Point(from.x, from.y);
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

Bullet.prototype.update = function(camera, lvl) {
    this.position.x = this.absolute_position.x - camera.x;
    this.position.y = this.absolute_position.y - camera.y;
    this.direction.step(lvl);
}
