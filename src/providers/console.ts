import { SendProvider, type SendOptions } from '~/services/send'

type DefaultUser = {
	email?: string
	phone?: string
}

class ConsoleProvider<User extends DefaultUser> extends SendProvider<User> {
	protected client: unknown = null

	constructor(protected opts: SendOptions) {
		super(opts)
	}

	public async send(user: User, totp: string | number) {
		console.log(
			'>>',
			`\x1b[36m${user.email || user.phone}\x1b[0m`,
			'→',
			`\x1b[32m${totp}\x1b[0m`,
		)

		return { data: { id: global.crypto.randomUUID() } }
	}
}

export { ConsoleProvider }
