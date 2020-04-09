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
