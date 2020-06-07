import io from 'socket.io-client';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });

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

btnPassword.addEventListener('click', SetPassword);
btnResetGoats.addEventListener('click', ResetGoats);
btnResetScore.addEventListener('click', ResetScore);
btnResetAll.addEventListener('click', ResetAll);
