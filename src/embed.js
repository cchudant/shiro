import { RichEmbed } from '@popcorn.moe/migi'

export function info(desc) {
	return new RichEmbed().setDescription(desc).setColor(0x0000ff)
}

export function warn(desc) {
	return new RichEmbed().setDescription(desc).setColor(0xffff00)
}

export function err(desc) {
	return new RichEmbed().setDescription(desc).setColor(0xff0000)
}
