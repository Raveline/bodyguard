DELTA = 1000;
TICK_TO_AIM = 2;
AIMING_DISTANCE = 4;

INACTIVE = 0;
MOVING = 1;

/** The baddies brain is responsible for making baddies appear
 * and let them try to kill the target. **/
function Behaviour(obj, level) {
    this.obj = obj;
    this.tickTime = 0;
    this.level = level;
}

Behaviour.prototype.tick = function(tick) {
    this.tickTime += tick;
    if (this.tickTime >= DELTA) {
        this.tickTime = 0;
        this.update();
    }
}

Behaviour.prototype.manhattan = function(from, to) {
    return Math.abs((from.x - to.x) + (from.y - to.y));
}

Behaviour.prototype.giveTimeToThink = function(baddy) {
    baddy.status = INACTIVE;
}
