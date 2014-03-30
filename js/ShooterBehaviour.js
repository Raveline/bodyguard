AIMING = 3;
SHOOTING = 4;
AIMING_DISTANCE = 6;
CORRECTING_PATH_DISTANCE = 4;

function ShooterBehaviour(obj, level, target) {
    Behaviour.call(this, obj, level);
    this.target = target;
    this.current_status = INACTIVE;
}
ShooterBehaviour.constructor = ShooterBehaviour;
ShooterBehaviour.prototype = Object.create(Behaviour.prototype);

ShooterBehaviour.prototype.update = function() {
    switch (this.current_status) {
        case INACTIVE:
            this.moveToTarget();
            break;

        case MOVING:
            this.correctMove();
            break;

        case AIMING:
            this.aiming();
            break;

        case SHOOTING:
            this.shooting();
            break;
    }
}

ShooterBehaviour.prototype.shotTaken = function() {
    // ERRR... shoot again ? Run away ? I don't know for now !
}

ShooterBehaviour.prototype.aimingMode = function() {
    this.current_status= AIMING;
    this.obj.direction.stop(); // Stop moving or look absurd !
    this.aimingCounter = 2;
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
 * TODO : Let's face it, this is rather poorly implemented. Refactor.
 */
ShooterBehaviour.prototype.correctMove = function() {
    if (this.hasAShot()) {
        this.aimingMode();
    }
    else {
        // OK, we dont have a shot (too bad) : if we have a current path, can it be corrected ?
        var dest = this.getFinalDestination();
        if (dest) {
            if (this.isDestinationTooFarFromTarget(dest)) {
                this.moveToTarget();
            } 
            if (this.obj.direction.hasReachedDestination() && this.path.length > 0) {
                this.updateDirection();
            } 
        }
        else {
            this.giveTimeToThink(); // Just take time to think.
        }
    }
}

ShooterBehaviour.prototype.getFinalDestination = function() {
    if (this.path.length > 0) {
        return { x: this.path[0].y, y : this.path[0].x };
    } else if (this.obj.direction.destination) {
        var dest = this.obj.direction.destination;
        return computeTilePosition(dest.x, dest.y);
    }
}

ShooterBehaviour.prototype.updateDirection = function() {
    var dest = this.path.pop();
    var absoluteDest = computeAbsolutePosition(dest.y, dest.x);
    this.obj.orientationTowards(absoluteDest);
    this.obj.moveTo(absoluteDest);
}

ShooterBehaviour.prototype.isDestinationTooFarFromTarget = function(dest) {
    return manhattan(dest, this.target.computeTilePosition()) > CORRECTING_PATH_DISTANCE;
}

ShooterBehaviour.prototype.hasAShot = function() {
    // Has a shot if : 
    // - At [DISTANCE] (in "manhattan" style) from target.
    // - Ray tracing from this is possible 
    var tileShooter = this.obj.computeTilePosition();
    var tileTarget = this.target.computeTilePosition();
    return manhattan(tileShooter, tileTarget) <= AIMING_DISTANCE 
        && this.level.rayTrace(tileShooter, tileTarget);
}

ShooterBehaviour.prototype.moveToTarget = function() {
    var path = this.getPath(this.obj.computeTilePosition(), this.target.computeTilePosition());
    this.current_status = MOVING;
    this.path = path.reverse();
    this.correctMove();
}

ShooterBehaviour.prototype.aiming = function() {
    if (this.hasAShot()) {
        if (this.aimingCounter == 0) {
            this.obj.shoot(this.target.absolute_position);
            this.current_status = SHOOTING;
        } else {
            this.obj.orientationTowards(this.target.prospectivePosition());
            this.aimingCounter--;
        }
    } else {
        this.moveToTarget();
    }
}

ShooterBehaviour.prototype.shooting = function() {
    // If we're done shooting, let's loop on INACTIVITY.
    this.obj.orientationTowards(this.target.prospectivePosition());
    if (!this.obj.isShooting()) {
        if (this.hasAShot()) {
            this.aimingMode();
        } else {
            this.current_status = INACTIVE;
        }
    }
}
