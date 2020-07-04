const goatEnhancements = require('../../common/goat-enhancements.json');
const GoatEnhancementHelpers = require('../../common/goat-enhancement-helpers');

let adapter = 'game-adapter';
if (GoatEnhancementHelpers.IsLocalGameEnabled()) {
    adapter = 'local-game-adapter';
}

const GameAdapter = require(`./${adapter}`);

console.log(goatEnhancements);

let gameDesiredDimensions = { width: 0, height: 0 };
const canvasElement = document.getElementById('myCanvas');
const context = canvasElement.getContext('2d');
let scalingRatio = 1;

const input = {
    key: { up: false, down: false, left: false, right: false },
    mousePosition: { x: 0, y: 0 },
    isKeyBasedMovement: true,
};

var spriteSheets = {};

spriteSheets['dog'] = new SpriteSheet('img/dogsprite1.png', 547, 481);
spriteSheets['goat'] = new SpriteSheet('img/goat_1.png', 682, 800);
spriteSheets['background'] = new SpriteSheet('img/grass2.png', 600, 600);

function SpriteSheet(iPath, iFrameWidth, iFrameHeight) {
    var image = new Image();
    image.src = iPath;
    var frameWidth = iFrameWidth;
    var frameHeight = iFrameHeight;
    this.draw = function (context, sx, sy, dx, dy, dFrameWidth, dFrameHeight) {
        context.drawImage(image, sx, sy, frameWidth, frameHeight, dx, dy, dFrameWidth, dFrameHeight);
    };
}

function KeyEvent(keyCode, isKeyPressed) {
    let hasInputChanged = false;
    switch (keyCode) {
        case 37: // Arrow Left
        case 65: // A
            input.key.left = isKeyPressed;
            hasInputChanged = true;
            break;
        case 38: // Arrow Up
        case 87: // W
            input.key.up = isKeyPressed;
            hasInputChanged = true;
            break;
        case 39: // Arrow Right
        case 68: // D
            input.key.right = isKeyPressed;
            hasInputChanged = true;
            break;
        case 40: // Arrow Down
        case 83: // S
            input.key.down = isKeyPressed;
            hasInputChanged = true;
            break;
        default:
    }

    if (hasInputChanged) {
        input.isKeyBasedMovement = true;
        GameAdapter.SendKeyInputToGame(input.key);
    }
}

function RenderDog(dog, context) {
    const scaledDog = {
        x: dog.x * scalingRatio,
        y: dog.y * scalingRatio,
        r: dog.r * scalingRatio,
    };

    context.fillStyle = dog.color;
    if (GoatEnhancementHelpers.IsAnimationEnabled()) {
        const offset = Math.sqrt(dog.r * scaledDog.r * 2) * 0.5;
        spriteSheets['dog'].draw(
            context,
            dog.spriteFrame.x,
            dog.spriteFrame.y,
            scaledDog.x - offset,
            scaledDog.y - offset,
            scaledDog.r * 2,
            scaledDog.r * 2
        );

        context.font = `${scaledDog.r * 0.5}px Verdana`;
        context.textAlign = 'center';
        context.fillText(dog.name, scaledDog.x, scaledDog.y - offset + 2.5 * scaledDog.r);
    } else {
        context.beginPath();
        context.arc(scaledDog.x, scaledDog.y, scaledDog.r, 0, 2 * Math.PI);
        context.fill();

        context.font = `${scaledDog.r}px Verdana`;
        context.textAlign = 'center';
        context.fillText(dog.name, scaledDog.x, scaledDog.y + 2.5 * scaledDog.r);
    }
}

function RenderGoat(goat, context) {
    const scaledGoat = {
        x: goat.x * scalingRatio,
        y: goat.y * scalingRatio,
        r: goat.r * scalingRatio,
    };

    if (GoatEnhancementHelpers.IsAnimationEnabled()) {
        const offset = Math.sqrt(scaledGoat.r * scaledGoat.r * 2) * 0.5;
        spriteSheets['goat'].draw(
            context,
            0,
            0,
            scaledGoat.x - offset,
            scaledGoat.y - offset,
            scaledGoat.r * 2,
            scaledGoat.r * 2
        );
    } else {
        context.fillStyle = goat.color;
        context.beginPath();
        context.arc(scaledGoat.x, scaledGoat.y, scaledGoat.r, 0, 2 * Math.PI);
        context.fill();

        context.font = `${scaledGoat.r}px Verdana`;
        context.textAlign = 'center';
        context.fillText(goat.name, scaledGoat.x, scaledGoat.y + 2.5 * scaledGoat.r);
    }
}

function RenderGoalPost(goalPost, context) {
    const scaledGoalPost = {
        x: goalPost.x * scalingRatio,
        y: goalPost.y * scalingRatio,
        r: goalPost.r * scalingRatio,
    };

    context.fillStyle = goalPost.color;
    context.beginPath();
    context.arc(scaledGoalPost.x, scaledGoalPost.y, scaledGoalPost.r, 0, 2 * Math.PI);
    context.fill();

    // Display scores on the goal posts
    context.font = `${scaledGoalPost.r / 3}px Verdana`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'white';

    const score = goalPost.numberOfGoatsTouched;
    const { x, y } = scaledGoalPost;
    const correction = scaledGoalPost.r / 2.5;
    // Hack to add the score 4 times, once for each quadrant
    context.fillText(score, x + correction, y + correction);
    context.fillText(score, x + correction, y - correction);
    context.fillText(score, x - correction, y + correction);
    context.fillText(score, x - correction, y - correction);
}

function RenderMouseTracker(input) {
    if (input.isKeyBasedMovement) {
        return;
    }

    const radius = 1;
    const x = input.mousePosition.x * scalingRatio;
    const y = input.mousePosition.y * scalingRatio;
    context.fillStyle = 'black';
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
}

function Render(world) {
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (GoatEnhancementHelpers.IsAnimationEnabled()) {
        spriteSheets['background'].draw(context, 0, 0, 0, 0, canvasElement.width, canvasElement.height);
    }

    for (const dogIndex in world.dogs) {
        RenderDog(world.dogs[dogIndex], context);
    }

    world.goats.forEach((goat) => {
        RenderGoat(goat, context);
    });

    world.goalPosts.forEach((goalPost) => {
        RenderGoalPost(goalPost, context);
    });

    if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
        RenderMouseTracker(input);
    }
}

function SetCanvasSize(canvasElement, gameDesiredDimensions) {
    let width = window.innerWidth - 50;
    let height = window.innerHeight - 150;

    const aspectRatio = gameDesiredDimensions.width / gameDesiredDimensions.height;
    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    // If the width is less than 10% of the desired width
    // revert to the server specified defaults
    if (width < 0.1 * gameDesiredDimensions.width) {
        width = gameDesiredDimensions.width;
        height = gameDesiredDimensions.height;
    }

    scalingRatio = width / gameDesiredDimensions.width;

    canvasElement.width = width;
    canvasElement.height = height;
}

function InitGameClient(board) {
    canvasElement.hidden = false;

    gameDesiredDimensions = board;
    SetCanvasSize(canvasElement, board);

    if (window.addEventListener) {
        window.addEventListener(
            'resize',
            function SetCanvasSizeCallback() {
                SetCanvasSize(canvasElement, gameDesiredDimensions);
            },
            true
        );
    }

    const lobbyElement = document.getElementById('lobbyElement');
    lobbyElement.hidden = true;
}

function GetMousePositionRelativeToElement(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
}

function ListenToGameInput() {
    document.addEventListener('keydown', function KeyDownCallback(event) {
        KeyEvent(event.keyCode, true);
    });

    document.addEventListener('keyup', function KeyUpCallback(event) {
        KeyEvent(event.keyCode, false);
    });

    if (GoatEnhancementHelpers.IsMouseInputEnabled()) {
        canvasElement.addEventListener('mousemove', function MouseMoveCallback(event) {
            const actualMousePosition = GetMousePositionRelativeToElement(event);
            input.mousePosition.x = actualMousePosition.x / scalingRatio;
            input.mousePosition.y = actualMousePosition.y / scalingRatio;
            input.isKeyBasedMovement = false;
        });

        setInterval(() => {
            if (!input.isKeyBasedMovement) {
                GameAdapter.SendMouseInputToGame(input.mousePosition);
            }
        }, 15);
    }
}

function AddDogToGameAndSetupInput() {
    const dogName = document.getElementById('dogNameElement').value;

    const teamSelectElement = document.getElementById('teamSelectElement');
    const teamSelectedIndex = teamSelectElement.selectedIndex;
    const teamId = teamSelectElement.options[teamSelectedIndex].value;

    GameAdapter.AddDogToGame(dogName, teamId);
    ListenToGameInput();
}

function InitGameAdapterAndClient() {
    GameAdapter.SetInitStatusCallback(InitGameClient);
    GameAdapter.SetRenderCallback(Render);

    GameAdapter.InitializeGameAdapter();
    GameAdapter.GameClientInitRequest();
}

function LobbyStart() {
    InitGameAdapterAndClient();
    AddDogToGameAndSetupInput();
}

// Exports
global.LobbyStart = LobbyStart;
