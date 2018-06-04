import Game from '../Game'

export default class Connect4 extends Game {
  constructor(module) {
    super()
    this.module = module
  }

  get maxPlayers() {
    return 2
  }

  get minPlayers() {
    return 2
  }
}
