import type { Redis as UpstashRedis } from '@upstash/redis'
import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit'

type RatelimiterOpts = {
	redis: UpstashRedis
	limiter: RatelimitConfig['limiter']

	prefix?: string
}

const createRatelimiter = ({ redis, limiter, prefix = '@auth' }: RatelimiterOpts): Ratelimit =>
	new Ratelimit({
		redis,
		prefix,
		limiter,
		analytics: true,
	})

export { createRatelimiter }
export type { RatelimiterOpts }
