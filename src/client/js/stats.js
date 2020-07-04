import io from 'socket.io-client';

const socket = io({ reconnection: false });

socket.emit('stats-get-server-up-time');

socket.on('stats-return-server-up-time', function StatsServerReturnUpTime(serverUpTime) {
    const serverUpTimeElement = document.getElementById('serverUpTimeDisplay');
    serverUpTimeElement.innerText = `${serverUpTime}`;
});

let networkLatencyStartTime;
function CheckNetworkLatency() {
    networkLatencyStartTime = new Date();
    socket.emit('admin-ping', 0);
}

socket.on('admin-pong', function AdminPong() {
    const networkLatencyStopTime = new Date();
    const networkLatency = networkLatencyStopTime - networkLatencyStartTime;

    const networkLatencyElement = document.getElementById('networkLatencyDisplay');

    networkLatencyElement.innerText = `${networkLatency} milliseconds`;
});

// Exports
global.CheckNetworkLatency = CheckNetworkLatency;
