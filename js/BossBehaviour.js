NOT_FIGHTING = 20;

function BossBehaviour(obj, level, target) {
    ShooterBehaviour.call(this, obj, level, target);
    this.current_status = NOT_FIGHTING;
}
BossBehaviour.constructor = BossBehaviour;
BossBehaviour.prototype = Object.create(ShooterBehaviour.prototype);

BossBehaviour.prototype.update = function() {
    switch (this.current_status) {
        case NOT_FIGHTING:
            // Just here as a reminder that we should do nothing. This behaviour should be triggered manually.
            break;

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

BossBehaviour.prototype.activate = function() {
    this.current_status = INACTIVE;
}
