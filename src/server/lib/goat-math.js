var GoatMath = {};

module.exports = GoatMath;

(function () {
    // Input:
    //      x1, y1, x2, y2: <num>
    // Output:
    //      <num>
    GoatMath.DistanceSquare = function (x1, y1, x2, y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    };

    // Input:
    //      moveFrom, moveTo: { x: <num>, y: <num> }
    //      moveDistance: <num>
    // Output:
    //      { x: <num>, y:<num> }
    GoatMath.CalculateMoveDelta = function (moveFrom, moveTo, moveDistance) {
        // If you are already at your destination, there's nowhere to move
        if (moveFrom.x == moveTo.x && moveFrom.y == moveTo.y) {
            return { x: 0, y: 0 };
        }

        const angle = Math.atan2(moveTo.y - moveFrom.y, moveTo.x - moveFrom.x);

        var xDelta = Math.cos(angle) * moveDistance;
        var yDelta = Math.sin(angle) * moveDistance;

        return { x: xDelta, y: yDelta };
    };

    // Input:
    //      circle1, circle2: { x: <num>, y: <num>, r: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoCirclesCollide = function (circle1, circle2) {
        const distanceBetweenCentersSquare = this.DistanceSquare(
            circle1.x,
            circle1.y,
            circle2.x,
            circle2.y
        );

        const sumOfRadius = circle1.r + circle2.r;
        const sumOfRadiusSquare = sumOfRadius * sumOfRadius;

        if (distanceBetweenCentersSquare < sumOfRadiusSquare) {
            return true;
        }

        return false;
    };
})();
