DODGING = 10;
ARRIVED = 11;

function TargetBehaviour(obj, level) {
    Behaviour.call(this, obj, level);
    this.totalTime = level.levelLength;
    this.finalDestination = level.targetEndingPoint;
    this.moveToDestination();
    this.waitingTime = 0;
}
TargetBehaviour.constructor = TargetBehaviour;
TargetBehaviour.prototype = Object.create(Behaviour.prototype);

TargetBehaviour.prototype.update = function() {
    switch (this.current_status) {
        case INACTIVE:
            this.correctMove();
            break;

        case MOVING:
            this.correctMove();
            break;

        case DODGING:
            this.dodge();

        case ARRIVED:
            // do nothing !
            break;
    }
}

/**
 * The target should make pauses. Depending on the situation and the level,
 * it could be to engage with a bystander, or to watch the scenery, etc.
 * No idea how to spread those pauses, though. For now, it's just a random
 * choice, with a maximum amount of pauses.
 */
TargetBehaviour.prototype.correctMove = function() {
    var stepsToDestination = this.manhattan(this.obj.computeTilePosition(), this.finalDestination);
    var timeToTake = this.totalTime - stepsToDestination;
    // Around 25% chances of waiting
    if (timeToTake > 0 && Math.random()*2 > 1.5) {
        this.current_status = INACTIVE;
        this.waitingTime = Math.ceil(Math.random() * stepsToDestination);
    } else if(this.path.length > 0) {
        this.updateDirection();
    } else {
        this.current_status = ARRIVED;
    }
}

TargetBehaviour.prototype.wait = function() {
    this.waitingTime--;
    if (this.waitingTime == 0) {
        this.current_status = MOVING;
    }
}

TargetBehaviour.prototype.updateDirection = function() {
    var dest = this.path.pop();
    var absoluteDest = computeAbsolutePosition(dest.y, dest.x);
    this.obj.orientationTowards(absoluteDest);
    this.obj.moveTo(absoluteDest);
}

TargetBehaviour.prototype.moveToDestination = function() {
    var path = this.getPath(this.obj.computeTilePosition(), this.finalDestination);
    this.current_status = MOVING;
    this.path = path.reverse();
    this.correctMove();
}
