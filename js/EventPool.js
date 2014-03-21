SHOOTING_EVENT = 0;

/**
 * A basic event pool, here as a template for further improvement.
 * For now, it will only be used to handle shooting.
 */
function EventPool() {
    this.events = [];
}

EventPool.prototype.addEvent = function(e) {
    this.events.push(e);
}

EventPool.prototype.readEvent = function() {
    return this.events.pop();
}

EventPool.prototype.hasEvent = function() {
    return this.events.length > 0;
}
