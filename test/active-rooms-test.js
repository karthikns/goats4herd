var assert = require("assert");
var ActiveRooms = require("../src/server/active-rooms.js");


describe("ActiveRooms.CreateRoom", function () {
    describe("When a room is created", function () {
        it("Should have 1 player with roomName being player's name", function () {
            ActiveRooms.ClearRooms();
            let playerName = "bowwow";
            let socketId = "con1";    
            ActiveRooms.CreateRoom(socketId, playerName);
            let rooms = ActiveRooms.GetRoomStatus();
                        
            assert.equal(rooms.roomName, "bowwow");
            assert.equal(rooms.players.length, 1);
            assert.equal(rooms.players[0].teamId, 0);
            assert.equal(rooms.players[0].readyFlag, false);
            assert.equal(rooms.players[0].socketId, "con1");
        });
    });
});

describe("ActiveRooms.JoinRoom", function () {
    describe("When a room is created", function () {
        it("Can 1 player join another player's room", function () {
            ActiveRooms.ClearRooms();
            let playerName1 = "bowwow";
            let socketId1 = "con1";    
            ActiveRooms.CreateRoom(socketId1, playerName1);
            let playerName2 = "rover";
            let socketId2 = "con2";    
            ActiveRooms.JoinRoom(socketId2, playerName2);
            let rooms = ActiveRooms.GetRoomStatus();
                        
            assert.equal(rooms.roomName, "bowwow");
            assert.equal(rooms.players.length, 2);
            assert.equal(rooms.players[1].teamId, 1);
            assert.equal(rooms.players[1].readyFlag, false);
            assert.equal(rooms.players[1].socketId, "con2");
        });
    });

    describe("When a room is created", function () {
        it("Can 2 player join another player's room", function () {
            ActiveRooms.ClearRooms();
            //Player1
            let playerName1 = "bowwow";
            let socketId1 = "con1";    
            ActiveRooms.CreateRoom(socketId1, playerName1);
            //Player2
            let playerName2 = "rover";
            let socketId2 = "con2";    
            ActiveRooms.JoinRoom(socketId2, playerName2);
            //Player3
            let playerName3 = "puppyshek";
            let socketId3 = "con3";    
            const didplayerjoin = ActiveRooms.JoinRoom(socketId3, playerName3);
            let rooms = ActiveRooms.GetRoomStatus();
            assert.equal(rooms.players.length, 3);
            assert.equal(didplayerjoin, true);
            //Player4
            let playerName4 = "vishal";
            let socketId4 = "con4";
            const didlastplayerjoin = ActiveRooms.JoinRoom(socketId4, playerName4);
            
            assert.equal(rooms.players.length, 4);
            assert.equal(didlastplayerjoin, true);
            //Player5
            let playerName5 = "yanekadh";
            let socketId5 = "con5";
            const did5playerjoin = ActiveRooms.JoinRoom(socketId5, playerName5);
            
            assert.equal(rooms.players.length, 4);
            assert.equal(did5playerjoin, false);
        });
    });
});