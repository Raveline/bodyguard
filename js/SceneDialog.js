function SceneDialog(script, container) {
    this.finished = false;
    this.script = script;
    this.container = container;
    this.slide_index = 0;
    this.current_slide = this.script.slides[0];
    this.prepareCharacter();
    this.prepareText();
}

SceneDialog.prototype.loadFrame = function(name) {
    return PIXI.Texture.fromFrame("img/" + name + ".png");
}

CutSceneState.prototype.prepareCharacter = function() {
    this.character = new PIXI.Sprite(this.loadFrame("bodyguard"));
    this.container.addChild(this.character);
}

SceneDialog.prototype.prepareText = function() {
    this.text = new PIXI.Text("", {font: "10px Arial", fill:"white"});
    this.text.x = 4;
    this.text.y = 160;
    this.container.addChild(this.text);
    this.text_index = -1;
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
    } else {
        this.newText();
    }
}

SceneDialog.prototype.newText = function() {
    this.text.setText(this.current_slide.text[this.text_index]);
}

SceneDialog.prototype.newFrame = function() {
    this.slide_index++;
    if (this.slide_index < this.script.slides.length) {
        this.text_index = -1;
        this.current_slide = this.script.slides[this.slide_index];
        this.text.setText("");
        this.changeCharacter(this.current_slide.character);
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
