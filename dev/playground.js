import Migi, { command, on, react } from '@popcorn.moe/migi'
import Game from '../src'

const migi = new Migi({
	root: __dirname
})

migi.loadModule(Game)

migi.on('ready', () => console.log(`Ready @${migi.user.tag}`))

migi.login(process.env.DISCORD_TOKEN)

process.on('unhandledRejection', e => console.error(e))