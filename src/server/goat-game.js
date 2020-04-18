var GoatDiagnostics = require("./lib/goat-diagnostics");
var GoatMath = require("./lib/goat-math");
const goatNames = require("./goat-names.json");

var GoatGame = {};

module.exports = GoatGame;

(function () {
    // Configuration
    const dogRadius = 10;
    const goatRadius = 10;
    const numberOfGoats = 20;
    const dogSpeed = 500; // pixels per second
    const goatSpeed = 100; // pixels per second
    const goatDogDistance = 150; // How far do goats try to stay away from dogs in pixels?
    const goatDogAfraidPercent = 99; // 0 if goats are really afraid of dogs, 100 if they aren't afraid of dogs
    const collisionFactor = 1000; // 0 for no collisions
    const diagnosticsIntervalMilliseconds = 5000;
    const goalRadius = 75;
    const goalColor = "orange";

    GoatGame.board = { width: 800, height: 600 };

    GoatGame.onRenderState = function () {};

    // Local Constants computed from config
    const goatDogDistanceSquare = goatDogDistance * goatDogDistance;
    const goatDogAfraidFactor = goatDogAfraidPercent / 100;

    var world = {
        dogs: {},
        goats: [],
        goals: [],
    };

    GoatGame.AddDog = function (socketId) {
        world.dogs[socketId] = {
            x: 300,
            y: 300,
            r: dogRadius,
            color: "hsl(" + 360 * Math.random() + ", 50%, 50%)",
            name: `dawg_${socketId}`,

            input: {
                left: false,
                right: false,
                top: false,
                bottom: false,
            },
        };
    };

    GoatGame.RemoveDog = function (socketId) {
        delete world.dogs[socketId];
    };

    GoatGame.SetInputState = function (socketId, input) {
        var dog = world.dogs[socketId] || {};
        dog.input.left = input.left;
        dog.input.right = input.right;
        dog.input.up = input.up;
        dog.input.down = input.down;
    };

    function InitializeGoats(goats) {
        for (var index = 0; index < numberOfGoats; ++index) {
            var goat = {
                x: Math.random() * GoatGame.board.width,
                y: Math.random() * GoatGame.board.height,
                r: goatRadius,
                color: "green",
                name: goatNames[Math.floor(Math.random() * goatNames.length)],
            };
            goats.push(goat);
        }
    }

    function InitializeGoals(goals) {
        goals.push({
            x: 0,
            y: 0,
            r: goalRadius,
            color: goalColor,
        });

        goals.push({
            x: GoatGame.board.width,
            y: 0,
            r: goalRadius,
            color: goalColor,
        });

        goals.push({
            x: GoatGame.board.width,
            y: GoatGame.board.height,
            r: goalRadius,
            color: goalColor,
        });

        goals.push({
            x: 0,
            y: GoatGame.board.height,
            r: goalRadius,
            color: goalColor,
        });
    }

    function InitializeGame() {
        InitializeGoats(world.goats);
        InitializeGoals(world.goals);
        console.log(world);
    }
    InitializeGame();

    function DontAllowObjectToGoBeyondTheBoard(object) {
        if (object.x - object.r < 0) {
            object.x = object.r;
        }

        if (object.y - object.r < 0) {
            object.y = object.r;
        }

        if (object.x + object.r > GoatGame.board.width) {
            object.x = GoatGame.board.width - object.r;
        }

        if (object.y + object.r > GoatGame.board.height) {
            object.y = GoatGame.board.height - object.r;
        }
    }

    function MoveDog(dog, distanceToMove) {
        var moveTo = { x: 0, y: 0 };
        if (dog.input.left) {
            moveTo.x += -1;
        }
        if (dog.input.up) {
            moveTo.y += -1;
        }
        if (dog.input.right) {
            moveTo.x += 1;
        }
        if (dog.input.down) {
            moveTo.y += 1;
        }

        GoatMath.NormalizeVec(moveTo);
        GoatMath.ScaleVec(moveTo, distanceToMove);
        dog.x += moveTo.x;
        dog.y += moveTo.y;

        DontAllowObjectToGoBeyondTheBoard(dog);
    }

    function MoveDogs(dogs, distanceToMove) {
        for (const id in dogs) {
            MoveDog(dogs[id], distanceToMove);
        }
    }

    function MoveGoatAwayFromDogs(goat, dogs, dogEffectOnGoat) {
        for (const id in dogs) {
            const dog = dogs[id];

            var actualGoatDogDistanceSquare = GoatMath.DistanceSquare(
                goat.x,
                goat.y,
                dog.x,
                dog.y
            );

            if (actualGoatDogDistanceSquare < goatDogDistanceSquare) {
                // Move goat towards dog
                const delta = { x: dog.x - goat.x, y: dog.y - goat.y };
                GoatMath.NormalizeVec(delta);

                // -1 indicates move goat away from dog
                GoatMath.ScaleVec(delta, -1);

                dogEffectOnGoat.x += delta.x;
                dogEffectOnGoat.y += delta.y;
            }
        }

        // Scale it to 1
        GoatMath.NormalizeVec(dogEffectOnGoat);
    }

    function MoveGoatsTowardsCenter(goats, goatsCenterEffectOnGoats) {
        var center = { x: 0, y: 0 };
        for (const index in goats) {
            center.x += goats[index].x;
            center.y += goats[index].y;
        }

        if (goats.length > 0) {
            center.x /= goats.length;
            center.y /= goats.length;
        }

        for (const index in goats) {
            var goat = goats[index];
            var goatsCenterEffectOnGoat = goatsCenterEffectOnGoats[index];

            // Move goat towards center
            const delta = { x: center.x - goat.x, y: center.y - goat.y };
            GoatMath.NormalizeVec(delta);

            goatsCenterEffectOnGoat.x += delta.x;
            goatsCenterEffectOnGoat.y += delta.y;
        }
    }

    function AvoidCollisionWithOtherGoats(goats, collisionEffectOnGoats) {
        for (
            var moveCandidateIndex = 0;
            moveCandidateIndex < goats.length;
            ++moveCandidateIndex
        ) {
            var moveCandidate = goats[moveCandidateIndex];
            var collisionEffectOnMoveCandidate =
                collisionEffectOnGoats[moveCandidateIndex];

            for (
                var remainingGoatIndex = 0;
                remainingGoatIndex < goats.length;
                ++remainingGoatIndex
            ) {
                // Goat can't collide with itself
                if (moveCandidateIndex == remainingGoatIndex) {
                    continue;
                }

                var remainingGoat = goats[remainingGoatIndex];
                if (GoatMath.DoCirclesCollide(moveCandidate, remainingGoat)) {
                    var delta = {
                        x: remainingGoat.x - moveCandidate.x,
                        y: remainingGoat.y - moveCandidate.y,
                    };

                    GoatMath.NormalizeVec(delta);
                    // Move away from collision
                    GoatMath.ScaleVec(delta, -1);

                    collisionEffectOnMoveCandidate.x += delta.x;
                    collisionEffectOnMoveCandidate.y += delta.y;
                }
            }

            GoatMath.NormalizeVec(collisionEffectOnMoveCandidate);
        }
    }

    function HerdMoveGoats(goats, dogs, distance) {
        // Rules to add here:
        // - Goat moves away from dogs when they are "close" to goat
        // - Goat moves towards the "center" of herd
        // - Goat avoids collision with other goats
        // - Goat detects collision with corners

        var dogsEffectOnGoats = [];
        var goatsCenterEffectOnGoats = [];
        var netEffectOnGoatsScaledToOne = [];
        var collisionEffectOnGoats = [];
        for (const index in goats) {
            dogsEffectOnGoats.push({ x: 0, y: 0 });
            goatsCenterEffectOnGoats.push({ x: 0, y: 0 });
            netEffectOnGoatsScaledToOne.push({ x: 0, y: 0 });
            collisionEffectOnGoats.push({ x: 0, y: 0 });
        }

        for (const index in goats) {
            MoveGoatAwayFromDogs(goats[index], dogs, dogsEffectOnGoats[index]);
        }
        MoveGoatsTowardsCenter(goats, goatsCenterEffectOnGoats);
        AvoidCollisionWithOtherGoats(goats, collisionEffectOnGoats);

        for (const index in goats) {
            const dogAfraidEffect = goatDogAfraidFactor;
            const centerPullEffect = 1 - goatDogAfraidFactor;

            var dogsEffectOnGoat = dogsEffectOnGoats[index];
            var goatsCenterEffectOnGoat = goatsCenterEffectOnGoats[index];
            var collisionEffectOnGoat = collisionEffectOnGoats[index];

            GoatMath.ScaleVec(dogsEffectOnGoat, dogAfraidEffect);
            GoatMath.ScaleVec(goatsCenterEffectOnGoat, centerPullEffect);
            GoatMath.ScaleVec(collisionEffectOnGoat, collisionFactor);

            var netEffect = { x: 0, y: 0 };

            netEffect.x =
                dogsEffectOnGoat.x +
                goatsCenterEffectOnGoat.x +
                collisionEffectOnGoat.x;
            netEffect.y =
                dogsEffectOnGoat.y +
                goatsCenterEffectOnGoat.y +
                collisionEffectOnGoat.y;

            GoatMath.NormalizeVec(netEffect);
            GoatMath.ScaleVec(netEffect, distance);

            var goat = goats[index];
            goat.x += netEffect.x;
            goat.y += netEffect.y;
        }

        for (const index in goats) {
            DontAllowObjectToGoBeyondTheBoard(goats[index]);
        }
    }

    function RemoveGoatsThatCollideWithGoals(goats, goals) {
        var goatsToRemove = [];

        for (var goatIndex in goats) {
            for (var goalIndex in goals) {
                if (
                    GoatMath.DoCirclesCollide(
                        goals[goalIndex],
                        goats[goatIndex]
                    )
                ) {
                    goatsToRemove.unshift(
                        { goatIndexToRemove: goatIndex },
                        { goalTouched: goalIndex }
                    );
                    break;
                }
            }
        }

        for (var index in goatsToRemove) {
            goats.splice(goatsToRemove[index].goatIndexToRemove, 1);
        }
    }

    // Physics

    // WARNING: DO NOT CHANGE THIS VALUE
    const physicsInterval = 15; // milliseconds

    var physicsTime = new Date();
    var physicsPerfCounter = new GoatDiagnostics.PerfCounter();

    // Keep logic to a minimal here
    setInterval(function () {
        var newPhysicsTime = new Date();
        var actualInterval = newPhysicsTime - physicsTime;
        physicsTime = newPhysicsTime;

        physicsPerfCounter.Stop();
        physicsPerfCounter.Start();

        // distance = velocity * time
        const dogDistanceToMove = (dogSpeed * actualInterval) / 1000;
        MoveDogs(world.dogs, dogDistanceToMove);

        // distance = velocity * time
        const goatDistanceToMove = (goatSpeed * actualInterval) / 1000;
        HerdMoveGoats(world.goats, world.dogs, goatDistanceToMove);

        RemoveGoatsThatCollideWithGoals(world.goats, world.goals);
    }, physicsInterval);

    // Render
    var renderPerfCounter = new GoatDiagnostics.PerfCounter();
    const renderFps = 60;
    const renderInterval = 1000 / renderFps;
    setInterval(function () {
        renderPerfCounter.Stop();
        renderPerfCounter.Start();

        GoatGame.onRenderState(world);
    }, renderInterval);

    function GetPrintableNumber(number) {
        return Math.round(number * 100) / 100;
    }

    // Diagnostics
    setInterval(function () {
        const serverRendersPerSecond = GetPrintableNumber(
            1000 / renderPerfCounter.GetAverageTime()
        );
        renderPerfCounter.Clear();

        const physicsLoopAverageIterationIntervalMs = GetPrintableNumber(
            physicsPerfCounter.GetAverageTime()
        );
        physicsPerfCounter.Clear();

        console.log(`--Diagnostics--`);
        console.log(`    Server render FPS: ${serverRendersPerSecond}`);
        console.log(
            `    Server physics loop average interval (ms): ${physicsLoopAverageIterationIntervalMs}`
        );
    }, diagnosticsIntervalMilliseconds);
})();
