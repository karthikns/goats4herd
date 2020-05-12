var socket = io();

var password = "";

function SetPassword() {
    var passwordElement = document.getElementById("passwordElement");
    password = passwordElement.value;
    passwordElement.value = "";
}

function PopulateConnectionsList(connections) {
    let connectionsSelectElement = document.getElementById(
        "connectionsSelectElement"
    );

    while (connectionsSelectElement.hasChildNodes()) {
        connectionsSelectElement.removeChild(
            connectionsSelectElement.firstChild
        );
    }

    connections.forEach((connection) => {
        let realValue = connection;
        let displayValue = connection;
        connectionsSelectElement.options.add(
            new Option(realValue, displayValue)
        );
    });
}

socket.on("admin-connections-list", function (connections) {
    PopulateConnectionsList(connections);
});

function ResetGoats() {
    socket.emit("admin-reset-goats", password);
}

function ResetScore() {
    socket.emit("admin-reset-score", password);
}

function ResetAll() {
    socket.emit("admin-reset-all", password);
}

function GetConnectionList() {
    socket.emit("admin-get-connections-list");
}
