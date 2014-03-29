function BossBehaviour(obj, level, target) {
    ShooterBehaviour.call(this, obj, level, target);
}
BossBehaviour.constructor = BossBehaviour;
BossBehaviour.prototype = Object.create(ShooterBehaviour.prototype);

BossBehaviour.prototype.update = function() {
    switch (this.current_status) {
        case INACTIVE:
            // Do nothing. This behaviour should be triggered manually.
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
    this.moveToTarget();
}
