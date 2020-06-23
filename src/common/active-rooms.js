

var ActiveRooms = {};
module.exports = ActiveRooms;

(function () {
   
    var rooms = {
        roomName: "",
        players: [],
    };

    //var player = {playerName, teamId, readyFlag, socketId}
    ActiveRooms.CreateRoom = function (socketId, playerName) {
        rooms.roomName = playerName;
        let player = {
            playerName: playerName,
            teamId: 0,
            readyFlag: false,
            socketId: socketId,
        }
        rooms.players.push(player);        
    };
    
    //name and socketId
    ActiveRooms.JoinRoom = function (socketId, playerName) {
        
        if(rooms.players.length == 4){
            return false;
        }
        else{
            let player = {
                playerName: playerName,
                teamId: rooms.players.length,
                readyFlag: false,
                socketId: socketId,
            }
            rooms.players.push(player);
            return true;
        }
    };

    ActiveRooms.GetRoomStatus = function () {
        return rooms;
    };
    //
    ActiveRooms.StartGame = function () {

    };

    //
    ActiveRooms.LeaveRoom = function () {

    };

    //
    ActiveRooms.PlayerReady = function () {

    };

    ActiveRooms.ClearRooms = function () {
        rooms.roomName = "";
        rooms.players = [];
    };

})();
