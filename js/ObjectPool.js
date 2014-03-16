/** Pool of objects (typically, bullets,
 * villains, and one day particles), to
 * avoid having GC troubles.
 **/
function ObjectPool(creator, size) {
    this.objects = [];
    this.creator = creator;
    this.generate(size);
}

ObjectPool.prototype.generate = function(quantity) {
    for (var i = 0; i < quantity; i++) {
        this.objects.push(this.creator());
    }
}

ObjectPool.prototype.borrow = function() {
    return this.objects.pop();
}

ObjectPool.prototype.giveBack = function(obj) {
    this.objects.push(obj);
}
