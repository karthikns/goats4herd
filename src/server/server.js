var express = require("express");
var app = express();
var http = require("http").createServer(app);

app.use(express.static(__dirname + "/../client"));

var port = 3000;
http.listen(port, function() {
    console.log("Listening on port: " + port);
});
