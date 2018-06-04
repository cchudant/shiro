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
      .filter(G => settings.games.some(gg => gg === G.name))
      .map(G => new G(this))
	}

	// @command(new RegExp(`^${this.settings.command}$`))
	@command(/^game$/)
	async usage({ channel }) {
		await channel.send(
			`Usage: ${this.migi.settings.prefix}game [game]`
		)
		await channel.send(
			this.games.reduce((s, g) => (s += `- ${g.name}\n`), 'Game list:\n')
		)
	}

	// @command(new RegExp(`^${this.settings.command} ([a-zA-Z0-1_-]+)$`))
	@command(/^game ([a-zA-Z0-1_-]+)$/)
	join() {}
}
