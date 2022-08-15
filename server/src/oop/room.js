class Room {
  constructor(id, name, players, isStart, deposit) {
    this.roomId = id;
    this.roomName = name;
    this.players = players;
    this.isStart = isStart;
    this.deposit = deposit
    this.countdownTime = 0;
    this.playerLoadCompleted = 0;
    this.timerId;
    this.fighter1;
    this.fighter2;
  }
}

module.exports = Room;