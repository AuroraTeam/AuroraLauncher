export abstract class AbstractRequest {
    protected type: string

    abstract invoke(data: wsRequest): wsResponse | wsErrorResponse
}

export interface wsRequest {
    type: string
    uuid: uuidv4
    data: object
}

export interface wsResponse {
    uuid: uuidv4
    data: object
}

export interface wsErrorResponse {
    uuid: uuidv4
    code: number
    message: string
}

/**
 * Строка являющаяся валидным uuidv4 токеном
 */
type uuidv4 = string
