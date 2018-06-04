import { configurable, command } from '@popcorn.moe/migi'
import * as games from './games'

@configurable('game', {
  games: Object.keys(games),
  // command: 'game'
})
export default class Shiro {
	constructor(migi, settings) {
		this.migi = migi
    this.settings = settings
    this.games = Object.values(games)
      .filter(G => settings.games.some(g => g === G.name))
    this.games = new Map()
	}

	// @command(new RegExp(`^${this.settings.command}$`))
	@command(/^game$/)
	async usage({ channel }) {
		await channel.send(
			`Usage: ${this.migi.settings.prefix}game <join|leave>`
		)
		await channel.send(
			this.games.reduce((s, g) => (s += `- ${g.name}\n`), 'Game list:\n')
		)
	}

	// @command(new RegExp(`^${this.settings.command} ([a-zA-Z0-1_-]+)$`))
	@command(/^game join ([a-zA-Z0-1_-]+)$/)
	join(message, resGame) {
    const game = this.games.find(g => g.name === resGame)

    if (!game)
      return message.channel.send('Impossible de trouver ce jeu.')
    
    game.joinWait()
  }
}
