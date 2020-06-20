var GameAnimation = {};

module.exports = GameAnimation;

(function () {
    var spriteSheets = {};

    var dogAnimation = {};
    //var goatAnimation = {};

    spriteSheets['dog'] = new SpriteSheet('img/dogsprite2.png', 547, 481, 16);
    //spriteSheets["goat"] = new SpriteSheet( "img/goatsprite1.png", 48, 48, 12);

    const directionEnum = {
        NONE: -1,
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,
    };

    function SpriteSheet(iPath, iFrameWidth, iFrameHeight, iFramesPerRow) {
        this.frameWidth = iFrameWidth;
        this.frameHeight = iFrameHeight;
        this.url = iPath;
        this.framesPerRow = iFramesPerRow;
    }

    GameAnimation.AddDogAnimation = function (socketId) {
        dogAnimation[socketId] = new Animation(spriteSheets['dog'], 5, 0, 7, 8, 15, 8, 15, 8, 15);
    };

    GameAnimation.UpdateDogFrame = function (socketId, input) {
        let direction = directionEnum.NONE;
        if (input.up) {
            direction = directionEnum.UP;
        }
        if (input.down) {
            direction = directionEnum.DOWN;
        }
        if (input.left) {
            direction = directionEnum.LEFT;
        }
        if (input.right) {
            direction = directionEnum.RIGHT;
        }

        if (direction != directionEnum.NONE) dogAnimation[socketId].update(direction);
    };

    GameAnimation.ResetDogFrame = function (socketId) {
        dogAnimation[socketId].resetFrame();
    };

    GameAnimation.GetDogFrame = function (socketId) {
        return dogAnimation[socketId].getSpriteFrame();
    };

    function Animation(iSpriteSheet, iFrameSpeed, lStart, lEnd, rStart, rEnd, uStart, uEnd, dStart, dEnd) {
        var animationSequence = {}; // array holding the order of the animation
        var currentFrame = 0; // the current frame to draw
        var counter = 0; // keep track of frame rate
        var currentDirection = directionEnum.RIGHT;
        var spriteSheet = iSpriteSheet;
        var frameSpeed = iFrameSpeed;

        //left
        animationSequence[directionEnum.LEFT] = [];
        for (var frameNumber = lStart; frameNumber <= lEnd; frameNumber++) {
            animationSequence[directionEnum.LEFT].push(frameNumber);
        }

        //right
        animationSequence[directionEnum.RIGHT] = [];
        for (var frameNumber = rStart; frameNumber <= rEnd; frameNumber++) {
            animationSequence[directionEnum.RIGHT].push(frameNumber);
        }

        //up
        animationSequence[directionEnum.UP] = [];
        for (var frameNumber = uStart; frameNumber <= uEnd; frameNumber++) {
            animationSequence[directionEnum.UP].push(frameNumber);
        }

        //down
        animationSequence[directionEnum.DOWN] = [];
        for (var frameNumber = dStart; frameNumber <= dEnd; frameNumber++) {
            animationSequence[directionEnum.DOWN].push(frameNumber);
        }

        // Update the animation
        this.update = function (direction) {
            if (direction != currentDirection) {
                currentFrame = 0;
                counter = 0;
                currentDirection = direction;
            }
            // update to the next frame if it is time
            if (counter == frameSpeed - 1) currentFrame = (currentFrame + 1) % animationSequence[direction].length;

            // update the counter
            counter = (counter + 1) % frameSpeed;
        };

        // draw the current frame
        this.draw = function (x, y) {
            // get the row and col of the frame
            var row = Math.floor(animationSequence[currentDirection][currentFrame] / spriteSheet.framesPerRow);
            var col = Math.floor(animationSequence[currentDirection][currentFrame] % spriteSheet.framesPerRow);

            ctx.drawImage(
                spriteSheet.image,
                col * spriteSheet.frameWidth,
                row * spriteSheet.frameHeight,
                spriteSheet.frameWidth,
                spriteSheet.frameHeight,
                x,
                y,
                spriteSheet.frameWidth,
                spriteSheet.frameHeight
            );
        };

        this.getSpriteFrame = function () {
            var row = Math.floor(animationSequence[currentDirection][currentFrame] / spriteSheet.framesPerRow);
            var col = Math.floor(animationSequence[currentDirection][currentFrame] % spriteSheet.framesPerRow);
            return {
                //url : spriteSheet.url,
                x: col * spriteSheet.frameWidth,
                y: row * spriteSheet.frameHeight,
            };
        };

        this.resetFrame = function () {
            currentFrame = 0;
        };
    }
})();
