// Various GUI utilities

POS_CENTER = 0;
POS_TOP = 1;
POS_BOTTOM = 2;

function GUIWindow(width, height, backcolor, strikecolor) {
    PIXI.DisplayObjectContainer.call(this);
    this.components = [];
    this.draw(width, height, backcolor, strikecolor);
    this.width = width;
    this.height = height;
}
GUIWindow.constructor = Window;
GUIWindow.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

GUIWindow.prototype.draw = function(width, height, backcolor, strikecolor) {
    var graphics = new PIXI.Graphics();
    graphics.beginFill(backcolor);
    graphics.lineStyle(1, strikecolor);
    graphics.drawRect(0,0,width,height);
    graphics.endFill();
    this.addChild(graphics);
}

/**
 * A very, very basic "layout manager".
 * Ypositioning is a constant (top, center or bottom). 
 * XTotal is the total number of components of the same line.
 * XIndex is the index of this particular component.
 * Size for x repartition will be computed by supposing that every component has the same size.
 * (Yeah, it's really basic, but I don't really need more than that !)
 */
GUIWindow.prototype.add = function(component, ypositioning, xtotal, xindex) {
    var x = 10 + (this.width - 20 - component.width)/(xtotal+1) * xindex;
    var y = 0;
    switch (ypositioning) {
        case POS_BOTTOM:
            y = 10 + this.height - component.height;
            break;

        case POS_TOP:
            y = 10;
            break;

        case POS_CENTER:
            y = (this.height - component.height) /2;
            break;
    }
    component.x = x;
    component.y = y;
    this.addChild(component);
}

function TextComponent(content, style) {
    PIXI.Text.call(this, content, style);
    this.updateText();
}
TextComponent.constructor = TextComponent;
TextComponent.prototype = Object.create(PIXI.Text.prototype);

function ButtonComponent(texture, action) {
    PIXI.Sprite.call(this, texture);
    this.setInteractive(true);
    this.click = action;
}
ButtonComponent.constructor = ButtonComponent;
ButtonComponent.prototype = Object.create(PIXI.Sprite.prototype);
