import https from 'https'
import { Redis as UpstashRedis, type RedisConfigNodejs } from '@upstash/redis'

type RedisOptions = RedisConfigNodejs & {
	prefix?: string | undefined
	keepAlive?: boolean | undefined

	jwtExists?: number
	totpExists?: number
}

class Redis {
	public opts: RedisOptions
	public client: UpstashRedis

	constructor(_opts: RedisOptions) {
		const opts = {
			...DEFAULT_OPTIONS,
			..._opts,
		}

		this.opts = opts

		this.client = new UpstashRedis({
			url: opts.url,
			token: opts.token,
			cache: opts.cache,
			agent: new https.Agent({ keepAlive: opts.keepAlive }),
		})
	}

	private userJwtKey = (userId: string | number) => `redis:${this.opts.prefix}:jwt:${userId}`
	private userTotpKey = (userId: string | number) => `redis:${this.opts.prefix}:totp:${userId}`

	public setTotp = (userId: string, totp: string | number) =>
		this.client.set(this.userTotpKey(userId), totp, { ex: this.opts.totpExists || 120 })

	public getTotp = async (userId: string) => await this.client.get(this.userTotpKey(userId))

	public compareTotp = async (userId: string, totp: string | number) => {
		const storedTotp = await this.getTotp(userId)

		return storedTotp && String(totp) === String(storedTotp)
	}

	public setSession = (userId: string, token: string) =>
		this.client
			.multi()
			.del(this.userTotpKey(userId))
			.sadd(this.userJwtKey(userId), token)
			.exec()

	public checkSession = (userId: string, token: string) =>
		this.client.sismember(this.userJwtKey(userId), token)

	public getAllSessions = (userId: string) => this.client.smembers(this.userJwtKey(userId))

	public clearSession = (userId: string, token: string) =>
		this.client.srem(this.userJwtKey(userId), token)

	public clearAllSessions = (userId: string, token: string) => {
		const key = this.userJwtKey(userId)

		return this.client
			.multi()
			.del(key)
			.sadd(key, token)
			.exec()
			.then(([delResult, saddResult]) => Boolean(delResult && saddResult))
	}
}

const DEFAULT_OPTIONS = {
	prefix: 'user',
	cache: 'no-store',
	keepAlive: true,
} satisfies Partial<RedisOptions>

export { Redis }
export type { RedisOptions }
