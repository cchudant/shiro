import { configurable, command } from '@popcorn.moe/migi'
import * as games from './games'

@configurable('game', {
	games: Object.keys(games)
})
export default class Shiro {
	constructor(migi, settings) {
		this.migi = migi
		this.settings = settings
		this.games = Object.values(games).filter(G =>
			settings.games.some(g => g === G.name)
		)

		//k = channel id; v = game data
		this.playing = new Map()
	}

	@command(/^game$/)
	async usage({ content, channel }) {
		await channel.send(`Usage: ${content} <join|leave> ...`)
		await channel.send(
			this.games.reduce((s, g) => (s += `- ${g.name}\n`), 'Game list:\n')
		)
	}

	@command(/^game join$/)
	async joinUsage({ content, channel, user }) {
		const playing = this.playing.get(channel.id)
		if (!playing)
			return channel.send(`Use \`${content} [game]\` to create a waiting room.`)

		const { started, waitingRoom, Game } = playing

		if (started) return channel.send(`The game has already started!`)

		waitingRoom.push(user)
		await channel.send(`You joined \`${Game.name}\`!`)

		return this.tryStart(channel)
	}

	@command(/^game join ([a-zA-Z0-9_-]+)$/)
	async join({ channel, author }, resGame) {
		const Game = this.games.find(G => G.name === resGame)

		if (!Game) return channel.send('Cannot find that game.')

		const { started = false, waitingRoom = [], Game: G } =
			this.playing.get(channel.id) || {}

		if (started) return channel.send(`The game has already started!`)

		if (G && G !== Game)
			return channel.send(`A \`${G.name}\` game has already been choosen.`)

		waitingRoom.push(author)
		this.playing.set(channel.id, { started, waitingRoom, Game })

		await channel.send(`You joined \`${Game.name}\`!`)

		return this.tryStart(channel)
	}

	async tryStart(channel) {
		const { started, waitingRoom, Game } = this.playing.get(channel.id)

		if (started || waitingRoom.length !== Game.nPlayers) return

		const game = new Game(this)
		game.on('end', () => this.playing.delete(channel.id))
		await game.start(waitingRoom, channel)

		this.playing.set(channel.id, {
			started: true,
			game
		})
	}

	@command(/^game leave$/)
	leave({ channel }, resGame) {}
}
