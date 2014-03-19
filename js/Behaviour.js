BADDIES_NEED_MAX = 3;
DELTA = 1000;
TICK_TO_AIM = 2;
AIMING_DISTANCE = 4;

INACTIVE = 0;
MOVING = 1;
AIMING = 2;
SHOOTING = 3;

/** The baddies brain is responsible for making baddies appear
 * and let them try to kill the target. **/
function BaddiesBrain(generableBaddies, level, target) {
    this.numberOfBaddies = 0;
    this.generatedBaddies = 0;
    this.generableBaddies = generableBaddies;
    // TODO : refactor those 3 lists into only one, with states stored.
    this.baddies = [];
    this.needBaddies = false;
    this.tickTime = 0;
    this.level = level;
    this.target = target;
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
    for (var i = 0; i < this.numberOfBaddies; i++) {
        var baddy = this.baddies[i];
        //console.log(baddy.status);
        switch (baddy.status) {
            case INACTIVE:
                this.moveBaddyToTarget(baddy);
                break;

            case MOVING:
                this.correctMovingBaddy(baddy);
                break;

            case AIMING:
                this.aimingBaddy(baddy);

            case SHOOTING:
                this.shotTaken(baddy);
        }
    }
}

// Does the IA need more baddies ?
BaddiesBrain.prototype.checkIfNeedBaddies = function() {
    if (!this.needBaddies 
            && this.numberOfBaddies < BADDIES_NEED_MAX
            && this.generatedBaddies < this.generableBaddies ) {
        this.needBaddies = true;
    }
}

BaddiesBrain.prototype.shotTaken = function() {
    // ERRR... shoot again ? Run away ? I don't know for now !
}

BaddiesBrain.prototype.addNewBaddy = function(baddy) {
    this.baddies.push({"baddy" : baddy
                    , "status" : INACTIVE });
    this.numberOfBaddies++;
}

BaddiesBrain.prototype.putBaddyToAimingMode = function(baddy) {
    baddy.status = AIMING;
    baddy.aimingCounter = 2;
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
 * TODO: Most likely, testing the shot should be done even while moving
 * in a same direction.
 */
BaddiesBrain.prototype.correctMovingBaddy = function(baddy) {
    if (this.isDestinationTooFarFromTarget(baddy.path[0])) {
        // Then we recompute path
        this.moveBaddyToTarget(baddy);
    } else if (baddy.baddy.direction.hasReachedDestination()) {
        if (this.hasAShot(baddy)) {
            this.putBaddyToAimingMode(baddy);
        } else if (baddy.path.length == 0) {
            this.letBaddyTimeToThink(baddy);
        } else {
            // Are we done in our current direction ?
            this.updateDirection(baddy);
        } 
    }
}

BaddiesBrain.prototype.updateDirection = function(baddy) {
    var dest = baddy.path.pop();
    var absoluteDest = computeAbsolutePosition(dest.y, dest.x);
    baddy.baddy.orientationTowards(absoluteDest);
    baddy.baddy.moveTo(absoluteDest);
}

BaddiesBrain.prototype.isDestinationTooFarFromTarget = function(dest) {
    var destCorrected = {x : dest.y, y : dest.x };
    return this.manhattan(destCorrected, this.target.computeTilePosition()) > AIMING_DISTANCE;
}

BaddiesBrain.prototype.aimingBaddy = function(baddy) {
    baddy.status = AIMING;
    if (baddy.aimingCounter == 0) {
        baddy.shoot;
    } else {
        baddy.aimingCounter--;
    }
}

BaddiesBrain.prototype.hasAShot = function(baddy) {
    // Has a shot if : 
    // - At [DISTANCE] (in "manhattan" style) from target.
    // - Ray tracing from this is possible 
    // TODO : add the ray-tracing condition
    return this.manhattan(baddy.baddy.computeTilePosition(), this.target.computeTilePosition()) <= AIMING_DISTANCE;
}

BaddiesBrain.prototype.manhattan = function(from, to) {
    return Math.abs((from.x - to.x) + (from.y - to.y));
}

BaddiesBrain.prototype.moveBaddyToTarget = function(baddy) {
    var baddyObject = baddy.baddy;
    path = this.level.computePath(baddyObject.computeTilePosition(), this.target.computeTilePosition());
    baddy.status = MOVING;
    baddy.path = path.reverse();
    this.correctMovingBaddy(baddy, this.target);
}

BaddiesBrain.prototype.giveBaddyTimeToThink = function(baddy) {
    baddy.status = INACTIVE;
}
