var assert = require("assert");
var GoatMath = require("../src/server/lib/goat-math");

// describe("Array", function () {
//     describe("#indexOf()", function () {
//         it("should return -1 when the value is not present", function () {
//             assert.equal([1, 2, 3].indexOf(4), -1);
//         });
//     });
// });

describe("GoatMath.NormalizeVec", function () {
    describe("on input vector with magnitude 0", function () {
        it("should do nothing to input vector", function () {
            var vector = { x: 0, y: 0 };
            GoatMath.NormalizeVec(vector);
            assert.equal(vector.x, 0);
            assert.equal(vector.y, 0);
        });
    });

    describe("on input vector with magnitude 1", function () {
        it("should do nothing to input vector", function () {
            var vector = { x: 1, y: 0 };
            GoatMath.NormalizeVec(vector);
            assert.equal(vector.x, 1);
            assert.equal(vector.y, 0);
        });
    });

    describe("on input vector with magnitude greater than 1", function () {
        it("should reduce magnitude to 1", function () {
            var vector = { x: 5, y: 5 };
            GoatMath.NormalizeVec(vector);
            assert.equal(vector.x.toPrecision(3), 0.707);
            assert.equal(vector.y.toPrecision(3), 0.707);
        });
    });

    describe("on input vector with magnitude less than 1", function () {
        it("should reduce magnitude to 1", function () {
            var vector = { x: -0.5, y: -0.5 };
            GoatMath.NormalizeVec(vector);
            assert.equal(vector.x.toPrecision(3), -0.707);
            assert.equal(vector.y.toPrecision(3), -0.707);
        });
    });
});

describe("GoatMath.ScaleVec", function () {
    describe("on non-zero magnitude vector and greater than 1 scaling", function () {
        it("should scale by the given amount", function () {
            var vector = { x: 1, y: -1 };
            GoatMath.ScaleVec(vector, 5);
            assert.equal(vector.x, 5);
            assert.equal(vector.y, -5);
        });
    });

    describe("on non-zero magnitude vector and 1 scaling", function () {
        it("should not change input vector", function () {
            var vector = { x: -1, y: -1 };
            GoatMath.ScaleVec(vector, 1);
            assert.equal(vector.x, -1);
            assert.equal(vector.y, -1);
        });
    });

    describe("on non-zero magnitude vector and negative scaling", function () {
        it("should reverse direction of input vector", function () {
            var vector = { x: -1, y: 1 };
            GoatMath.ScaleVec(vector, -1);
            assert.equal(vector.x, 1);
            assert.equal(vector.y, -1);
        });
    });
});
