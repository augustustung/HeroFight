class Player {
  constructor({ userId, username, address, balance, champion, isHost }) {
    this.playerId = userId;
    this.playerName = username;
    this.walletAddress = address;
    this.balance = balance;
    this.champion = champion;
    this.status = false; // false: not ready, true: is ready
    this.isHost = isHost;
  }
}

module.exports = Player;