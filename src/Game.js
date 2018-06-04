export default class Game {
  constructor() {
    this.games = new Map()
  }

  getGame(channel) {
    const game = this.games.get(channel) || { waiting: true, users: [], data: {} }
    this.games.set(channel, game)
    return game
  }

  updateGame(channel) {
    const game = this.games.get(channel)

    if (game && game.users.length)
      this.games.delete(channel)
  }

  joinWait(channel, user) {
    this.getGame(channel).users.push(user)
  }

  leave(channel, user) {
    const game = this.getGame(channel)
    game.users = game.users.filter(u => u !== user)
    this.updateGame(channel)
  }
}
