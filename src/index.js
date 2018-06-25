import { configurable, command, sendDiscordError } from '@popcorn.moe/migi'
import * as games from './games'
import * as embed from './embed'

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
	async usage(message) {
		const { content, channel, author } = message
		message.deletable && await message.delete()

		await channel.send(
			embed.info(
				this.games.reduce(
					(s, g) => (s += `- ${g.name}\n`),
					`${author}: Usage: ${content} <join|leave> ...\n\n**Game list:**\n`
				)
			)
		)
	}

	@command(/^game join$/)
	async joinUsage(message) {
		const { content, channel, author } = message
		message.deletable && await message.delete()

		const playing = this.playing.get(channel.id)
		if (!playing)
			return channel.send(
				embed.warn(
					`${author}: Use \`${content} [game]\` to create a waiting room.`
				)
			)

		const { started, waitingRoom, Game } = playing

		if (started)
			return channel.send(
				embed.err(`${author}: The game has already started!`)
			)

		waitingRoom.push(author)
		await channel.send(embed.info(`${author}: You joined \`${Game.name}\`!`))

		this.tryStart(channel) // don't return this promise
	}

	@command(/^game join ([a-zA-Z0-9_-]+)$/)
	async join(message, resGame) {
		const { author, channel } = message
		message.deletable && await message.delete()

		const Game = this.games.find(G => G.name === resGame)

		if (!Game)
			return channel.send(embed.err(`${author}: Cannot find this game.`))

		const { started = false, waitingRoom = [], Game: G } =
			this.playing.get(channel.id) || {}

		if (started)
			return channel.send(
				embed.err(`${author}: The game has already started!`)
			)

		if (G && G !== Game)
			return channel.send(
				embed.err(`${author}: A \`${G.name}\` game has already been choosen.`)
			)

		waitingRoom.push(author)
		this.playing.set(channel.id, { started, waitingRoom, Game })

		await channel.send(embed.info(`${author}: You joined \`${Game.name}\`!`))

		this.tryStart(channel) // don't return this promise
	}

	async tryStart(channel) {
		const { started, waitingRoom, Game } = this.playing.get(channel.id)

		if (started || waitingRoom.length !== Game.nPlayers) return

		const game = new Game(this)

		this.playing.set(channel.id, {
			started: true,
			game
		})

		try {
			await game.start(waitingRoom, channel)
		} catch (e) {
			sendDiscordError(channel, 'Error during the game', e)
		} finally {
			this.playing.delete(channel.id)
		}
	}

	@command(/^game leave$/)
	leave({ channel }, resGame) {}
}
