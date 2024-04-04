type DataResponse = {
	id: string
	[key: string]: any
}

type ErrorResponse = {
	message: string
	[key: string]: any
}

type MethodResponse<D, E> = {
	data?: D | null | undefined
	error?: E | null | undefined
}

type CreateResponse = MethodResponse<DataResponse, ErrorResponse>

type SendOptions = {}

abstract class SendProvider<User, Opts extends SendOptions = SendOptions> {
	protected client: unknown
	constructor(protected opts: Opts) {}

	public abstract send(user: User, totp: string | number): Promise<CreateResponse>
}

export { SendProvider }
export type { SendOptions }
