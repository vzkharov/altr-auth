import * as jose from 'jose'

type JwtPayload = jose.JWTPayload & {
	userId: string
}

type JwtOptions = {
	secret: string

	/**
	 * @description set expirationTime `Date.now()` + `expiredIn` (in seconds)
	 */
	expiredIn: number
}

class Jwt<T extends JwtPayload> {
	constructor(private opts: JwtOptions) {}

	public async signJwt(payload: T): Promise<string | null> {
		try {
			const currentDate = new Date()
			const expirationTimeInSeconds = Math.round(
				Number(currentDate.getTime() + this.opts.expiredIn) / 1000,
			)

			return new jose.SignJWT(payload)
				.setProtectedHeader({ b64: true, alg: 'HS256' })
				.setIssuedAt()
				.setExpirationTime(expirationTimeInSeconds)
				.sign(new TextEncoder().encode(this.opts.secret))
		} catch (error) {
			return null
		}
	}

	public async verifyJwt(token: string): Promise<T | null> {
		try {
			const { payload } = await jose.jwtVerify(
				token,
				new TextEncoder().encode(this.opts.secret),
			)
			return payload as T
		} catch (error) {
			return null
		}
	}

	public parseJwt(token: string): T {
		const base64Url = token.split('.')[1]
		const payload = Buffer.from(base64Url, 'base64').toString()

		return JSON.parse(payload) as T
	}
}

export { Jwt }
export type { JwtOptions, JwtPayload }
