function Main() {
    this.initRenderer(); // PIXI rendering
    this.loadAssets();  
    this.projectiles = [];
}

Main.prototype.initRenderer = function() {
    // Stage creation and appendage
    this.stage = new PIXI.Stage(0xFFFFFF);
    this.renderer = PIXI.autoDetectRenderer(800, 600);
    this.mousePosition = new PIXI.Point(0,0)
    document.body.appendChild(this.renderer.view);

    // Can I haz beautiful scaling ?
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; 
}

Main.prototype.loadAssets = function() {
    var assets = ["img/character.json", "img/bullet.png"];
    loader = new PIXI.AssetLoader(assets);
    loader.onComplete = this.assetsLoaded.bind(this);
    loader.load();
};

Main.prototype.assetsLoaded = function() {
    this.bodyguard = this.aHeroIsBorn(); 
    this.stage.addChild(this.bodyguard);

    this.stage.mousemove = this.mouseMoved.bind(this);
    this.stage.click = this.mouseClicked.bind(this);

    requestAnimFrame(this.update.bind(this));
};

Main.prototype.mouseMoved = function(mouseData) {
    this.mousePosition = mouseData.global;
    this.bodyguard.orientationTowards(this.mousePosition);
};

Main.prototype.mouseClicked = function(mouseData) {
    event = mouseData.originalEvent;
    if(event.which === 3 || event.button === 2) {
        this.addBulletTowards(this.bodyguard.position, mouseData.global);
        return false;
    } else {
        this.bodyguard.moveTowards(mouseData.global);
    }
}

Main.prototype.addBulletTowards = function(from, to) {
    var projectile = new Bullet(from, to);
    this.projectiles.push(projectile);
    this.stage.addChild(projectile);
}

Main.prototype.aHeroIsBorn = function() {
    var textures = getTextureArray("character", 4);
    var hero = new Mover(textures, 16, 10, new PIXI.Point(400,300), new PIXI.Point(0,0), new PIXI.Point(0,0));
    hero.scale.x = 2;
    hero.scale.y = 2;
    return hero;
};

Main.prototype.update = function() {
    requestAnimFrame(this.update.bind(this));
    this.renderer.render(this.stage);
    this.bodyguard.update();
    for (i in this.projectiles) {
        this.projectiles[i].update();
    }
};


/** TODO : extract this to a class, a util file, or under
a carpet. **/
function getTextureArray(prefixe, quantity) {
    var textures = [];
    for (var i = 1; i <= quantity; i++) {
        textures.push(PIXI.Texture.fromFrame(prefixe + i)); // Ugly as fuck
    }
    return textures;
}
