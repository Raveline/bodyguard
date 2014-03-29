CENTER_BODYGUARD = 0;
CENTER_TARGET = 1;
CENTER_BOSS = 2;

function ActionSceneDialog(script, container, callback) {
    SceneDialog.call(this, script, container);
    this.centers = [];
    this.centers["bodyguard"] = CENTER_BODYGUARD;
    this.centers["target"] = CENTER_TARGET;
    this.centers["boss"] = CENTER_BOSS;
    this.callback = callback; // Called at the end of the dialog
}
ActionSceneDialog.constructor = ActionSceneDialog;
ActionSceneDialog.prototype = Object.create(SceneDialog.prototype);

ActionSceneDialog.prototype.prepareText = function() {
    this.text = new PIXI.Text("", {font: "18px Arial", fill:"white"});
    this.banner = this.getBanner();
    this.container.addChild(this.banner);
    this.container.addChild(this.text);
    this.text_index = 0;
    this.newText();
}

ActionSceneDialog.prototype.getBanner = function() {
    var graphics = new PIXI.Graphics();
    var x2 = SCREEN_WIDTH - this.character.width;
    var y2 = SCREEN_HEIGHT;
    graphics.beginFill(0x000000);
    graphics.drawRect(0,0,x2,y2);
    graphics.endFill();
    return graphics;
}

ActionSceneDialog.prototype.positionCharacter = function() {
    this.character.x = 0;
    this.character.y = SCREEN_HEIGHT - this.character.height;
}

ActionSceneDialog.prototype.positionText = function() {
    this.text.x = this.character.x + this.character.width + 5;
    this.text.y = this.character.y + this.character.height / 2;
    this.banner.x = this.character.x + this.character.width;
    this.banner.y = this.character.y;
}

ActionSceneDialog.prototype.readCharacter = function() {
    return this.current_slide.character.img;
}

ActionSceneDialog.prototype.getCenter = function() {
    return this.centers[this.current_slide.character.center];
}

ActionSceneDialog.prototype.clean = function() {
    this.container.removeChild(this.text);
    this.container.removeChild(this.character);
    this.container.removeChild(this.banner);
    if (this.callback) {
        this.callback();
    }
}
