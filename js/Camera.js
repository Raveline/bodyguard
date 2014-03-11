function Camera(x,y,w,h) {
    PIXI.Rectangle.call(this, x,y,w,h);
    this.offset = new PIXI.Point(0,0);
    this.offset_redux = new PIXI.Point(0,0);
}
Camera.constructor = Camera;
Camera.prototype = Object.create(PIXI.Rectangle.prototype);

Camera.prototype.setWorldMaximums = function(maxX, maxY) {
    this.maxX = maxX - this.w;
    this.maxY = maxY - this.h;
};

Camera.prototype.move = function(velocity) {
    console.log("Velocity of " + velocity.x + "," + velocity.y);
    console.log("Offset before : " + this.offset.x);
    if (this.x + velocity.x < 0) {
        this.offset.x += this.x - velocity.x;
        this.x = 0;
    } 
    if (this.x + velocity.y > this.maxX) {
        this.x = this.maxX;
    }
    if (this.y + velocity.y > this.maxY) {
        this.y = this.maxY;
    }
    if (velocity.x > 0) {
        var xmove = velocity.x;
        this.offset_redux.x = this.offset.x % xmove;
        console.log("Move : " + xmove);
        console.log("Refux : " + this.offset_redux.x);
        this.offset.x -= this.offset_redux.x;
        xmove -= this.offset.x;
        this.x += xmove;
    }
    /*if (this.y + velocity.y < 0) {
        this.offset.y += this.y - velocity.y;
        this.y = 0;
    } else if (velocity.y > 0) {
        var ymove = velocity.y;
        this.offset_redux.y = this.offset.y % ymove;
        this.offset.y -= this.offset_redux.y;
        ymove -= this.offset.y;
        this.y += velocity.y;
    }*/
    console.log("Offset after : " + this.offset.x);
}
