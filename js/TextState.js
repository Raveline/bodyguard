// A Stage with just text
function TextStage(stage, text) {
    this.text = new PIXI.Text(text, { font : "16px Arial", fill:"white"});
    this.text.x = 10;
    this.text.y = 10;
    stage.addChild(this.text);
    this.ready = true;
}

TextStage.prototype.update = function() {}
TextStage.prototype.isFinished = function() { return false; } // TO INFINITY AND BEYOOOOND !
