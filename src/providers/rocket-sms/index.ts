import { SendProvider } from '~/interfaces/send'

import { RocketClient, type Credentials } from './client'

type DefaultUser = {
	phone: string
}

type RocketOptions<User extends DefaultUser> = {
	auth: Credentials
	template: (user: User, totp: string | number) => string
}

class RocketProvider<User extends DefaultUser> extends SendProvider<User> {
	protected client: RocketClient

	constructor(protected opts: RocketOptions<User>) {
		super(opts)
		this.client = new RocketClient(opts)
	}

	public async send(user: User, totp: string | number) {
		try {
			const phoneNumber =
				user.phone.at(0) === '+' ? user.phone.slice(1) : user.phone

			const data = await this.client.send(
				phoneNumber,
				this.opts.template(user, totp)
			)

			return { data: { id: data.id }, error: null }
		} catch (error: unknown) {
			return {
				data: null,
				error: { message: 'Something went wrong!' },
			}
		}
	}
}

export { RocketProvider }
export type { RocketOptions }
