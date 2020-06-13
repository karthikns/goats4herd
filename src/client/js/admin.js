import io from "socket.io-client";

const socket = io({ reconnection: false });

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

// Exports
global.SetPassword = SetPassword;
global.ResetGoats = ResetGoats;
global.ResetScore = ResetScore;
global.ResetAll = ResetAll;
