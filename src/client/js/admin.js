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

var networkLatencyStartTime;
function CheckNetworkLatency() {
    networkLatencyStartTime = new Date();
    socket.emit("admin-ping", 0);
}

socket.on("admin-pong", function (number) {
    var networkLatencyStopTime = new Date();
    var networkLatency = networkLatencyStopTime - networkLatencyStartTime;

    var networkLatencyElement = document.getElementById(
        "networkLatencyDisplay"
    );

    networkLatencyElement.innerText = `${networkLatency} milliseconds`;
});
