function CutSceneDialog(script, container) {
    SceneDialog.call(this, script, container);
    this.movingCharacter = true;
}
CutSceneDialog.constructor = SceneDialog;
CutSceneDialog.prototype = Object.create(SceneDialog.prototype);

CutSceneDialog.prototype.next = function() {
    if (this.movingCharacter) {
        // TODO : add some positions, for pictures movement.
        this.movingCharacter = false;
        this.character.x = 20;
    }
    if (!this.finished) {
        this.step();
    }
}

CutSceneDialog.prototype.prepareCharacter = function() {
    this.character = new PIXI.Sprite(this.loadFrame("bodyguard"));
    this.container.addChild(this.character);
}

CutSceneDialog.prototype.newFrame = function() {
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

CutSceneDialog.prototype.changeCharacter = function(img) {
    this.movingCharacter = true;
    this.character.setTexture(this.loadFrame(img));
}

CutSceneDialog.prototype.update = function(elapsedTime) {
    if (this.movingCharacter) {
        this.character.x += 4;
        if (this.character.x >= 20) {
            this.movingCharacter = false;
        }
    }
}
