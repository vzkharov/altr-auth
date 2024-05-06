import { createHash } from 'node:crypto'

type Credentials = {
	username: string
	password: string
}

type Options = {
	auth: Credentials
}

class RocketClient {
	private credentials: Credentials

	constructor(opts: Options) {
		const { auth } = opts
		this.credentials = auth
	}

	public async send(phone: string, text: string) {
		const body = {
			text,
			phone,
			username: this.credentials.username,
			password: createHash('md5').update(this.credentials.password).digest('hex'),
		}

		return fetch(RocketClient.getUrl('/simple/send'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(body),
		})
			.then((res) => res.json())
			.then((json) => {
				if (json?.error) {
					throw new Error('Send error while send to the phonenumber!')
				}

				return json
			})
			.catch((_err) => {
				throw new Error('Send error while send to the phonenumber!')
			})
	}

	static baseUrl = 'https://api.rocketsms.by'
	static getUrl = (path: string) => [this.baseUrl, path].join('')
}

export { RocketClient }
export type { Options, Credentials }
