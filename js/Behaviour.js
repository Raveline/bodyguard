DELTA = 200;
TICK_TO_AIM = 2;

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

Behaviour.prototype.giveTimeToThink = function() {
    this.current_status = INACTIVE;
}

/**
 * Take a path given as [tile, tile, tile, tile] and "flatten" is,
 * looking for same directions.*/
Behaviour.prototype.pathToLines = function(path, start) {
    if (start >= (path.length-1)) {
        return [path[start]];
    }
    var first = path[start];
    var second = path[start+1];
    var vecx = second.x - first.x;
    var vecy = second.y - first.y;
    var currentNode = first;
    var i = start + 1;
    while(i < path.length && currentNode.x + vecx == path[i].x && currentNode.y + vecy == path[i].y) {
        currentNode = path[i];
        i++;
    }
    if (i < path.length-1) {
        return [currentNode].concat(this.pathToLines(path, i-1));
    } else {
        return [currentNode];
    }
}

Behaviour.prototype.getPath = function(from, to) {
    return this.pathToLines(this.level.computePath(from, to), 0);
}
