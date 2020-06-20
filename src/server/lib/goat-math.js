const GoatMath = {};

module.exports = GoatMath;

(function GoatMathNamespace() {
    // Input:
    //      x1, y1, x2, y2: <num>
    // Output:
    //      <num>
    GoatMath.DistanceSquare = function DistanceSquare(x1, y1, x2, y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    };

    // Input:
    //      x1, y1, x2, y2: <num>
    // Output:
    //      <num>
    GoatMath.Distance = function Distance(x1, y1, x2, y2) {
        return Math.sqrt(GoatMath.DistanceSquare(x1, y1, x2, y2));
    };

    // Input:
    //      circle1, circle2: { x: <num>, y: <num>, r: <num> }
    // Output:
    //      <boolean>
    GoatMath.DoCirclesCollide = function DoCirclesCollide(circle1, circle2) {
        const distanceBetweenCentersSquare = this.DistanceSquare(circle1.x, circle1.y, circle2.x, circle2.y);

        const sumOfRadius = circle1.r + circle2.r;
        const sumOfRadiusSquare = sumOfRadius * sumOfRadius;

        if (distanceBetweenCentersSquare < sumOfRadiusSquare) {
            return true;
        }

        return false;
    };

    // Input:
    //      vector: { x: <num>, y: <num> }
    // Output:
    //      nothing
    GoatMath.NormalizeVec = function NormalizeVec(vector) {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        const normalizedVector = { x: vector.x, y: vector.y };
        if (magnitude === 0) {
            return normalizedVector;
        }

        normalizedVector.x /= magnitude;
        normalizedVector.y /= magnitude;
        return normalizedVector;
    };

    // Input:
    //      vector: { x: <num>, y: <num> }
    //      scale: <num>
    // Output:
    //      nothing
    GoatMath.ScaleVec = function ScaleVec(vector, scale) {
        return { x: vector.x * scale, y: vector.y * scale };
    };
})();
