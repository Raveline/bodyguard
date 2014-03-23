function CutSceneState(script, stage, magnifier) {
    this.ready = false;
    this.finished = false;
    this.stage = stage;
    this.loadScript(script);
    this.slide_index = 0;
    this.magnifier = magnifier;
    this.prepareCharacter();
    this.prepareText();
    this.setMouseEvents();
}

CutSceneState.prototype.prepareCharacter = function() {
    this.character = new PIXI.Sprite(this.loadFrame("bodyguard"));
    this.movingCharacter = true;
    this.magnifier.addChild(this.character);
}

CutSceneState.prototype.loadFrame = function(name) {
    return PIXI.Texture.fromFrame("img/" + name + ".png");
}

CutSceneState.prototype.prepareText = function() {
    this.text = new PIXI.Text("", {font: "10px Arial", fill:"white"});
    this.text.x = 4;
    this.text.y = 160;
    this.magnifier.addChild(this.text);
    this.text_index = -1;
}

CutSceneState.prototype.next = function() {
    if (this.movingCharacter) {
        // TODO : add some positions, for pictures movement.
        this.movingCharacter = false;
        this.character.x = 20;
    }
    if (!this.finished) {
        this.text_index++;
        if (this.text_index > this.current_slide.text.length-1) {
            this.newFrame();
        } else {
            this.newText();
        }
    }
}

CutSceneState.prototype.loadScript = function(scriptName) {
    var loader = new PIXI.JsonLoader("data/" + scriptName + ".json");
    loader.on('loaded', function(evt) {
        var data = evt.content.json;
        this.script = data;
        this.ready = true;
        this.current_slide = this.script.slides[0];
    }.bind(this));
    loader.load();
}

CutSceneState.prototype.newFrame = function() {
    this.slide_index++;
    if (this.slide_index < this.script.slides.length) {
        this.text_index = -1;
        this.current_slide = this.script.slides[this.slide_index];
        this.character.x = 0 - this.character.width;
        this.text.setText("");
        this.changeCharacter(this.current_slide.character);
    } else {
        this.finished = true;
    }
}

CutSceneState.prototype.changeCharacter = function(img) {
    this.movingCharacter = true;
    this.character.setTexture(this.loadFrame(img));
}

CutSceneState.prototype.newText = function() {
    this.text.setText(this.current_slide.text[this.text_index]);
}

CutSceneState.prototype.update = function(elapsedTime) {
    if (this.movingCharacter) {
        this.character.x += 4;
        if (this.character.x >= 20) {
            this.movingCharacter = false;
        }
    }
}

CutSceneState.prototype.setMouseEvents = function() {
    this.stage.click = this.mouseClicked.bind(this); 
}

CutSceneState.prototype.mouseClicked= function(mouseData) {
    event = mouseData.originalEvent;
    if (event.which === 3 || event.button === 2) {
        this.finished = true;
    } else {
        this.next();
    }
}
