function SceneDialog(script, container) {
    this.finished = false;
    this.script = script;
    this.container = container;
    this.slide_index = 0;
    this.text_index = 0;
    this.current_slide = this.script[0];
    this.prepareCharacter();
    this.positionCharacter();
    this.prepareText();
    this.positionText();
}

SceneDialog.prototype.loadFrame = function(name) {
    return PIXI.Texture.fromFrame("img/" + name + ".png");
}

SceneDialog.prototype.prepareCharacter = function() {
    this.character = new PIXI.Sprite(this.loadFrame(this.readCharacter()));
    this.container.addChild(this.character);
}


SceneDialog.prototype.next = function() {
    if (!this.finished) {
        this.step();
    }
}

SceneDialog.prototype.step = function() {
    this.text_index++;
    if (this.text_index > this.current_slide.text.length-1) {
        this.newFrame();
        this.newText();
    } else {
        this.newText();
    }
}

SceneDialog.prototype.newText = function() {
    this.text.setText(this.current_slide.text[this.text_index]);
}

SceneDialog.prototype.newFrame = function() {
    this.slide_index++;
    if (this.slide_index < this.script.length) {
        this.text_index = 0;
        this.current_slide = this.script[this.slide_index];
        this.changeCharacter(this.readCharacter());
    } else {
        this.finished = true;
    }
}

SceneDialog.prototype.changeCharacter = function(img) {
    this.character.setTexture(this.loadFrame(img));
}

SceneDialog.prototype.takeMouseEvents = function(stage) {
    stage.click = this.mouseClicked.bind(this); 
}

SceneDialog.prototype.mouseClicked= function(mouseData) {
    event = mouseData.originalEvent;
    if (event.which === 3 || event.button === 2) {
        this.finished = true;
    } else {
        this.next();
    }
}
