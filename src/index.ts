import type { SendProvider } from './services/send'

import { Totp, type TotpOptions } from './services/totp'
import { Redis, type RedisOptions } from './services/redis'
import { Jwt, type JwtOptions, type JwtPayload } from './services/jwt'

type AltrUser = {
	id: string
}

type AltrAuthConfig<User extends AltrUser> = {
	jwtOptions: JwtOptions
	totpOptions?: TotpOptions
	redisOptions: Omit<RedisOptions, 'jwtExists' | 'totpExists'>

	sendProvider: SendProvider<User>
}

const AltrAuth = <User extends AltrUser, Payload extends JwtPayload = JwtPayload>({
	jwtOptions,
	totpOptions,
	redisOptions,
	sendProvider,
}: AltrAuthConfig<User>) => {
	const _jwt = new Jwt<Payload>(jwtOptions)
	const _totp = new Totp(totpOptions)
	const _redis = new Redis({
		...redisOptions,
		jwtExists: jwtOptions.expiredIn,
		totpExists: totpOptions?.expiredIn || 120,
	})

	const methods = {
		sendTotp: async (user: User) => {
			try {
				const totp = _totp.generate()

				_redis.setTotp(user.id, totp)
				await sendProvider?.send(user, totp)

				return true
			} catch (_error) {
				return false
			}
		},

		verifyTotp: async (user: User, totp: string | number, payload: Payload) => {
			try {
				const isTotpEqual = await _redis.compareTotp(user.id, totp)

				if (!isTotpEqual) {
					throw new Error('TOTP did not match')
				}

				const token = await _jwt.signJwt(payload)

				if (!token) {
					return null
				}

				_redis.setSession(user.id, token)

				return { token }
			} catch (_error) {
				return null
			}
		},
		signOut: async (token: string, current: boolean = true) => {
			try {
				const payload = await _jwt.verifyJwt(token)

				if (!payload) {
					throw new Error('Session did not exists')
				}

				const clear = current ? _redis.clearSession : _redis.clearAllSessions

				return !!(await clear(payload.userId, token))
			} catch (_error) {
				return false
			}
		},
		getAllSessions: async (currentToken: string) => {
			try {
				const payload = await _jwt.verifyJwt(currentToken)

				if (!payload) {
					throw new Error('Session did not exists')
				}

				const tokens = await _redis.getAllSessions(payload.userId)

				const promises = tokens
					.filter((_token) => _token !== currentToken)
					.map((_token) => _jwt.verifyJwt(_token))

				const others = await Promise.all(promises).then((sessions) =>
					sessions
						.filter((_session) => !!_session)
						.sort((it1, it2) => (it1?.iat && it2?.iat ? it2?.iat - it1?.iat : 0)),
				)

				return {
					others,
					active: payload,
				}
			} catch (_error) {
				return null
			}
		},
	}

	const middleware = async (token?: string) => {
		try {
			if (!token) {
				throw new Error('Token is not presented')
			}

			const payload = await _jwt.verifyJwt(token)

			if (!payload) {
				const { userId } = _jwt.parseJwt(token)
				await _redis.clearSession(userId, token)

				throw new Error('JWT verify error')
			}

			const isSessionExists = await _redis.checkSession(payload.userId, token)

			if (!isSessionExists) {
				throw new Error('Session did not exists')
			}

			return payload
		} catch (_error) {
			return null
		}
	}

	return { methods, middleware, _redis, _jwt, _totp }
}

export { AltrAuth }
export type { AltrAuthConfig }

export { ConsoleProvider } from './providers/console'
export { ResendProvider, type ResendOptions } from './providers/resend'

export * from './services/jwt'
export * from './services/send'
export * from './services/totp'
export * from './services/redis'
