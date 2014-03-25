function CutSceneState(script, stage, magnifier) {
    this.ready = false;
    this.finished = false;
    this.stage = stage;
    this.magnifier = magnifier;
    this.loadScript(script);
}

CutSceneState.prototype.loadScript = function(scriptName) {
    var loader = new PIXI.JsonLoader("data/" + scriptName + ".json");
    loader.on('loaded', function(evt) {
        var data = evt.content.json;
        this.dialog = new CutSceneDialog(data.slides, this.magnifier);
        this.dialog.takeMouseEvents(this.stage);
        this.ready = true;
    }.bind(this));
    loader.load();
}

CutSceneState.prototype.update = function(elapsedTime) {
    this.dialog.update(elapsedTime);
}

CutSceneState.prototype.isFinished = function() {
    return this.dialog.finished;
}
