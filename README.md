# goats4herd - A Goat Herding Game

## Game

https://goats4herd.herokuapp.com/

Note:

-   The game is optimized for desktop and currently requires a keyboard to play.
-   The Heroku deployment is located in the US. Consider deploying a server closer to you if you see a lot of lag. This is straightforward and described below.

## Custom Deployment

-   Install NodeJS.
-   Clone or download this repository.
-   On command line navigate to the root folder of the source code and run the following commands:
    -- npm install
-   -- npm start
-   Lauch a browser (Firefox/Chrome recommended) and navigate to:
    -- http://localhost:3000/

## Development

-   Build watch is supported via 'nodemon'. Run 'npm run build-watch' to restart local server automatically when source files change
-   Testing framework used is mocha. Run 'npm test' to run existing tests or 'npm run test-watch' for executing the tests when source files change
