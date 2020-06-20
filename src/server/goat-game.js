const GoatDiagnostics = require('./lib/goat-diagnostics');
const GoatMath = require('./lib/goat-math');
const goatNames = require('./goat-names.json');
const GoatEnhancementHelpers = require('../common/goat-enhancement-helpers');

var GoatGame = {};

module.exports = GoatGame;

(function () {
    // Configuration
    const dogRadius = 10;
    const goatRadius = 10;
    const numberOfGoats = 20;
    const dogSpeed = 500; // pixels per second
    const goatSpeed = 100; // pixels per second
    const goatScaredSpeed = 500;
    const goatCollisionSpeed = 450;
    const goatComfortZone = 75;
    const goatDogDistance = 250; // How far do goats try to stay away from dogs in pixels?
    const diagnosticsIntervalMilliseconds = 5000;
    const goalPostRadius = 75;
    const scoreDecrementInterval = 3500;

    GoatGame.board = { width: 800, height: 600 };

    GoatGame.onRenderState = function () {};

    // Local Constants computed from config
    const goatDogDistanceSquare = goatDogDistance * goatDogDistance;

    var telemetry = undefined;
    GoatGame.SetTelemetryObject = function (goatTelemetry) {
        telemetry = goatTelemetry;
    };

    var world = {
        dogs: {},
        goats: [],
        goalPosts: [],
    };

    GoatGame.AddDog = function (socketId, myName, teamId) {
        let randGoalPost = world.goalPosts[teamId];
        world.dogs[socketId] = {
            x: randGoalPost.spawnPoint.x,
            y: randGoalPost.spawnPoint.y,
            r: dogRadius,
            color: randGoalPost.color,
            name: `${myName}`,
            input: {
                key: {
                    left: false,
                    right: false,
                    top: false,
                    bottom: false,
                },
                mouseTouch: { x: 0, y: 0 },
                isKeyBasedMovement: true,
            },
        };

        ReportEvent('dog-added', 'id', `${socketId}`, 'team', teamId);
    };

    GoatGame.RemoveDog = function (socketId) {
        delete world.dogs[socketId];
        ReportEvent('dog-removed', 'id', socketId);
    };

    GoatGame.SetInputKeyState = function (socketId, keyInput) {
        var dog = world.dogs[socketId];
        if (dog) {
            dog.input.key.left = keyInput.left;
            dog.input.key.right = keyInput.right;
            dog.input.key.up = keyInput.up;
            dog.input.key.down = keyInput.down;
            dog.input.isKeyBasedMovement = true;
        }
    };

    GoatGame.SetMouseTouchState = function (socketId, mouseTouchInput) {
        if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
            const dog = world.dogs[socketId] || {};
            dog.input.mouseTouch = mouseTouchInput;
            dog.input.isKeyBasedMovement = false;
        }
    };

    GoatGame.ResetGoats = function () {
        world.goats = [];
        AddGoats(world.goats, numberOfGoats);
    };

    GoatGame.ResetScore = function () {
        world.goalPosts.forEach((goalPost) => {
            goalPost.numberOfGoatsTouched = 0;
        });
    };

    function AddGoats(goats, numberOfGoatsToAdd) {
        for (var index = 0; index < numberOfGoatsToAdd; ++index) {
            const spawnArea = 1.5 * goalPostRadius;
            var goat = {
                x: spawnArea + Math.random() * (GoatGame.board.width - 2 * spawnArea),
                y: Math.random() * GoatGame.board.height,
                r: goatRadius,
                color: 'green',
                name: goatNames[Math.floor(Math.random() * goatNames.length)],
            };
            goats.push(goat);
        }
    }

    function AddGoalPosts(goalPosts) {
        goalPosts.push({
            x: 0,
            y: 0,
            r: goalPostRadius,
            color: 'crimson',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: 100,
                y: 100,
            },
        });

        goalPosts.push({
            x: GoatGame.board.width,
            y: 0,
            r: goalPostRadius,
            color: 'royalblue',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: GoatGame.board.width - 100,
                y: 100,
            },
        });

        goalPosts.push({
            x: GoatGame.board.width,
            y: GoatGame.board.height,
            r: goalPostRadius,
            color: 'yellowgreen',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: GoatGame.board.width - 100,
                y: GoatGame.board.height - 100,
            },
        });

        goalPosts.push({
            x: 0,
            y: GoatGame.board.height,
            r: goalPostRadius,
            color: 'orange',
            numberOfGoatsTouched: 0,
            spawnPoint: {
                x: 100,
                y: GoatGame.board.height - 100,
            },
        });
    }

    function InitializeGame() {
        AddGoats(world.goats);
        AddGoalPosts(world.goalPosts, numberOfGoats);
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
        var moveDirection = { x: 0, y: 0 };
        if (dog.input.isKeyBasedMovement) {
            if (dog.input.key.left) {
                moveDirection.x += -1;
            }
            if (dog.input.key.up) {
                moveDirection.y += -1;
            }
            if (dog.input.key.right) {
                moveDirection.x += 1;
            }
            if (dog.input.key.down) {
                moveDirection.y += 1;
            }
        } else if (
            Math.abs(dog.x - dog.input.mouseTouch.x) > dog.r / 2 ||
            Math.abs(dog.y - dog.input.mouseTouch.y) > dog.r / 2
        ) {
            moveDirection.x = dog.input.mouseTouch.x - dog.x;
            moveDirection.y = dog.input.mouseTouch.y - dog.y;
        }

        moveDirection = GoatMath.NormalizeVec(moveDirection);
        moveDirection = GoatMath.ScaleVec(moveDirection, distanceToMove);
        dog.x += moveDirection.x;
        dog.y += moveDirection.y;

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

            var actualGoatDogDistanceSquare = GoatMath.DistanceSquare(goat.x, goat.y, dog.x, dog.y);

            if (actualGoatDogDistanceSquare < goatDogDistanceSquare) {
                // Move goat towards dog
                let delta = { x: dog.x - goat.x, y: dog.y - goat.y };
                delta = GoatMath.NormalizeVec(delta);

                // -1 indicates move goat away from dog
                delta = GoatMath.ScaleVec(delta, -1);

                dogEffectOnGoat.x += delta.x;
                dogEffectOnGoat.y += delta.y;
            }
        }

        // Scale it to 1
        dogEffectOnGoat = GoatMath.NormalizeVec(dogEffectOnGoat);
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

            if (GoatMath.Distance(goat.x, goat.y, center.x, center.y) > goatComfortZone) {
                // Move goat towards center
                let delta = { x: center.x - goat.x, y: center.y - goat.y };
                delta = GoatMath.NormalizeVec(delta);

                goatsCenterEffectOnGoat.x = delta.x;
                goatsCenterEffectOnGoat.y = delta.y;
            }
        }
    }

    function AvoidCollisionWithOtherGoats(goats, collisionEffectOnGoats) {
        for (var moveCandidateIndex = 0; moveCandidateIndex < goats.length; ++moveCandidateIndex) {
            var moveCandidate = goats[moveCandidateIndex];
            var collisionEffectOnMoveCandidate = collisionEffectOnGoats[moveCandidateIndex];

            for (var remainingGoatIndex = 0; remainingGoatIndex < goats.length; ++remainingGoatIndex) {
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

                    delta = GoatMath.NormalizeVec(delta);
                    // Move away from collision
                    delta = GoatMath.ScaleVec(delta, -1);

                    collisionEffectOnMoveCandidate.x += delta.x;
                    collisionEffectOnMoveCandidate.y += delta.y;
                }
            }

            collisionEffectOnMoveCandidate = GoatMath.NormalizeVec(collisionEffectOnMoveCandidate);
        }
    }

    function HerdMoveGoats(goats, dogs, distance, goatScaredDistance, goatCollisionDistance) {
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
            var dogsEffectOnGoat = dogsEffectOnGoats[index];
            var goatsCenterEffectOnGoat = goatsCenterEffectOnGoats[index];
            var collisionEffectOnGoat = collisionEffectOnGoats[index];

            goatsCenterEffectOnGoat = GoatMath.NormalizeVec(goatsCenterEffectOnGoat);
            goatsCenterEffectOnGoat = GoatMath.ScaleVec(goatsCenterEffectOnGoat, distance);

            var goat = goats[index];

            goat.x += goatsCenterEffectOnGoat.x;
            goat.y += goatsCenterEffectOnGoat.y;

            dogsEffectOnGoat = GoatMath.ScaleVec(dogsEffectOnGoat, goatScaredDistance);
            goat.x += dogsEffectOnGoat.x;
            goat.y += dogsEffectOnGoat.y;

            collisionEffectOnGoat = GoatMath.ScaleVec(collisionEffectOnGoat, goatCollisionDistance);
            goat.x += collisionEffectOnGoat.x;
            goat.y += collisionEffectOnGoat.y;
        }

        for (const index in goats) {
            DontAllowObjectToGoBeyondTheBoard(goats[index]);
        }
    }

    function RemoveGoatsThatCollideWithGoalPosts(goats, goalPosts) {
        var goatsToRemove = [];

        for (var goatIndex in goats) {
            for (var goalIndex in goalPosts) {
                if (GoatMath.DoCirclesCollide(goalPosts[goalIndex], goats[goatIndex])) {
                    goatsToRemove.unshift({
                        goatIndexToRemove: goatIndex,
                        goalPostTouched: goalIndex,
                    });
                    break;
                }
            }
        }

        for (var index in goatsToRemove) {
            const goalPostTouched = goatsToRemove[index].goalPostTouched;
            goalPosts[goalPostTouched].numberOfGoatsTouched++;

            goats.splice(goatsToRemove[index].goatIndexToRemove, 1);
        }

        AddGoats(goats, numberOfGoats - goats.length);
    }

    // Physics

    // WARNING: DO NOT CHANGE THIS VALUE
    const physicsInterval = 15; // milliseconds

    var physicsTime = new Date();
    var physicsPerfCounter = new GoatDiagnostics.PerfCounter();
    var scoreDecrementTimer = new Date();

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
        const goatScaredDistanceToMove = (goatScaredSpeed * actualInterval) / 1000;
        const goatCollisionDistanceToMove = (goatCollisionSpeed * actualInterval) / 1000;

        HerdMoveGoats(
            world.goats,
            world.dogs,
            goatDistanceToMove,
            goatScaredDistanceToMove,
            goatCollisionDistanceToMove
        );

        RemoveGoatsThatCollideWithGoalPosts(world.goats, world.goalPosts);

        if (physicsTime - scoreDecrementTimer > scoreDecrementInterval) {
            scoreDecrementTimer = physicsTime;
            world.goalPosts.forEach((goalPost) => {
                if (goalPost.numberOfGoatsTouched > 0) {
                    --goalPost.numberOfGoatsTouched;
                }
            });
        }
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
        const serverRendersPerSecond = GetPrintableNumber(1000 / renderPerfCounter.GetAverageTime());
        renderPerfCounter.Clear();

        const physicsLoopAverageIterationIntervalMs = GetPrintableNumber(physicsPerfCounter.GetAverageTime());
        physicsPerfCounter.Clear();

        console.log(`--Diagnostics--`);
        console.log(`    Server render FPS: ${serverRendersPerSecond}`);
        console.log(`    Server physics loop average interval (ms): ${physicsLoopAverageIterationIntervalMs}`);

        ReportEvent(
            'physics-graphics-health',
            'physics-interval-average',
            physicsLoopAverageIterationIntervalMs,
            'graphics-fps-average',
            serverRendersPerSecond
        );
    }, diagnosticsIntervalMilliseconds);

    function ReportEvent(eventName, paramName1, paramValue1, paramName2, paramValue2, paramName3, paramValue3) {
        if (!telemetry) {
            return;
        }

        telemetry.ReportEvent(
            new Date(),
            eventName,
            paramName1,
            paramValue1,
            paramName2,
            paramValue2,
            paramName3,
            paramValue3
        );
    }
})();
