function Camera(x,y,w,h) {
    PIXI.Rectangle.call(this, x,y,w,h);
    this.offset = new PIXI.Point(0,0);
    this.offset_redux = new PIXI.Point(0,0);
    this.focus = new PIXI.Rectangle(w/2, h/2, 0,0);
}
Camera.constructor = Camera;
Camera.prototype = Object.create(PIXI.Rectangle.prototype);

Camera.prototype.setWorldMaximums = function(maxX, maxY) {
    this.maxX = maxX - this.width;
    this.maxY = maxY - this.height;
};

Camera.prototype.move = function(center) {
    var oldx = this.x;
    var oldy = this.y;
    minx =  this.x + this.focus.x;
    miny = this.y + this.focus.y;
    maxx = minx + this.focus.width;
    maxy = miny + this.focus.height;
    if (center.absolute_position.x < minx) {
        this.x -= (minx - center.absolute_position.x);
    }
    if (center.absolute_position.y < miny) {
        this.y -= (miny - center.absolute_position.y);
    }
    if (center.absolute_position.x > maxx) {
        this.x += (center.absolute_position.x - maxx);
    }
    if (center.absolute_position.y > maxy) {
        this.y += (center.absolute_position.y - maxy);
    }
    this.clamp();
    return oldx != this.x || oldy != this.y;
}

Camera.prototype.clamp = function() {
    if (this.x <0) {
        this.x = 0;
    }
    if (this.y < 0) {
        this.y = 0;
    }
    if (this.x > this.maxX) {
        this.x = this.maxX;
    }
    if (this.y > this.maxY) {
        this.y = this.maxY;
    }
}
