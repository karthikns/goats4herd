import io from "socket.io-client";

const socket = io({ reconnection: false });

var password = "";

let txtPassword = document.getElementById("passwordElement"),
    btnPassword = document.getElementById("setPassword"),
    btnResetGoats = document.getElementById("resetGoats"),
    btnResetScore = document.getElementById("resetScore"),
    btnResetAll = document.getElementById("resetAll");

function SetPassword() {
    password = txtPassword.value;
    txtPassword.value = "";
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
