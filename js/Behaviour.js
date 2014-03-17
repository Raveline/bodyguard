BADDIES_NEED_MAX = 3;
DELTA = 1000;

/** The baddies brain is responsible for making baddies appear
 * and let them try to kill the target. **/
function BaddiesBrain(generableBaddies) {
    this.numberOfBaddies = 0;
    this.generatedBaddies = 0;
    this.generableBaddies = generableBaddies;
    this.inactiveBaddies = [];
    this.movingBaddies = [];
    this.aimingBaddies = [];
    this.needBaddies = false;
    this.tickTime = 0;
}


BaddiesBrain.prototype.tick = function(tick) {
    this.tickTime += tick;
    if (this.tickTime >= DELTA) {
        this.tickTime = 0;
        this.update();
    }
}

BaddiesBrain.prototype.update = function() {
    this.checkIfNeedBaddies();
    this.readyToFireBaddies();
    this.correctMovingBaddies();
    this.moveInactiveBaddies();
}

// Does the IA need more baddies ?
BaddiesBrain.prototype.checkIfNeedBaddies = function() {
    console.log("UPDATE !");
    if (!this.needBaddies 
            && this.numberOfBaddies < BADDIES_NEED_MAX
            && this.generatedBaddies < this.generableBaddies ) {
        this.needBaddies = true;
    }
}

BaddiesBrain.prototype.addNewBaddy = function(baddy) {
    this.inactiveBaddies.push[baddy];
}

BaddiesBrain.prototype.readyToFireBaddies = function() {
}

BaddiesBrain.prototype.correctMovingBaddies = function() {
}

BaddiesBrain.prototype.moveInactiveBaddies = function() {
}
