import { Resend } from 'resend'

import { SendProvider } from '~/interfaces/send'

type DefaultUser = {
	email: string
}

type ResendReactTemplateReturn = Exclude<
	Parameters<Resend['emails']['send']>[0]['react'],
	null | undefined
>

type ResendOptions<User extends DefaultUser> = {
	apiToken: string
	from: string
	subject: string | ((totp: string | number) => string)

	template: (user: User, totp: string | number) => ResendReactTemplateReturn
}

class ResendProvider<User extends DefaultUser> extends SendProvider<User> {
	protected client: Resend

	constructor(protected opts: ResendOptions<User>) {
		super(opts)
		this.client = new Resend(opts.apiToken)
	}

	public async send(user: User, totp: string | number) {
		const { data, error } = await this.client.emails.send({
			to: [user.email],
			cc: [user.email],
			bcc: [user.email],
			from: this.opts.from,
			subject:
				typeof this.opts.subject === 'function'
					? this.opts.subject(totp)
					: this.opts.subject,
			react: this.opts.template(user, totp),

			tags: [
				{
					name: 'security',
					value: 'one-time-password',
				},
			],
		})

		if (error || !data) {
			return { error: { message: error?.message || 'Something went wrong' } }
		}

		return { data: { id: data.id } }
	}
}

export { ResendProvider }
export type { ResendOptions }
