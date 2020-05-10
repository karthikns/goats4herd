var socket = io();

function ResetGoats() {
    socket.emit("admin-reset-goats");
}

function ResetScore() {
    socket.emit("admin-reset-score");
}

function ResetAll() {
    socket.emit("admin-reset-all");
}
