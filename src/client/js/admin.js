var socket = io();

var password = "";

function SetPassword() {
    var passwordElement = document.getElementById("passwordElement");
    password = passwordElement.value;
    passwordElement.value = "";
}

function ResetGoats() {
    socket.emit("admin-reset-goats", password);
}

function ResetScore() {
    socket.emit("admin-reset-score", password);
}

function ResetAll() {
    socket.emit("admin-reset-all", password);
}
