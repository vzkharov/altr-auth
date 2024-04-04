import otp from 'otp-generator'

type TotpOptions = Parameters<typeof otp.generate>[1] & {
	count?: number

	/**
	 * @description set expirationTime `Date.now()` + `expiredIn` (in seconds)
	 */
	expiredIn?: number
}

class Totp {
	private opts: TotpOptions

	constructor(_opts?: TotpOptions) {
		this.opts = { ...DEFAULT_OPTIONS, ..._opts }
	}

	public generate() {
		return otp.generate(this.opts.count, this.opts)
	}
}

const DEFAULT_OPTIONS = {
	count: 6,
	digits: true,
	specialChars: false,
	lowerCaseAlphabets: false,
	upperCaseAlphabets: false,
} satisfies TotpOptions

export { Totp }
export type { TotpOptions }
