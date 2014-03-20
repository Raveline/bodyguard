DODGING = 10;

function TargetBehaviour(obj, level, totalTime, finalDestination) {
    Behaviour.call(this, obj, level);
    this.current_status = INACTIVE;
    this.wait_time = 0;
    this.finalDestination = finalDestination;
}
TargetBehaviour.constructor = TargetBehaviour;
TargetBehaviour.prototype = Object.create(Behaviour.prototype);

TargetBehaviour.prototype.update = function() {
    switch (this.current_status) {
        case INACTIVE:
            this.moveToDestination();
            break;

        case MOVING:
            this.correctMove();
            break;

        case DODGING:
            this.dodge();
    }
}

/**
 * We recompute move if the target has moved too much.
 * Then, if we've stopped a general direction movement, we check :
 * - If firing is possible, aim and shoot.
 * - If we've reached our path and there is nothing left to do, which
 *   normally should not happen !, we take a pause and we'll recompute
 *   a path next time.
 * - Else we just compute our new direction to our destination.
 * If we're just moving, we do nothing.
 */
TargetBehaviour.prototype.correctMove = function() {
    if (this.isDestinationTooFarFromTarget(this.path[0])) {
        this.moveToTarget();
    } else if (this.obj.direction.hasReachedDestination()) {
        if (this.hasAShot()) {
            this.aimingMode();
        } else if (this.path.length == 0) {
            this.giveTimeToThink();
        } else {
            // Are we done in our current direction ?
            this.updateDirection();
        } 
    }
}

TargetBehaviour.prototype.updateDirection = function() {
    var dest = this.path.pop();
    var absoluteDest = computeAbsolutePosition(dest.y, dest.x);
    this.obj.orientationTowards(absoluteDest);
    this.obj.moveTo(absoluteDest);
}

TargetBehaviour.prototype.moveToDestination = function() {
    var path = this.level.computePath(this.obj.computeTilePosition(), this.target.finalDestination);
    this.current_status = MOVING;
    this.path = path.reverse();
    this.correctMove();
}
